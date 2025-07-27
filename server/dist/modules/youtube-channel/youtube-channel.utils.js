"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFirstVideoIdFromYt = void 0;
exports.getYtInitialDataFromUrl = getYtInitialDataFromUrl;
exports.extractChannelIdFromUrl = extractChannelIdFromUrl;
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
async function extractChannelIdFromUrl(url) {
    const data = await getYtInitialDataFromUrl(url);
    const vanityUrl = data?.metadata?.channelMetadataRenderer?.vanityChannelUrl;
    if (typeof vanityUrl === 'string' && vanityUrl.includes('youtube.com/')) {
        const afterDomain = vanityUrl.split('youtube.com/')[1];
        return decodeURI(afterDomain);
    }
    return null;
}
const extractFirstVideoIdFromYt = async (url, type = 'short') => {
    const data = await getYtInitialDataFromUrl(type === 'video' ? url : url + '/shorts');
    try {
        if (type === 'video') {
            const firstVideo = data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
                .sectionListRenderer.contents[1].itemSectionRenderer.contents[0]
                .shelfRenderer.content.horizontalListRenderer.items[0]
                .gridVideoRenderer;
            return {
                id: firstVideo.videoId,
                thumbnail: firstVideo.thumbnail.thumbnails[firstVideo.thumbnail.thumbnails.length - 1].url,
                title: firstVideo.title.simpleText,
            };
        }
        else {
            const firstVideo = data.contents.twoColumnBrowseResultsRenderer.tabs.find((tab) => tab.tabRenderer.title === 'Shorts').tabRenderer.content.richGridRenderer.contents[0].richItemRenderer
                .content.shortsLockupViewModel.onTap.innertubeCommand.reelWatchEndpoint;
            return {
                id: firstVideo.videoId,
                thumbnail: firstVideo.thumbnail.thumbnails[firstVideo.thumbnail.thumbnails.length - 1].url,
                title: data.contents.twoColumnBrowseResultsRenderer.tabs.find((tab) => tab.tabRenderer.title === 'Shorts').tabRenderer.content.richGridRenderer.contents[0].richItemRenderer
                    .content.shortsLockupViewModel.overlayMetadata.primaryText.content,
            };
        }
    }
    catch (error) {
        console.log(`URL lỗi ${url} - ${error.message}`);
        return null;
    }
};
exports.extractFirstVideoIdFromYt = extractFirstVideoIdFromYt;
//# sourceMappingURL=youtube-channel.utils.js.map