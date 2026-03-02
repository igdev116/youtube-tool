export declare class TelegramBotService {
    sendNewVideoToGroup(groupId: string, video: {
        title: string;
        url: string;
        channelId?: string;
        channelName?: string;
        channelUrl?: string;
        thumbnail: string;
        publishedAt: string;
        avatarId?: string;
    }, botToken: string): Promise<void>;
}
