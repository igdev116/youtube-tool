import { Model } from 'mongoose';
import { YoutubeChannelDocument } from '../youtube-channel/youtube-channel.schema';
import { TelegramBotService } from '../../telegram/telegram-bot.service';
export declare class YoutubeWebsubService {
    private readonly channelModel;
    private readonly telegramBotService;
    private readonly logger;
    constructor(channelModel: Model<YoutubeChannelDocument>, telegramBotService: TelegramBotService);
    private extractEntries;
    private extractTag;
    private extractNsTag;
    handleNotification(xml: string): Promise<void>;
    subscribeCallback(topicUrl: string, callbackUrl: string): Promise<number>;
    unsubscribeCallback(topicUrl: string, callbackUrl: string): Promise<number>;
}
