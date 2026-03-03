import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private connection: Connection) {}

  getHello(): string {
    return 'Hello World!';
  }

  async migrateChannelGroups() {
    console.log('--- Starting Migration ---');
    const db = this.connection.db!;
    const channelsCol = db.collection('youtubechannels');
    const groupsCol = db.collection('telegramgroups');
    const usersCol = db.collection('users');

    const logs: string[] = [];
    const log = (msg: string) => {
      console.log(msg);
      logs.push(msg);
    };

    log(
      '--- Step 1: Migrating from User schema (telegramGroupId/botToken) ---',
    );
    const usersWithSettings = await usersCol
      .find({
        telegramGroupId: { $exists: true, $ne: '' },
        botToken: { $exists: true, $ne: '' },
      })
      .toArray();

    for (const user of usersWithSettings) {
      // Kiểm tra xem user này đã có group nào với groupId này chưa
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
        log(
          `Created new Group for user "${user.username}" (ID: ${group?._id})`,
        );
      }

      if (group) {
        const result = await channelsCol.updateMany(
          { user: user._id },
          {
            $addToSet: { groups: group._id },
          },
        );
        log(
          `User "${user.username}": Attached group to ${result.modifiedCount} existing channels.`,
        );
      }
    }

    log(
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
        log(
          `Group "${g.name}": Processed ${result.modifiedCount} channels via channelId string matching.`,
        );
      }
    }

    log('\n--- Step 3: Dọn dẹp ---');
    await groupsCol.updateMany({}, { $unset: { channelIds: '' } });

    log('\nMigration complete.');
    return { success: true, logs };
  }
}
