import { PagingParams } from './common';

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
}

export interface GetChannelParams extends PagingParams {
  keyword?: string;
}
