export interface UserProfile {
  id: string;
  username: string;
  telegramGroupId: string;
  botToken?: string;
  favoriteChannelIds?: string[];
}
