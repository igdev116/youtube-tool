import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import type {
  GetAdminUsersParams,
  GetAdminUserChannelsParams,
} from '../types/admin';

export const useAdminService = () => {
  const queryClient = useQueryClient();

  const useQueryGetUsers = (params: GetAdminUsersParams) =>
    useQuery({
      queryKey: ['admin-users', params],
      queryFn: () => adminService.getUsers(params),
    });

  const useQueryGetUserChannels = (
    userId: string,
    params: GetAdminUserChannelsParams,
    enabled: boolean = false,
  ) =>
    useQuery({
      queryKey: ['admin-user-channels', userId, params],
      queryFn: () => adminService.getUserChannels(userId, params),
      enabled,
    });

  const useQueryGetUser = (userId: string, enabled: boolean = false) =>
    useQuery({
      queryKey: ['admin-user', userId],
      queryFn: () => adminService.getUser(userId),
      enabled,
    });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUserChannelMutation = useMutation({
    mutationFn: ({
      userId,
      channelId,
    }: {
      userId: string;
      channelId: string;
    }) => adminService.deleteUserChannel(userId, channelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin-user-channels', variables.userId],
      });
      // Cũng cập nhật lại số lượng kênh ở trang danh sách user
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  return {
    useQueryGetUsers,
    useQueryGetUserChannels,
    useQueryGetUser,
    deleteUserMutation,
    deleteUserChannelMutation,
  };
};
