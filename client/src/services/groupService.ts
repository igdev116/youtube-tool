import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';
import type {
  TelegramGroup,
  CreateGroupDto,
  UpdateGroupDto,
} from '../types/group';
import type { ChannelListItem } from '../types/channel';

export const groupService = {
  getGroups: (): Promise<BaseResponse<TelegramGroup[]>> =>
    axiosInstance.get('/groups'),

  getGroupById: (id: string): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.get(`/groups/${id}`),

  createGroup: (dto: CreateGroupDto): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.post('/groups', dto),

  updateGroup: (
    id: string,
    dto: UpdateGroupDto,
  ): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.patch(`/groups/${id}`, dto),

  deleteGroup: (id: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/groups/${id}`),

  getGroupChannels: (id: string): Promise<BaseResponse<ChannelListItem[]>> =>
    axiosInstance.get(`/groups/${id}/channels`),
};
