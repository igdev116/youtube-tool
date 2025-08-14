"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFirstVideoFromYt = void 0;
exports.getYtInitialDataFromUrl = getYtInitialDataFromUrl;
exports.extractChannelDataFromUrl = extractChannelDataFromUrl;
exports.extractXmlChannelIdFromUrl = extractXmlChannelIdFromUrl;
const axios_1 = require("axios");
async function getYtInitialDataFromUrl(url) {
    if (!url)
        return null;
    try {
        const res = await axios_1.default.get(url);
        const html = res.data;
        const match = html.match(/var ytInitialData = (\{.*?\});/s);
        if (!match)
            return null;
        const jsonStr = match[1];
        return JSON.parse(jsonStr);
    }
    catch {
        return null;
    }
}
async function extractChannelDataFromUrl(url) {
    const data = await getYtInitialDataFromUrl(url);
    if (!data)
        return null;
    const vanityUrl = data?.metadata?.channelMetadataRenderer?.vanityChannelUrl;
    if (typeof vanityUrl === 'string' && vanityUrl.includes('youtube.com/')) {
        const afterDomain = vanityUrl.split('youtube.com/')[1];
        const channelId = decodeURI(afterDomain);
        let avatar;
        try {
            avatar =
                data?.metadata?.channelMetadataRenderer?.avatar?.thumbnails?.[0]?.url;
        }
        catch (error) {
            console.log('Error extracting avatar:', error);
        }
        return { channelId, avatar };
    }
    return null;
}
async function extractXmlChannelIdFromUrl(url) {
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
const extractFirstVideoFromYt = async (xmlChannelId) => {
    if (!xmlChannelId)
        return null;
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${xmlChannelId}`;
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