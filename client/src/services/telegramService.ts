import axiosInstance from './axiosInstance';
import type { BaseResponse } from '../types/common';

export interface TelegramGroupParam {
  link: string;
}

export const telegramService = {
  updateGroup: (params: TelegramGroupParam): Promise<BaseResponse<any>> =>
    axiosInstance.post('/telegram/update-group', params),
  updateBotToken: (params: { botToken: string }): Promise<BaseResponse<any>> =>
    axiosInstance.post('/telegram/update-bot-token', params),
};
