"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = require("mongoose");
const MONGO_URI = process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI
    : process.env.MONGO_URI_LOCAL;
async function migrate() {
    console.log('Connecting to MongoDB...');
    await mongoose_1.default.connect(MONGO_URI);
    console.log('Connected.');
    const db = mongoose_1.default.connection.db;
    const channelsCol = db.collection('youtubechannels');
    const groupsCol = db.collection('telegramgroups');
    const usersCol = db.collection('users');
    console.log('\n--- Step 1: Migrating from User schema (telegramGroupId/botToken) ---');
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
            console.log(`Created new Group for user "${user.username}" (ID: ${group?._id})`);
        }
        if (group) {
            const result = await channelsCol.updateMany({ user: user._id }, {
                $addToSet: { groups: group._id },
            });
            console.log(`User "${user.username}": Attached group to ${result.modifiedCount} existing channels.`);
        }
    }
    console.log('\n--- Step 2: Mapping legacy TelegramGroup.channelIds string array ---');
    const allGroups = await groupsCol.find({}).toArray();
    for (const g of allGroups) {
        const channelIdStrings = g.channelIds ?? [];
        if (channelIdStrings.length > 0) {
            const result = await channelsCol.updateMany({
                user: g.user,
                channelId: { $in: channelIdStrings },
            }, { $addToSet: { groups: g._id } });
            console.log(`Group "${g.name}": Processed ${result.modifiedCount} channels via channelId string matching.`);
        }
    }
    await groupsCol.updateMany({}, { $unset: { channelIds: '' } });
    console.log('\nMigration complete.');
    await mongoose_1.default.disconnect();
}
migrate().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});
//# sourceMappingURL=migrate-channel-groups.js.map