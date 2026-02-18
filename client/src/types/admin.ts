export interface AdminUser {
  _id: string;
  username: string;
  password: string;
  channelCount: number;
  createdAt: string;
  updatedAt: string;
  telegramGroupId?: string;
  botToken?: string;
}

export interface AdminUserChannel {
  _id: string;
  channelId: string;
  xmlChannelId: string;
  lastVideoId?: string;
  lastVideoAt?: string;
  isActive: boolean;
  errors: string[];
  createdAt?: string;
}

export interface GetAdminUsersParams {
  page?: number;
  limit?: number;
  keyword?: string;
}

export interface GetAdminUserChannelsParams {
  page?: number;
  limit?: number;
  keyword?: string;
}
