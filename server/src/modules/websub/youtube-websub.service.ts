import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
import { User } from '~/user/user.schema';

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
    // Ví dụ nsTag = 'yt:videoId' hoặc 'media:thumbnail'
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

        // Tìm tất cả kênh theo xmlChannelId
        const channels = await this.channelModel
          .find({ xmlChannelId: xmlChannelId, isActive: true })
          .populate('user')
          .exec();

        for (const ch of channels) {
          const user = ch.user as User;
          const groupId = user?.telegramGroupId;
          const botToken = user?.botToken;
          if (!groupId || !botToken) continue;

          try {
            // Gửi ngay telegram bằng bot token của user
            await this.telegramBotService.sendNewVideoToGroup(
              groupId,
              {
                title,
                url: `${YT_WATCH_BASE}${videoId}`,
                channelId: ch.channelId,
                channelName,
                channelUrl,
                thumbnail,
                publishedAt,
              },
              botToken,
            );

            // Chỉ update DB khi gửi thành công
            await this.channelModel.updateOne(
              { _id: ch._id },
              {
                $set: {
                  lastVideoId: videoId,
                  lastVideoAt: new Date(publishedAt),
                },
              },
            );
          } catch (e) {
            const err = e as Error;
            this.logger.error(`Send or update failed: ${err.message}`);
          }
        }
      }
    } catch (err) {
      const e = err as Error;
      this.logger.error(`WebSub handle failed: ${e.message}`);
    }
  }

  // Helper: tạo form subscribe (topic là feed RSS của channel)
  async subscribeCallback(topicUrl: string, callbackUrl: string) {
    const form = new URLSearchParams();
    form.append('hub.mode', 'subscribe');
    form.append('hub.topic', topicUrl);
    form.append('hub.callback', callbackUrl);
    form.append('hub.verify', 'sync');
    form.append('hub.verify_token', 'test-token');

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
}
