"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFirstVideoFromYt = void 0;
exports.extractChannelIdFromUrl = extractChannelIdFromUrl;
const axios_1 = require("axios");
async function extractChannelIdFromUrl(url) {
    try {
        const res = await axios_1.default.get(url, {
            headers: { 'Cache-Control': 'no-cache' },
        });
        const html = String(res.data || '');
        const m = html.match(/feeds\/videos\.xml\?channel_id=([A-Za-z0-9_-]+)/);
        if (m && m[1])
            return m[1];
        return null;
    }
    catch {
        return null;
    }
}
const extractFirstVideoFromYt = async (channelId) => {
    if (!channelId)
        return null;
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    try {
        const res = await axios_1.default.get(feedUrl, {
            headers: {
                'Cache-Control': 'no-cache',
            },
        });
        const xml = String(res.data || '');
        const entryMatch = xml.match(/<entry[\s\S]*?<\/entry>/);
        if (!entryMatch)
            return null;
        const entry = entryMatch[0];
        const idMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const id = idMatch ? idMatch[1] : null;
        const titleMatch = entry.match(/<title>([^<]+)<\/title>/);
        const title = titleMatch ? titleMatch[1] : '';
        const thumbMatch = entry.match(/<media:thumbnail[^>]*url="([^"]+)"/);
        const thumbnail = thumbMatch
            ? thumbMatch[1]
            : id
                ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
                : '';
        const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);
        const publishedAt = publishedMatch ? publishedMatch[1] : '';
        if (!id)
            return null;
        return { id, thumbnail, title, publishedAt };
    }
    catch (error) {
        console.log(`RSS lỗi ${feedUrl} - ${error?.message}`);
        return null;
    }
};
exports.extractFirstVideoFromYt = extractFirstVideoFromYt;
//# sourceMappingURL=youtube-channel.utils.js.map