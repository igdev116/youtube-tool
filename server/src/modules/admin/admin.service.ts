import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
} from '../youtube-channel/youtube-channel.schema';
import { User, UserDocument } from '../../user/user.schema';
import { GetUsersDto } from './dto/get-users.dto';
import { UserAdminResponseDto } from './dto/user-admin-response.dto';
import { paginateWithPage } from '../../utils/pagination.util';
import { GetUserChannelsDto } from './dto/get-user-channels.dto';
import { PagingResponseV2 } from '../../types/common.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
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

    return {
      success: true,
      message: 'Thống kê channels',
      result: {
        totalChannels,
        activeChannels,
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
   * Lấy danh sách users với số lượng channels
   */
  async getUsersList(params: GetUsersDto) {
    const { page = 1, limit = 10, keyword } = params;
    const skip = (page - 1) * limit;

    // Build search filter
    const searchFilter: any = {};
    if (keyword) {
      searchFilter.username = { $regex: keyword, $options: 'i' };
    }

    // Aggregate to get users with channel count
    const usersWithCount = await this.userModel.aggregate([
      { $match: searchFilter },
      {
        $lookup: {
          from: 'youtubechannels',
          localField: '_id',
          foreignField: 'user',
          as: 'channels',
        },
      },
      {
        $addFields: {
          channelCount: { $size: '$channels' },
        },
      },
      {
        $project: {
          channels: 0, // Don't include full channel data
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const total = await this.userModel.countDocuments(searchFilter);

    return {
      success: true,
      message: 'Lấy danh sách users thành công',
      result: {
        content: usersWithCount as UserAdminResponseDto[],
        paging: {
          total,
          hasMore: skip + limit < total,
        },
      },
    };
  }

  /**
   * Lấy thông tin chi tiết một user kèm số lượng channels
   */
  async getUserById(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const users = await this.userModel.aggregate([
      { $match: { _id: userObjectId } },
      {
        $lookup: {
          from: 'youtubechannels',
          localField: '_id',
          foreignField: 'user',
          as: 'channels',
        },
      },
      {
        $addFields: {
          channelCount: { $size: '$channels' },
        },
      },
      {
        $project: {
          channels: 0,
        },
      },
    ]);

    return users[0] || null;
  }

  /**
   * Lấy danh sách channels của một user (phân trang)
   */
  async getUserChannels(
    userId: string,
    params: GetUserChannelsDto,
  ): Promise<PagingResponseV2<any>> {
    const { page = 1, limit = 10, keyword } = params;
    const userObjectId = new Types.ObjectId(userId);

    const query: any = { user: userObjectId };
    if (keyword) {
      query.channelId = { $regex: keyword, $options: 'i' };
    }

    const result = await paginateWithPage(
      this.channelModel,
      query,
      page,
      limit,
      { createdAt: -1 },
    );

    return {
      ...result,
      message: 'Lấy danh sách channels thành công',
    };
  }

  /**
   * Xóa user và toàn bộ channels liên quan
   */
  async deleteUser(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    // Xóa tất cả channels của user
    const channelResult = await this.channelModel.deleteMany({
      user: userObjectId,
    });

    // Xóa user
    const userResult = await this.userModel.deleteOne({ _id: userId });

    console.log(
      `🗑️ Admin đã xóa user ${userId} và ${channelResult.deletedCount} channels`,
    );

    return {
      success: true,
      message: `Đã xóa user và ${channelResult.deletedCount} channels liên quan`,
      deletedChannels: channelResult.deletedCount,
      deletedUser: userResult.deletedCount,
    };
  }

  /**
   * Xóa một channel cụ thể của user
   */
  async deleteUserChannel(userId: string, channelId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const channelObjectId = new Types.ObjectId(channelId);

    const deleted = await this.channelModel.findOneAndDelete({
      _id: channelObjectId,
      user: userObjectId,
    });

    if (deleted) {
      console.log(`🗑️ Admin đã xóa channel ${channelId} của user ${userId}`);
      return {
        success: true,
        message: 'Đã xóa channel thành công',
      };
    }

    return {
      success: false,
      message: 'Không tìm thấy channel hoặc channel không thuộc về user này',
    };
  }
  /**
   * Migrate field user từ string sang ObjectId cho toàn bộ channels
   */
  async migrateUserFieldToObjectId() {
    // Tìm các channel mà field user đang là kiểu string
    const channels = await this.channelModel
      .find({
        user: { $type: 'string' },
      })
      .lean();

    let migratedCount = 0;
    for (const channel of channels) {
      const userStr = channel.user as unknown as string;
      if (Types.ObjectId.isValid(userStr)) {
        await this.channelModel.updateOne(
          { _id: channel._id },
          { $set: { user: new Types.ObjectId(userStr) } },
        );
        migratedCount++;
      }
    }

    console.log(`🚀 Đã migrate ${migratedCount} channels sang ObjectId`);
    return {
      success: true,
      message: `Đã migrate thành công ${migratedCount} channels`,
      count: migratedCount,
    };
  }
}
