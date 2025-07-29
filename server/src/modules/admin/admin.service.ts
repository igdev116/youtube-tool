import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
} from '../youtube-channel/youtube-channel.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
  ) {}

  /**
   * Xóa tất cả channels trong database
   */
  async deleteAllChannels() {
    const result = await this.channelModel.deleteMany({});

    console.log(`🗑️ Admin đã xóa ${result.deletedCount} channels`);
    return {
      success: true,
      message: `Đã xóa ${result.deletedCount} channels`,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Lấy thống kê channels
   */
  async getChannelStats() {
    const totalChannels = await this.channelModel.countDocuments({});
    const activeChannels = await this.channelModel.countDocuments({
      isActive: true,
    });
    const channelsWithErrors = await this.channelModel.countDocuments({
      errors: { $exists: true, $ne: [] },
    });

    return {
      success: true,
      message: 'Thống kê channels',
      result: {
        totalChannels,
        activeChannels,
        channelsWithErrors,
        inactiveChannels: totalChannels - activeChannels,
      },
    };
  }

  /**
   * Reset tất cả lastVideoId và lastVideoAt của tất cả channels
   */
  async resetAllLastVideoId() {
    const result = await this.channelModel.updateMany(
      {},
      {
        $unset: { lastVideoId: 1, lastVideoAt: 1 },
      },
    );

    console.log(
      `🔄 Admin đã reset lastVideoId cho ${result.modifiedCount} channels`,
    );
    return {
      success: true,
      message: `Đã reset lastVideoId cho ${result.modifiedCount} channels`,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Xóa tất cả channels có field errors không rỗng
   */
  async deleteAllChannelsWithErrors() {
    const result = await this.channelModel.deleteMany({
      errors: { $exists: true, $ne: [] }, // Có field errors và không rỗng
    });

    console.log(`🗑️ Admin đã xóa ${result.deletedCount} channels có lỗi`);
    return {
      success: true,
      message: `Đã xóa ${result.deletedCount} channels có lỗi`,
      deletedCount: result.deletedCount,
    };
  }
}
