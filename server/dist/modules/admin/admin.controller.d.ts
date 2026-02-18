import { AdminService } from './admin.service';
import { BaseResponse, PagingResponseV2 } from '../../types/common.type';
import { GetUsersDto } from './dto/get-users.dto';
import { UserAdminResponseDto } from './dto/user-admin-response.dto';
import { GetUserChannelsDto } from './dto/get-user-channels.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    deleteAllChannels(): Promise<BaseResponse<any>>;
    getChannelStats(): Promise<BaseResponse<any>>;
    resetAllLastVideoId(): Promise<BaseResponse<any>>;
    deleteAllChannelsWithErrors(): Promise<BaseResponse<any>>;
    getUsersList(params: GetUsersDto): Promise<PagingResponseV2<UserAdminResponseDto>>;
    getUser(userId: string): Promise<BaseResponse<UserAdminResponseDto>>;
    getUserChannels(userId: string, params: GetUserChannelsDto): Promise<PagingResponseV2<any>>;
    deleteUserChannel(userId: string, channelId: string): Promise<BaseResponse<any>>;
    deleteUser(userId: string): Promise<BaseResponse<any>>;
}
