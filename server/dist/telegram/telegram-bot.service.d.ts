import { Telegraf } from 'telegraf';
export declare class TelegramBotService {
    private readonly bot;
    constructor(bot: Telegraf);
    sendNewVideoToGroup(groupId: string, video: {
        title: string;
        url: string;
        channelId?: string;
        thumbnail: string;
    }): Promise<void>;
}
