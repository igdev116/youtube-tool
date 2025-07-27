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
  createdAt: string;
  isActive: boolean;
  lastVideoId: string;
  updatedAt: string;
  user: string;
  _id: string;
  errors: ChannelErrorType[];
}

export interface GetChannelParams extends PagingParams {
  keyword?: string;
}
