import axiosInstance from './axiosInstance';
import type { BaseResponse, PagingResponse } from '../types/common';
import type {
  ChannelParam,
  ChannelListItem,
  GetChannelParams,
} from '../types/channel';

export const channelService = {
  addChannels: (params: ChannelParam[]): Promise<BaseResponse<any>> =>
    axiosInstance.post('/channel/bulk', params),
  getChannels: (
    params: GetChannelParams
  ): Promise<PagingResponse<ChannelListItem>> =>
    axiosInstance.get('/channel/list', { params }),
  deleteChannel: (channelId: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/channel/${channelId}`),
};
