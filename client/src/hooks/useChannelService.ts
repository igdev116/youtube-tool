import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { channelService } from '../services/channelService';
import type { PagingParams } from '../types/common';

export function useChannelService() {
  const queryClient = useQueryClient();

  const addChannelsMutation = useMutation({
    mutationFn: channelService.addChannels,
  });

  const deleteChannelMutation = useMutation({
    mutationFn: channelService.deleteChannel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  const useQueryGetListChannels = (params: PagingParams) =>
    useQuery({
      queryKey: ['channels', params],
      queryFn: () => channelService.getChannels(params),
    });

  return {
    addChannelsMutation,
    deleteChannelMutation,
    useQueryGetListChannels,
  };
}
