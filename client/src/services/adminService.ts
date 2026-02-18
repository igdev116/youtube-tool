import type {
  AdminUser,
  AdminUserChannel,
  GetAdminUsersParams,
  GetAdminUserChannelsParams,
} from '../types/admin';
import axiosInstance from './axiosInstance';
import type { BaseResponse, PagingResponseV2 } from '../types/common';

export const adminService = {
  getUsers: (
    params: GetAdminUsersParams,
  ): Promise<PagingResponseV2<AdminUser>> =>
    axiosInstance.post('/admin/users', params),
  getUserChannels: (
    userId: string,
    params: GetAdminUserChannelsParams,
  ): Promise<PagingResponseV2<AdminUserChannel>> =>
    axiosInstance.get(`/admin/users/${userId}/channels`, { params }),
  getUser: (userId: string): Promise<BaseResponse<AdminUser>> =>
    axiosInstance.get(`/admin/users/${userId}`),
  deleteUserChannel: (
    userId: string,
    channelId: string,
  ): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/admin/users/${userId}/channels/${channelId}`),
  deleteUser: (userId: string): Promise<BaseResponse<any>> =>
    axiosInstance.delete(`/admin/users/${userId}`),
};
