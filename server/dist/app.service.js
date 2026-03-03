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
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AppService = class AppService {
    connection;
    constructor(connection) {
        this.connection = connection;
    }
    getHello() {
        return 'Hello World!';
    }
    async migrateChannelGroups() {
        console.log('--- Starting Migration ---');
        const db = this.connection.db;
        const channelsCol = db.collection('youtubechannels');
        const groupsCol = db.collection('telegramgroups');
        const usersCol = db.collection('users');
        const logs = [];
        const log = (msg) => {
            console.log(msg);
            logs.push(msg);
        };
        log('--- Step 1: Migrating from User schema (telegramGroupId/botToken) ---');
        const usersWithSettings = await usersCol
            .find({
            telegramGroupId: { $exists: true, $ne: '' },
            botToken: { $exists: true, $ne: '' },
        })
            .toArray();
        for (const user of usersWithSettings) {
            let group = await groupsCol.findOne({
                user: user._id,
                groupId: user.telegramGroupId,
            });
            if (!group) {
                const newGroup = {
                    name: 'Nhóm Telegram mặc định',
                    groupId: user.telegramGroupId,
                    botToken: user.botToken,
                    user: user._id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                const insertResult = await groupsCol.insertOne(newGroup);
                group = { ...newGroup, _id: insertResult.insertedId };
                log(`Created new Group for user "${user.username}" (ID: ${group?._id})`);
            }
            if (group) {
                const result = await channelsCol.updateMany({ user: user._id }, {
                    $addToSet: { groups: group._id },
                });
                log(`User "${user.username}": Attached group to ${result.modifiedCount} existing channels.`);
            }
        }
        log('\n--- Step 2: Mapping legacy TelegramGroup.channelIds string array ---');
        const allGroups = await groupsCol.find({}).toArray();
        for (const g of allGroups) {
            const channelIdStrings = g.channelIds ?? [];
            if (channelIdStrings.length > 0) {
                const result = await channelsCol.updateMany({
                    user: g.user,
                    channelId: { $in: channelIdStrings },
                }, { $addToSet: { groups: g._id } });
                log(`Group "${g.name}": Processed ${result.modifiedCount} channels via channelId string matching.`);
            }
        }
        log('\n--- Step 3: Dọn dẹp ---');
        await groupsCol.updateMany({}, { $unset: { channelIds: '' } });
        log('\nMigration complete.');
        return { success: true, logs };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], AppService);
//# sourceMappingURL=app.service.js.map