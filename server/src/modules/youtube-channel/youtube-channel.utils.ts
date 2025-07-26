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

export async function extractChannelIdFromUrl(
  url: string,
): Promise<string | null> {
  const data = await getYtInitialDataFromUrl(url);
  // Lấy vanityChannelUrl
  const vanityUrl = data?.metadata?.channelMetadataRenderer?.vanityChannelUrl;
  if (typeof vanityUrl === 'string' && vanityUrl.includes('youtube.com/')) {
    const afterDomain = vanityUrl.split('youtube.com/')[1];
    return decodeURI(afterDomain);
  }
  return null;
}

/**
 * Trích xuất videoId đầu tiên từ tab "Video" trong ytInitialData (dạng object hoặc url)
 */
export const extractFirstVideoIdFromYt = async (
  url: string,
  type: 'video' | 'short' = 'short',
): Promise<{ id: string; thumbnail: string; title: string } | null> => {
  const data = await getYtInitialDataFromUrl(
    type === 'video' ? url : url + '/shorts',
  );

  try {
    if (type === 'video') {
      const firstVideo =
        data.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content
          .sectionListRenderer.contents[1].itemSectionRenderer.contents[0]
          .shelfRenderer.content.horizontalListRenderer.items[0]
          .gridVideoRenderer;

      return {
        id: firstVideo.videoId,
        thumbnail:
          firstVideo.thumbnail.thumbnails[
            firstVideo.thumbnail.thumbnails.length - 1
          ].url,
        title: firstVideo.title.simpleText,
      };
    } else {
      const firstVideo = data.contents.twoColumnBrowseResultsRenderer.tabs.find(
        (tab: any) => tab.tabRenderer.title === 'Shorts',
      ).tabRenderer.content.richGridRenderer.contents[0].richItemRenderer
        .content.shortsLockupViewModel.onTap.innertubeCommand.reelWatchEndpoint;

      return {
        id: firstVideo.videoId,
        thumbnail:
          firstVideo.thumbnail.thumbnails[
            firstVideo.thumbnail.thumbnails.length - 1
          ].url,
        title: data.contents.twoColumnBrowseResultsRenderer.tabs.find(
          (tab: any) => tab.tabRenderer.title === 'Shorts',
        ).tabRenderer.content.richGridRenderer.contents[0].richItemRenderer
          .content.shortsLockupViewModel.overlayMetadata.primaryText.content,
      };
    }
  } catch (error) {
    console.log('error :', url, error.message);
    return null;
  }
};
