/**
 * Migration script:
 * 1. Chuyển User.telegramGroupId & botToken -> tạo bản ghi TelegramGroup mới.
 * 2. Gán toàn bộ YoutubeChannel của User đó vào Group vừa tạo.
 * 3. Hỗ trợ migrate song song từ TelegramGroup.channelIds cũ (nếu có).
 */

import 'dotenv/config';
import mongoose, { Types } from 'mongoose';

const MONGO_URI =
  process.env.NODE_ENV === 'production'
    ? process.env.MONGO_URI!
    : process.env.MONGO_URI_LOCAL!;

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const channelsCol = db.collection('youtubechannels');
  const groupsCol = db.collection('telegramgroups');
  const usersCol = db.collection('users');

  // --- BƯỚC 1: Migrate từ thông tin Telegram trong User schema cũ ---
  console.log(
    '\n--- Step 1: Migrating from User schema (telegramGroupId/botToken) ---',
  );
  const usersWithSettings = await usersCol
    .find({
      telegramGroupId: { $exists: true, $ne: '' },
      botToken: { $exists: true, $ne: '' },
    })
    .toArray();

  for (const user of usersWithSettings) {
    // Kiểm tra xem user này đã có group nào với groupId này chưa để tránh duplicate nếu chạy script nhiều lần
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
      group = { ...newGroup, _id: insertResult.insertedId } as any;
      console.log(
        `Created new Group for user "${user.username}" (ID: ${group?._id})`,
      );
    }

    if (group) {
      // Gán group này vào TẤT CẢ channels của user này (vì trước đây 1 user chỉ có 1 setting duy nhất)
      const result = await channelsCol.updateMany(
        { user: user._id },
        {
          $addToSet: { groups: group._id },
        },
      );
      console.log(
        `User "${user.username}": Attached group to ${result.modifiedCount} existing channels.`,
      );
    }
  }

  // --- BƯỚC 2: Migrate từ mảng channelIds string cũ trong TelegramGroup (nếu có) ---
  console.log(
    '\n--- Step 2: Mapping legacy TelegramGroup.channelIds string array ---',
  );
  const allGroups = await groupsCol.find({}).toArray();
  for (const g of allGroups) {
    const channelIdStrings: string[] = g.channelIds ?? [];
    if (channelIdStrings.length > 0) {
      const result = await channelsCol.updateMany(
        {
          user: g.user,
          channelId: { $in: channelIdStrings },
        },
        { $addToSet: { groups: g._id } },
      );
      console.log(
        `Group "${g.name}": Processed ${result.modifiedCount} channels via channelId string matching.`,
      );
    }
  }

  // --- BƯỚC 3: Dọn dẹp ---
  // Xoá field channelIds cũ trong telegramgroups
  await groupsCol.updateMany({}, { $unset: { channelIds: '' } });

  // Lưu ý: Không xoá telegramGroupId/botToken trong User để tránh rủi ro nếu migrate lỗi,
  // bạn có thể xoá manual sau khi verify UI.

  console.log('\nMigration complete.');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
