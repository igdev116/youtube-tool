import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
} from '../youtube-channel/youtube-channel.schema';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
import {
  HUB_SUBSCRIBE_URL,
  YT_THUMBNAIL_HQ,
  YT_WATCH_BASE,
} from '../../constants';
import {
  HUB_LEASE_SECONDS,
  WEB_SUB_RENEW_BEFORE_SECONDS,
  YT_FEED_BASE as FEED_BASE,
} from '../../constants';

@Injectable()
export class YoutubeWebsubService {
  private readonly logger = new Logger(YoutubeWebsubService.name);

  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    private readonly telegramBotService: TelegramBotService,
  ) {}

  // Parser XML đơn giản cho WebSub (không phụ thuộc thư viện)
  private extractEntries(xml: string): string[] {
    const entries: string[] = [];
    const re = /<entry[\s\S]*?<\/entry>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(xml)) !== null) {
      entries.push(m[0]);
    }
    return entries;
  }

  private extractTag(content: string, tag: string): string | null {
    const m = content.match(new RegExp(`<${tag}>([^<]*?)</${tag}>`));
    return m ? m[1] : null;
  }

  private extractNsTag(content: string, nsTag: string): string | null {
    const m = content.match(new RegExp(`<${nsTag}>([^<]*?)</${nsTag}>`));
    return m ? m[1] : null;
  }

  async handleNotification(xml: string) {
    try {
      const entries = this.extractEntries(xml);

      if (entries.length === 0) {
        this.logger.debug('WebSub: no entry found');
        return;
      }

      for (const entry of entries) {
        const videoId =
          this.extractNsTag(entry, 'yt:videoId') ||
          this.extractTag(entry, 'yt:videoId');
        const xmlChannelId =
          this.extractNsTag(entry, 'yt:channelId') ||
          this.extractTag(entry, 'yt:channelId');
        const title = this.extractTag(entry, 'title') || '';
        const publishedAt = this.extractTag(entry, 'published') || '';
        const thumbnail = YT_THUMBNAIL_HQ(videoId || '');
        // Extract author info (channel name and uri)
        const authorBlockMatch = entry.match(/<author[\s\S]*?<\/author>/);
        const authorBlock = authorBlockMatch ? authorBlockMatch[0] : '';
        const channelName = authorBlock
          ? this.extractTag(authorBlock, 'name') || ''
          : '';
        const channelUrl = authorBlock
          ? this.extractTag(authorBlock, 'uri') || ''
          : '';

        if (!videoId || !xmlChannelId) continue;

        // Tìm tất cả kênh theo xmlChannelId, populate groups
        const channels = await this.channelModel
          .find({ xmlChannelId: xmlChannelId, isActive: true })
          .populate('groups')
          .lean()
          .exec();

        const channelPromises = channels.map(async (ch) => {
          const videoPublishedAt = new Date(publishedAt);
          const lastVideoAt = ch.lastVideoAt;

          if (lastVideoAt && videoPublishedAt <= lastVideoAt) {
            this.logger.debug(
              `Skip video ${videoId} - published at ${videoPublishedAt.toISOString()} is not newer than last video at ${lastVideoAt.toISOString()}`,
            );
            return null;
          }

          const groups = (ch.groups || []) as any[];

          if (groups.length === 0) return null;

          // Gửi thông báo đến tất cả groups
          let anySent = false;
          for (const group of groups) {
            try {
              await this.telegramBotService.sendNewVideoToGroup(
                group.groupId,
                {
                  title,
                  url: `${YT_WATCH_BASE}${videoId}`,
                  channelId: ch.channelId,
                  channelName,
                  channelUrl,
                  thumbnail,
                  publishedAt,
                  avatarId: ch.avatarId,
                },
                group.botToken,
              );
              anySent = true;
            } catch (e) {
              const err = e as Error;
              this.logger.error(
                `Send to group ${group.name} (${group.groupId}) failed for channel ${ch.channelId}: ${err.message}`,
              );
            }
          }

          // Chỉ update lastVideoId/lastVideoAt khi ít nhất 1 group gửi thành công
          if (anySent) {
            await this.channelModel.updateOne(
              { _id: ch._id },
              {
                $set: {
                  lastVideoId: videoId,
                  lastVideoAt: videoPublishedAt,
                },
              },
            );
          }

          return { success: anySent, channelId: ch.channelId };
        });

        // Xử lý song song tất cả channels
        const results = await Promise.all(channelPromises);

        // Log kết quả
        const successCount = results.filter((r) => r?.success).length;
        const failCount = results.filter((r) => r && !r.success).length;

        if (successCount > 0 || failCount > 0) {
          this.logger.log(
            `Video ${videoId}: ${successCount} thành công, ${failCount} thất bại`,
          );
        }
      }
    } catch (err) {
      this.logger.error(`WebSub handle failed: ${(err as Error).message}`);
    }
  }

  // Helper: tạo form subscribe (topic là feed RSS của channel)
  async subscribeCallback(
    topicUrl: string,
    callbackUrl: string,
    leaseSeconds?: number,
  ) {
    const form = new URLSearchParams();
    form.append('hub.mode', 'subscribe');
    form.append('hub.topic', topicUrl);
    form.append('hub.callback', callbackUrl);
    form.append('hub.verify', 'sync');
    form.append('hub.verify_token', 'test-token');
    if (leaseSeconds && leaseSeconds > 0) {
      form.append('hub.lease_seconds', String(leaseSeconds));
    }

    const res = await axios.post(HUB_SUBSCRIBE_URL, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.status;
  }

  // Helper: hủy đăng ký (unsubscribe) khỏi topic
  async unsubscribeCallback(topicUrl: string, callbackUrl: string) {
    const form = new URLSearchParams();
    form.append('hub.mode', 'unsubscribe');
    form.append('hub.topic', topicUrl);
    form.append('hub.callback', callbackUrl);
    form.append('hub.verify', 'sync');
    form.append('hub.verify_token', 'test-token');

    const res = await axios.post(HUB_SUBSCRIBE_URL, form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return res.status;
  }

  // Cron: mỗi giờ kiểm tra và gia hạn những subscription sắp hết hạn trong 2 ngày
  @Cron(CronExpression.EVERY_HOUR)
  async renewExpiringSubscriptions() {
    try {
      const now = Date.now();
      const thresholdMs = WEB_SUB_RENEW_BEFORE_SECONDS * 1000;
      const leaseMs = HUB_LEASE_SECONDS * 1000;

      // Lấy các channel có lastSubscribeAt cũ hơn now - (lease - threshold)
      const needRenew = await this.channelModel
        .find({
          lastSubscribeAt: { $exists: true },
        })
        .lean()
        .exec();

      const candidates = (needRenew || []).filter((c) => {
        const last = c.lastSubscribeAt
          ? new Date(c.lastSubscribeAt).getTime()
          : 0;
        return last > 0 && now - last >= leaseMs - thresholdMs;
      });

      if (candidates.length === 0) return;

      await Promise.all(
        candidates.map(async (c: any) => {
          try {
            const topicUrl = `${FEED_BASE}?channel_id=${c.xmlChannelId}`;
            const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
            await this.subscribeCallback(
              topicUrl,
              callbackUrl,
              HUB_LEASE_SECONDS,
            );
            await this.channelModel.updateOne(
              { _id: c._id },
              { $set: { lastSubscribeAt: new Date() } },
            );
          } catch (err) {
            this.logger.error(
              `Renew subscribe failed for ${c.channelId}: ${(err as Error).message}`,
            );
          }
        }),
      );
    } catch (err) {
      this.logger.error(`Renew cron failed: ${(err as Error).message}`);
    }
  }

  async unsubscribeAllChannels() {
    try {
      const channels = await this.channelModel.find().lean().exec();
      const results: any[] = [];

      await Promise.all(
        channels.map(async (c: any) => {
          try {
            if (!c.xmlChannelId) return;
            const topicUrl = `${FEED_BASE}?channel_id=${c.xmlChannelId}`;
            const callbackUrl = `${process.env.API_URL}/websub/youtube/callback`;
            const status = await this.unsubscribeCallback(topicUrl, callbackUrl);
            results.push({ channelId: c.channelId, success: status >= 200 && status < 300, status });
          } catch (err) {
            this.logger.error(
              `Unsubscribe failed for ${c.channelId}: ${(err as Error).message}`,
            );
            results.push({ channelId: c.channelId, success: false, error: (err as Error).message });
          }
        }),
      );

      return results;
    } catch (err) {
      this.logger.error(`unsubscribeAllChannels failed: ${(err as Error).message}`);
      throw err;
    }
  }
}
