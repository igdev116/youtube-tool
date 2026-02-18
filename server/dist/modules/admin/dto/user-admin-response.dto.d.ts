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
    errors: string[];
    createdAt?: Date;
}
