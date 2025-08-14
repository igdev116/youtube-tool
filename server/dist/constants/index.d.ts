export declare const YT_FEED_BASE = "https://www.youtube.com/xml/feeds/videos.xml";
export declare const YT_WATCH_BASE = "https://www.youtube.com/watch?v=";
export declare const YT_THUMBNAIL_HQ: (videoId: string) => string;
export declare const HUB_SUBSCRIBE_URL = "https://pubsubhubbub.appspot.com/subscribe";
export declare const TELEGRAM_API_BASE = "https://api.telegram.org";
export declare const TELEGRAM_SEND_MESSAGE_URL: (botToken: string) => string;
export declare const YT_AVATAR_BASE = "https://yt3.googleusercontent.com";
export declare const YT_AVATAR_RESOLUTIONS: {
    readonly SMALL: "s88";
    readonly MEDIUM: "s300";
    readonly LARGE: "s800";
    readonly HD: "s900";
};
export declare const YT_AVATAR_URL: (avatarId: string, resolution?: keyof typeof YT_AVATAR_RESOLUTIONS) => string;
