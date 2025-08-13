import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  async createUser(username: string, password: string) {
    const user = new this.userModel({ username, password });
    return user.save();
  }

  async updateTelegramGroupId(userId: string, groupId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { telegramGroupId: groupId },
      { new: true },
    );
  }

  async getProfile(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }

  async updateBotToken(userId: string, botToken: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { botToken },
      { new: true },
    );
  }

  async getFavoriteChannels(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteChannelIds');
    return user?.favoriteChannelIds ?? [];
  }

  async addFavoriteChannel(userId: string, channelId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { favoriteChannelIds: channelId } },
      { new: true },
    );
  }

  async removeFavoriteChannel(userId: string, channelId: string) {
    return this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { favoriteChannelIds: channelId } },
      { new: true },
    );
  }
}
