import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TelegramGroup, TelegramGroupDocument } from './telegram-group.schema';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class TelegramGroupService {
  constructor(
    @InjectModel(TelegramGroup.name)
    private readonly groupModel: Model<TelegramGroupDocument>,
  ) {}

  async createGroup(userId: string, dto: CreateGroupDto) {
    const group = await this.groupModel.create({
      ...dto,
      channelIds: dto.channelIds ?? [],
      user: new Types.ObjectId(userId),
    });
    return group;
  }

  async getUserGroups(userId: string) {
    return this.groupModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
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
    const result = await this.groupModel.deleteOne({
      _id: new Types.ObjectId(groupId),
      user: new Types.ObjectId(userId),
    });
    if (result.deletedCount === 0)
      throw new NotFoundException('Group không tồn tại');
    return { success: true };
  }

  async addChannels(userId: string, groupId: string, channelIds: string[]) {
    const group = await this.groupModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(groupId),
        user: new Types.ObjectId(userId),
      },
      { $addToSet: { channelIds: { $each: channelIds } } },
      { new: true },
    );
    if (!group) throw new NotFoundException('Group không tồn tại');
    return group;
  }

  async removeChannel(userId: string, groupId: string, channelId: string) {
    const group = await this.groupModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(groupId),
        user: new Types.ObjectId(userId),
      },
      { $pull: { channelIds: channelId } },
      { new: true },
    );
    if (!group) throw new NotFoundException('Group không tồn tại');
    return group;
  }

  /**
   * Lấy tất cả groups của user có chứa channelId này
   */
  async getGroupsByChannelId(userId: Types.ObjectId, channelId: string) {
    return this.groupModel
      .find({
        user: userId,
        channelIds: channelId,
      })
      .lean()
      .exec();
  }
}
