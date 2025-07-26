import axiosInstance from './axiosInstance';
import type {
  BaseResponse,
  PagingResponse,
  PagingParams,
} from '../types/common';
import type { ChannelParam, ChannelListItem } from '../types/channel';

export const channelService = {
  addChannels: (params: ChannelParam[]): Promise<BaseResponse<any>> =>
    axiosInstance.post('/channel/bulk', params),
  getChannels: (
    params: PagingParams
  ): Promise<PagingResponse<ChannelListItem>> =>
    axiosInstance.get('/channel/list', { params }),
  deleteChannel: (channelId: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/channel/${channelId}`),
};
