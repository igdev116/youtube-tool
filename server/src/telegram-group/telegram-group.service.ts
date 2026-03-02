import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TelegramGroup, TelegramGroupDocument } from './telegram-group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  YoutubeChannel,
  YoutubeChannelDocument,
} from '../modules/youtube-channel/youtube-channel.schema';

@Injectable()
export class TelegramGroupService {
  constructor(
    @InjectModel(TelegramGroup.name)
    private readonly groupModel: Model<TelegramGroupDocument>,
    @InjectModel(YoutubeChannel.name)
    private readonly channelModel: Model<YoutubeChannelDocument>,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    const group = await this.groupModel.create({
      ...dto,
      user: new Types.ObjectId(userId),
    });
    return group;
  }

  async getUserGroups(userId: string) {
    const userObjectId = new Types.ObjectId(userId);
    const groups = await this.groupModel
      .find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Attach channel count for each group
    const groupIds = groups.map((g) => g._id);
    const channelCounts = await this.channelModel.aggregate([
      { $match: { groups: { $in: groupIds }, user: userObjectId } },
      { $unwind: '$groups' },
      { $match: { groups: { $in: groupIds } } },
      { $group: { _id: '$groups', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      channelCounts.map((c) => [String(c._id), c.count]),
    );

    return groups.map((g) => ({
      ...g,
      channelCount: countMap.get(String(g._id)) ?? 0,
    }));
  }

  async getGroupById(userId: string, groupId: string) {
    const group = await this.groupModel
      .findOne({
        _id: new Types.ObjectId(groupId),
        user: new Types.ObjectId(userId),
      })
      .lean()
      .exec();
    if (!group) throw new NotFoundException('Group không tồn tại');
    return group;
  }

  async updateGroup(userId: string, groupId: string, dto: UpdateGroupDto) {
    const group = await this.groupModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(groupId),
        user: new Types.ObjectId(userId),
      },
      { $set: dto },
      { new: true },
    );
    if (!group) throw new NotFoundException('Group không tồn tại');
    return group;
  }

  async deleteGroup(userId: string, groupId: string) {
    const groupObjectId = new Types.ObjectId(groupId);
    const result = await this.groupModel.deleteOne({
      _id: groupObjectId,
      user: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0)
      throw new NotFoundException('Group không tồn tại');

    // Cascade: xóa reference khỏi tất cả channels
    await this.channelModel.updateMany(
      { groups: groupObjectId },
      { $pull: { groups: groupObjectId } },
    );

    return { success: true };
  }

  /**
   * Lấy tất cả channels của group này (dành cho Group Detail page)
   */
  async getGroupChannels(userId: string, groupId: string) {
    const groupObjectId = new Types.ObjectId(groupId);
    const userObjectId = new Types.ObjectId(userId);

    // Verify group belongs to user
    const group = await this.groupModel.findOne({
      _id: groupObjectId,
      user: userObjectId,
    });
    if (!group) throw new NotFoundException('Group không tồn tại');

    return this.channelModel
      .find({ groups: groupObjectId, user: userObjectId })
      .lean()
      .exec();
  }

  /**
   * Dùng trong WebSub notification: lấy tất cả groups của channel (qua populate)
   */
  async getGroupsByChannelId(userId: Types.ObjectId, channelId: string) {
    const channel = await this.channelModel
      .findOne({ channelId, user: userId })
      .populate('groups')
      .lean()
      .exec();

    if (!channel || !channel.groups || channel.groups.length === 0) return [];
    return channel.groups as TelegramGroup[];
  }
}
