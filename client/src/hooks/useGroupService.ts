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

  const useQueryGetGroupById = (id: string, enabled = true) =>
    useQuery({
      queryKey: ['group', id],
      queryFn: () => groupService.getGroupById(id),
      enabled: !!id && enabled,
    });

  const useQueryGetGroupChannels = (id: string, enabled = true) =>
    useQuery({
      queryKey: ['group-channels', id],
      queryFn: () => groupService.getGroupChannels(id),
      enabled: !!id && enabled,
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
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  return {
    useQueryGetGroups,
    useQueryGetGroupById,
    useQueryGetGroupChannels,
    createGroupMutation,
    updateGroupMutation,
    deleteGroupMutation,
  };
};
