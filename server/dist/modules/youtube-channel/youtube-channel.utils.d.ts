export declare function getYtInitialDataFromUrl(url: string): Promise<any | null>;
export declare function extractChannelDataFromUrl(url: string): Promise<{
    channelId: string;
    avatarId?: string;
} | null>;
export declare function extractXmlChannelIdFromUrl(url: string): Promise<string | null>;
export declare const extractFirstVideoFromYt: (xmlChannelId: string) => Promise<{
    id: string;
    thumbnail: string;
    title: string;
    publishedAt: string;
} | null>;
