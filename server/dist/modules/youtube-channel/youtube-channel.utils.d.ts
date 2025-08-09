export declare function extractChannelIdFromUrl(url: string): Promise<string | null>;
export declare const extractFirstVideoFromYt: (channelId: string) => Promise<{
    id: string;
    thumbnail: string;
    title: string;
    publishedAt: string;
} | null>;
