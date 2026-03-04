import { PagingParams } from './common';

export interface ChannelParam {
  link: string;
  isActive: boolean;
}

export interface ChannelListItem {
  channelId: string;
  isActive: boolean;
  lastVideoId: string;
  lastVideoAt: string;
  xmlChannelId: string;
  user: string;
  _id: string;
  avatarId?: string;
  lastSubscribeAt?: string;
  groups?: { _id: string; name: string; groupId: string }[];
}

export interface GetChannelParams extends PagingParams {
  keyword?: string;
  sort?: ChannelSortKey;
  favoriteOnly?: boolean;
}

export enum ChannelSortKey {
  NEWEST_UPLOAD = 'NEWEST_UPLOAD',
  OLDEST_UPLOAD = 'OLDEST_UPLOAD',
  NO_GROUP = 'NO_GROUP',
}
