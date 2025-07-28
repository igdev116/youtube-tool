import { YoutubeChannelService } from '../youtube-channel/youtube-channel.service';
export declare class CronService {
    private readonly youtubeChannelService;
    private readonly logger;
    private isProcessing;
    constructor(youtubeChannelService: YoutubeChannelService);
    handleYoutubeChannelCron(): Promise<void>;
}
