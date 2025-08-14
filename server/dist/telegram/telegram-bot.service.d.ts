export declare class TelegramBotService {
    sendNewVideoToGroup(groupId: string, video: {
        title: string;
        url: string;
        channelId?: string;
        channelName?: string;
        channelUrl?: string;
        thumbnail: string;
        publishedAt: string;
        avatar?: string;
    }, botToken: string): Promise<void>;
}
