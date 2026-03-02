import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService } from '../services/groupService';
import type { CreateGroupDto, UpdateGroupDto } from '../types/group';

export const useGroupService = () => {
  const queryClient = useQueryClient();

  const useQueryGetGroups = () =>
    useQuery({
      queryKey: ['groups'],
      queryFn: () => groupService.getGroups(),
    });

  const createGroupMutation = useMutation({
    mutationFn: (dto: CreateGroupDto) => groupService.createGroup(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateGroupDto }) =>
      groupService.updateGroup(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (id: string) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const addChannelsMutation = useMutation({
    mutationFn: ({ id, channelIds }: { id: string; channelIds: string[] }) =>
      groupService.addChannels(id, channelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const removeChannelMutation = useMutation({
    mutationFn: ({ id, channelId }: { id: string; channelId: string }) =>
      groupService.removeChannel(id, channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  return {
    useQueryGetGroups,
    createGroupMutation,
    updateGroupMutation,
    deleteGroupMutation,
    addChannelsMutation,
    removeChannelMutation,
  };
};
