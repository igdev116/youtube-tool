import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';

export function useUserService() {
  const useQueryGetProfile = () =>
    useQuery({
      queryKey: ['user-profile'],
      queryFn: userService.getProfile,
    });

  return {
    useQueryGetProfile,
  };
}
