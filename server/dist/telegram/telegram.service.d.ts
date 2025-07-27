import { UserService } from '../user/user.service';
export declare class TelegramService {
    private readonly userService;
    constructor(userService: UserService);
    updateTelegramGroupId(userId: string, groupId: string): Promise<(import("mongoose").Document<unknown, {}, import("../user/user.schema").UserDocument, {}> & import("../user/user.schema").User & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}
