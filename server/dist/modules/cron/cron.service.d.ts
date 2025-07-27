import { YoutubeChannelService } from '../youtube-channel/youtube-channel.service';
export declare class CronService {
    private readonly youtubeChannelService;
    private readonly logger;
    constructor(youtubeChannelService: YoutubeChannelService);
    handleYoutubeChannelCron(): Promise<void>;
}
