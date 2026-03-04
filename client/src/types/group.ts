export interface TelegramGroup {
  _id: string;
  name: string;
  groupId: string;
  botToken: string;
  channelCount?: number;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupDto {
  name: string;
  groupId?: string;
  botToken?: string;
}

export interface UpdateGroupDto {
  name?: string;
  groupId?: string;
  botToken?: string;
}
