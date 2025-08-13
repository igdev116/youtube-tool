import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';
import type { UserProfile } from '../types/user';

export const userService = {
  getProfile: (): Promise<BaseResponse<UserProfile>> =>
    axiosInstance.get('/user/profile'),
  addFavorite: (channelId: string): Promise<BaseResponse<string[]>> =>
    axiosInstance.post('/user/favorites', { channelId }),
  removeFavorite: (channelId: string): Promise<BaseResponse<string[]>> =>
    axiosInstance.delete('/user/favorites', { params: { channelId } }),
};
