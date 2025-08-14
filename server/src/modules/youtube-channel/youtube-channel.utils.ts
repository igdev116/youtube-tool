import axios from 'axios';

export async function getYtInitialDataFromUrl(
  url: string,
): Promise<any | null> {
  if (!url) return null;
  try {
    const res = await axios.get(url);
    const html = res.data as string;
    // Tìm ytInitialData
    const match = html.match(/var ytInitialData = (\{.*?\});/s);
    if (!match) return null;
    const jsonStr = match[1];
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export async function extractChannelDataFromUrl(
  url: string,
): Promise<{ channelId: string; avatar?: string } | null> {
  const data = await getYtInitialDataFromUrl(url);
  if (!data) return null;

  // Lấy vanityChannelUrl
  const vanityUrl = data?.metadata?.channelMetadataRenderer?.vanityChannelUrl;
  if (typeof vanityUrl === 'string' && vanityUrl.includes('youtube.com/')) {
    const afterDomain = vanityUrl.split('youtube.com/')[1];
    const channelId = decodeURI(afterDomain);

    // Lấy avatar từ ytInitialData
    let avatar: string | undefined;
    try {
      // Lấy avatar từ metadata
      avatar =
        data?.metadata?.channelMetadataRenderer?.avatar?.thumbnails?.[0]?.url;
    } catch (error) {
      console.log('Error extracting avatar:', error);
    }

    return { channelId, avatar };
  }
  return null;
}

/**
 * Lấy xmlChannelId (dạng UC...) từ HTML kênh bằng link RSS feeds/videos.xml
 */
export async function extractXmlChannelIdFromUrl(
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
  xmlChannelId: string,
): Promise<{
  id: string;
  thumbnail: string;
  title: string;
  publishedAt: string;
} | null> => {
  if (!xmlChannelId) return null;
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${xmlChannelId}`;
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
