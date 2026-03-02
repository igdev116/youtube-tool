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
let TelegramGroupService = class TelegramGroupService {
    groupModel;
    constructor(groupModel) {
        this.groupModel = groupModel;
    }
    async createGroup(userId, dto) {
        const group = await this.groupModel.create({
            ...dto,
            channelIds: dto.channelIds ?? [],
            user: new mongoose_2.Types.ObjectId(userId),
        });
        return group;
    }
    async getUserGroups(userId) {
        return this.groupModel
            .find({ user: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
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
        const result = await this.groupModel.deleteOne({
            _id: new mongoose_2.Types.ObjectId(groupId),
            user: new mongoose_2.Types.ObjectId(userId),
        });
        if (result.deletedCount === 0)
            throw new common_1.NotFoundException('Group không tồn tại');
        return { success: true };
    }
    async addChannels(userId, groupId, channelIds) {
        const group = await this.groupModel.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(groupId),
            user: new mongoose_2.Types.ObjectId(userId),
        }, { $addToSet: { channelIds: { $each: channelIds } } }, { new: true });
        if (!group)
            throw new common_1.NotFoundException('Group không tồn tại');
        return group;
    }
    async removeChannel(userId, groupId, channelId) {
        const group = await this.groupModel.findOneAndUpdate({
            _id: new mongoose_2.Types.ObjectId(groupId),
            user: new mongoose_2.Types.ObjectId(userId),
        }, { $pull: { channelIds: channelId } }, { new: true });
        if (!group)
            throw new common_1.NotFoundException('Group không tồn tại');
        return group;
    }
    async getGroupsByChannelId(userId, channelId) {
        return this.groupModel
            .find({
            user: userId,
            channelIds: channelId,
        })
            .lean()
            .exec();
    }
};
exports.TelegramGroupService = TelegramGroupService;
exports.TelegramGroupService = TelegramGroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(telegram_group_schema_1.TelegramGroup.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], TelegramGroupService);
//# sourceMappingURL=telegram-group.service.js.map