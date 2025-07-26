import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';
import type { AuthParams, LoginResponse } from '../types/auth';

export const authService = {
  login: (params: AuthParams): Promise<BaseResponse<LoginResponse>> =>
    axiosInstance.post('/auth/login', params),
  register: (params: AuthParams): Promise<BaseResponse<any>> =>
    axiosInstance.post('/auth/register', params),
};
