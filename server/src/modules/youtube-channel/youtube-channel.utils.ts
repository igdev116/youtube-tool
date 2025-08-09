import axios from 'axios';

/**
 * Lấy channelId (dạng UC...) từ HTML kênh bằng link RSS feeds/videos.xml
 */
export async function extractChannelIdFromUrl(
  url: string,
): Promise<string | null> {
  try {
    const res = await axios.get(url, {
      headers: { 'Cache-Control': 'no-cache' },
    });
    const html = String(res.data || '');
    const m = html.match(/feeds\/videos\.xml\?channel_id=([A-Za-z0-9_-]+)/);
    if (m && m[1]) return m[1];
    return null;
  } catch {
    return null;
  }
}

/**
 * Lấy video đầu tiên từ RSS feed của channel
 * Trả về { id, thumbnail, title, publishedAt } hoặc null
 */
export const extractFirstVideoFromYt = async (
  channelId: string,
): Promise<{
  id: string;
  thumbnail: string;
  title: string;
  publishedAt: string;
} | null> => {
  if (!channelId) return null;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const res = await axios.get(feedUrl, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    const xml = String(res.data || '');

    const entryMatch = xml.match(/<entry[\s\S]*?<\/entry>/);
    if (!entryMatch) return null;
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

    if (!id) return null;
    return { id, thumbnail, title, publishedAt };
  } catch (error) {
    console.log(`RSS lỗi ${feedUrl} - ${(error as Error)?.message}`);
    return null;
  }
};
