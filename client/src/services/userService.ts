import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';
import type { UserProfile } from '../types/user';

export const userService = {
  getProfile: (): Promise<BaseResponse<UserProfile>> =>
    axiosInstance.get('/user/profile'),
};
