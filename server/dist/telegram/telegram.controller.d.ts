import { TelegramService } from './telegram.service';
import { Request } from 'express';
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    updateGroup(body: {
        link: string;
    }, req: Request): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        result: (import("mongoose").Document<unknown, {}, import("../user/user.schema").UserDocument, {}> & import("../user/user.schema").User & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
    updateBotToken(body: {
        botToken: string;
    }, req: Request): Promise<{
        success: boolean;
        statusCode: number;
        message: string;
        result: (import("mongoose").Document<unknown, {}, import("../user/user.schema").UserDocument, {}> & import("../user/user.schema").User & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
            _id: unknown;
        }> & {
            __v: number;
        }) | null;
    }>;
}
