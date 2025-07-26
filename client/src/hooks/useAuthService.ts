import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';

export function useAuthService() {
  const loginMutation = useMutation({
    mutationFn: authService.login,
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
  });

  return {
    loginMutation,
    registerMutation,
  };
}
