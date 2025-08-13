import { YoutubeWebsubService } from './youtube-websub.service';
export declare class YoutubeWebsubController {
    private readonly service;
    private readonly logger;
    constructor(service: YoutubeWebsubService);
    verify(challenge?: string): string;
    notify(xml: string): Promise<string>;
    subscribe(body: {
        xmlChannelId: string;
        callbackUrl?: string;
    }): Promise<{
        success: boolean;
        status: number;
    }>;
    unsubscribe(body: {
        xmlChannelId: string;
        callbackUrl?: string;
    }): Promise<{
        success: boolean;
        status: number;
    }>;
}
