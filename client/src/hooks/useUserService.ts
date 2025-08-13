import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useUserService() {
  const queryClient = useQueryClient();
  const useQueryGetProfile = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['user-profile'],
      queryFn: userService.getProfile,
      enabled: enabled,
    });

  const addFavoriteMutation = useMutation({
    mutationFn: userService.addFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: userService.removeFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });

  return {
    useQueryGetProfile,
    addFavoriteMutation,
    removeFavoriteMutation,
  };
}
