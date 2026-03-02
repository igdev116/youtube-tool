import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';
import type {
  TelegramGroup,
  CreateGroupDto,
  UpdateGroupDto,
} from '../types/group';

export const groupService = {
  getGroups: (): Promise<BaseResponse<TelegramGroup[]>> =>
    axiosInstance.get('/groups'),

  createGroup: (dto: CreateGroupDto): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.post('/groups', dto),

  updateGroup: (
    id: string,
    dto: UpdateGroupDto,
  ): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.patch(`/groups/${id}`, dto),

  deleteGroup: (id: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/groups/${id}`),

  addChannels: (
    id: string,
    channelIds: string[],
  ): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.post(`/groups/${id}/channels`, { channelIds }),

  removeChannel: (
    id: string,
    channelId: string,
  ): Promise<BaseResponse<TelegramGroup>> =>
    axiosInstance.delete(`/groups/${id}/channels/${channelId}`),
};
