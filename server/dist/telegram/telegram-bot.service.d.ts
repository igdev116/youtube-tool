export declare class TelegramBotService {
    sendNewVideoToGroup(groupId: string, video: {
        title: string;
        url: string;
        channelId?: string;
        thumbnail: string;
        publishedAt: string;
    }, botToken: string): Promise<void>;
}
