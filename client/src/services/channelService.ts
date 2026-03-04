import axiosInstance from './axiosInstance';
import type { BaseResponse, PagingResponse } from '../types/common';
import type {
  ChannelParam,
  ChannelListItem,
  GetChannelParams,
} from '../types/channel';

export const channelService = {
  addChannels: (body: {
    channels: ChannelParam[];
    groupIds?: string[];
    newGroupNames?: string[];
  }): Promise<BaseResponse<any>> => axiosInstance.post('/channel/bulk', body),
  getChannels: (
    params: GetChannelParams,
  ): Promise<PagingResponse<ChannelListItem>> =>
    axiosInstance.post('/channel/list', params),
  deleteChannel: (channelId: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/channel/${channelId}`),
  toggleChannel: (channelId: string): Promise<BaseResponse<ChannelListItem>> =>
    axiosInstance.patch(`/channel/${channelId}/toggle`),
  deleteAllChannels: (): Promise<BaseResponse<any>> =>
    axiosInstance.delete('/channel/all'),
  exportChannels: (): Promise<BaseResponse<ChannelListItem[]>> =>
    axiosInstance.post('/channel/export', {}),
  addGroupToChannel: (
    channelDbId: string,
    groupId: string,
  ): Promise<BaseResponse<ChannelListItem>> =>
    axiosInstance.patch(`/channel/${channelDbId}/groups/${groupId}`),
  removeGroupFromChannel: (
    channelDbId: string,
    groupId: string,
  ): Promise<BaseResponse<ChannelListItem>> =>
    axiosInstance.delete(`/channel/${channelDbId}/groups/${groupId}`),
};
