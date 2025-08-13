import { YoutubeChannelSort } from '../youtube-channel.schema';

export class GetChannelsDto {
  page?: number;
  limit!: number;
  keyword?: string;
  sort?: YoutubeChannelSort;
  favoriteOnly?: boolean;
}
