export const YT_FEED_BASE = 'https://www.youtube.com/xml/feeds/videos.xml';
export const YT_WATCH_BASE = 'https://www.youtube.com/watch?v=';
export const YT_THUMBNAIL_HQ = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
export const HUB_SUBSCRIBE_URL = 'https://pubsubhubbub.appspot.com/subscribe';

// Telegram
export const TELEGRAM_API_BASE = 'https://api.telegram.org';
export const TELEGRAM_SEND_MESSAGE_URL = (botToken: string) =>
  `${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`;

// YouTube Avatar
export const YT_AVATAR_BASE = 'https://yt3.googleusercontent.com';
export const YT_AVATAR_RESOLUTIONS = {
  SMALL: 's88',
  MEDIUM: 's300',
  LARGE: 's800',
  HD: 's900',
} as const;
export const YT_AVATAR_URL = (
  avatarId: string,
  resolution: keyof typeof YT_AVATAR_RESOLUTIONS = 'LARGE',
) => `${YT_AVATAR_BASE}/${avatarId}=${YT_AVATAR_RESOLUTIONS[resolution]}`;
