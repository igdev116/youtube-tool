"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HUB_SUBSCRIBE_URL = exports.YT_THUMBNAIL_HQ = exports.YT_WATCH_BASE = exports.YT_FEED_BASE = void 0;
exports.YT_FEED_BASE = 'https://www.youtube.com/xml/feeds/videos.xml';
exports.YT_WATCH_BASE = 'https://www.youtube.com/watch?v=';
const YT_THUMBNAIL_HQ = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
exports.YT_THUMBNAIL_HQ = YT_THUMBNAIL_HQ;
exports.HUB_SUBSCRIBE_URL = 'https://pubsubhubbub.appspot.com/subscribe';
//# sourceMappingURL=index.js.map