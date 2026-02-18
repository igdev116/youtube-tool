export declare class UserAdminResponseDto {
    _id: string;
    username: string;
    password: string;
    channelCount: number;
    createdAt: Date;
    updatedAt: Date;
    telegramGroupId?: string;
    botToken?: string;
}
export declare class UserChannelResponseDto {
    _id: string;
    channelId: string;
    xmlChannelId: string;
    lastVideoId?: string;
    lastVideoAt?: Date;
    isActive: boolean;
    createdAt?: Date;
}
