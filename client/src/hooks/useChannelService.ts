import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelService } from '../services/channelService';
import type { GetChannelParams } from '../types/channel';

export function useChannelService() {
  const queryClient = useQueryClient();

  const addChannelsMutation = useMutation({
    mutationFn: channelService.addChannels,
  });

  const deleteChannelMutation = useMutation({
    mutationFn: channelService.deleteChannel,
  });

  const toggleChannelMutation = useMutation({
    mutationFn: channelService.toggleChannel,
  });

  const useQueryGetListChannels = (params: GetChannelParams) =>
    useQuery({
      queryKey: ['channels', params],
      queryFn: () => channelService.getChannels(params),
    });

  const invalidateChannels = () => {
    queryClient.invalidateQueries({ queryKey: ['channels'] });
  };

  const deleteMultipleChannels = async (channelIds: string[]) => {
    const deletePromises = channelIds.map((id) =>
      channelService.deleteChannel(id)
    );
    await Promise.all(deletePromises);
    invalidateChannels();
  };

  const deleteAllChannels = async () => {
    await channelService.deleteAllChannels();
    invalidateChannels();
  };

  const useMutationExportChannels = () =>
    useMutation({
      mutationFn: () => channelService.exportChannels(),
    });

  return {
    addChannelsMutation,
    deleteChannelMutation,
    toggleChannelMutation,
    useQueryGetListChannels,
    invalidateChannels,
    deleteMultipleChannels,
    deleteAllChannels,
    useMutationExportChannels,
  };
}
