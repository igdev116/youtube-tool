export declare function getYtInitialDataFromUrl(url: string): Promise<any | null>;
export declare function extractChannelIdFromUrl(url: string): Promise<string | null>;
export declare const extractFirstVideoIdFromYt: (url: string, type?: "video" | "short") => Promise<{
    id: string;
    thumbnail: string;
    title: string;
} | null>;
