import { AdminService } from './admin.service';
import { BaseResponse } from '../../types/common.type';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    deleteAllChannels(): Promise<BaseResponse<any>>;
    getChannelStats(): Promise<BaseResponse<any>>;
    resetAllLastVideoId(): Promise<BaseResponse<any>>;
    deleteAllChannelsWithErrors(): Promise<BaseResponse<any>>;
}
