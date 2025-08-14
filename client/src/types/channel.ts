import { PagingParams } from './common';

export enum ChannelErrorType {
  LINK_ERROR = 'LINK_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

export interface ChannelParam {
  link: string;
  isActive: boolean;
}

export interface ChannelListItem {
  channelId: string;
  isActive: boolean;
  lastVideoId: string;
  lastVideoAt: string;
  user: string;
  _id: string;
  errors: ChannelErrorType[];
  avatar?: string;
}

export interface GetChannelParams extends PagingParams {
  keyword?: string;
  sort?: ChannelSortKey;
  favoriteOnly?: boolean;
}

export enum ChannelSortKey {
  NEWEST_UPLOAD = 'NEWEST_UPLOAD',
  OLDEST_CHANNEL = 'OLDEST_CHANNEL',
  NEWEST_CHANNEL = 'NEWEST_CHANNEL',
}
