import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useUserService() {
  const useQueryGetProfile = (enabled: boolean = true) =>
    useQuery({
      queryKey: ['user-profile'],
      queryFn: userService.getProfile,
      enabled: enabled,
    });

  return {
    useQueryGetProfile,
  };
}
