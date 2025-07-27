import { UserService } from './user.service';
import { Request } from 'express';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: Request): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        result: (import("mongoose").Document<unknown, {}, import("./user.schema").UserDocument, {}> & import("./user.schema").User & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
}
