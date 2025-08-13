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
}
