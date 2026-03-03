"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramGroupService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const telegram_group_schema_1 = require("./telegram-group.schema");
const youtube_channel_schema_1 = require("../modules/youtube-channel/youtube-channel.schema");
let TelegramGroupService = class TelegramGroupService {
    groupModel;
    channelModel;
    constructor(groupModel, channelModel) {
        this.groupModel = groupModel;
        this.channelModel = channelModel;
    }
    async createGroup(userId, dto) {
        const group = await this.groupModel.create({
            ...dto,
            user: new mongoose_2.Types.ObjectId(userId),
        });
        return group;
    }
    async getUserGroups(userId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const groups = await this.groupModel
            .find({ user: userObjectId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const groupIds = groups.map((g) => g._id);
        const channelCounts = await this.channelModel.aggregate([
            { $match: { groups: { $in: groupIds }, user: userObjectId } },
            { $unwind: '$groups' },
            { $match: { groups: { $in: groupIds } } },
            { $group: { _id: '$groups', count: { $sum: 1 } } },
        ]);
        const countMap = new Map(channelCounts.map((c) => [String(c._id), c.count]));
        return groups.map((g) => ({
            ...g,
            channelCount: countMap.get(String(g._id)) ?? 0,
        }));
    }
    async getGroupById(userId, groupId) {
        const group = await this.groupModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(groupId),
            user: new mongoose_2.Types.ObjectId(userId),
        })
            .lean()
            .exec();
        if (!group)
            throw new common_1.NotFoundException('Group không tồn tại');
        return group;
    }
    async updateGroup(userId, groupId, dto) {
        const group = await this.groupModel.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(groupId),
            user: new mongoose_2.Types.ObjectId(userId),
        }, { $set: dto }, { new: true });
        if (!group)
            throw new common_1.NotFoundException('Group không tồn tại');
        return group;
    }
    async deleteGroup(userId, groupId) {
        const groupObjectId = new mongoose_2.Types.ObjectId(groupId);
        const result = await this.groupModel.deleteOne({
            _id: groupObjectId,
            user: new mongoose_2.Types.ObjectId(userId),
        });
        if (result.deletedCount === 0)
            throw new common_1.NotFoundException('Group không tồn tại');
        await this.channelModel.updateMany({ groups: groupObjectId }, { $pull: { groups: groupObjectId } });
        return { success: true };
    }
    async getGroupChannels(userId, groupId) {
        const groupObjectId = new mongoose_2.Types.ObjectId(groupId);
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const group = await this.groupModel.findOne({
            _id: groupObjectId,
            user: userObjectId,
        });
        if (!group)
            throw new common_1.NotFoundException('Group không tồn tại');
        return this.channelModel
            .find({ groups: groupObjectId, user: userObjectId })
            .lean()
            .exec();
    }
    async getGroupsByChannelId(userId, channelId) {
        const channel = await this.channelModel
            .findOne({ channelId, user: userId })
            .populate('groups')
            .lean()
            .exec();
        if (!channel || !channel.groups || channel.groups.length === 0)
            return [];
        return channel.groups;
    }
};
exports.TelegramGroupService = TelegramGroupService;
exports.TelegramGroupService = TelegramGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(telegram_group_schema_1.TelegramGroup.name)),
    __param(1, (0, mongoose_1.InjectModel)(youtube_channel_schema_1.YoutubeChannel.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], TelegramGroupService);
//# sourceMappingURL=telegram-group.service.js.map