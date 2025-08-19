"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YT_AVATAR_URL = exports.YT_AVATAR_RESOLUTIONS = exports.YT_AVATAR_BASE = exports.TELEGRAM_SEND_MESSAGE_URL = exports.TELEGRAM_API_BASE = exports.WEB_SUB_RENEW_BEFORE_SECONDS = exports.HUB_LEASE_SECONDS = exports.HUB_SUBSCRIBE_URL = exports.YT_THUMBNAIL_HQ = exports.YT_WATCH_BASE = exports.YT_FEED_BASE = void 0;
exports.YT_FEED_BASE = 'https://www.youtube.com/xml/feeds/videos.xml';
exports.YT_WATCH_BASE = 'https://www.youtube.com/watch?v=';
const YT_THUMBNAIL_HQ = (videoId) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
exports.YT_THUMBNAIL_HQ = YT_THUMBNAIL_HQ;
exports.HUB_SUBSCRIBE_URL = 'https://pubsubhubbub.appspot.com/subscribe';
exports.HUB_LEASE_SECONDS = 432000;
exports.WEB_SUB_RENEW_BEFORE_SECONDS = 172800;
exports.TELEGRAM_API_BASE = 'https://api.telegram.org';
const TELEGRAM_SEND_MESSAGE_URL = (botToken) => `${exports.TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;
exports.TELEGRAM_SEND_MESSAGE_URL = TELEGRAM_SEND_MESSAGE_URL;
exports.YT_AVATAR_BASE = 'https://yt3.googleusercontent.com';
exports.YT_AVATAR_RESOLUTIONS = {
    SMALL: 's88',
    MEDIUM: 's300',
    LARGE: 's800',
    HD: 's900',
};
const YT_AVATAR_URL = (avatarId, resolution = 'LARGE') => `${exports.YT_AVATAR_BASE}/${avatarId}=${exports.YT_AVATAR_RESOLUTIONS[resolution]}`;
exports.YT_AVATAR_URL = YT_AVATAR_URL;
//# sourceMappingURL=index.js.map