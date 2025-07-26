import { useMutation } from '@tanstack/react-query';
import { telegramService } from '../services/telegramService';

export function useTelegramService() {
  const updateGroupMutation = useMutation({
    mutationFn: telegramService.updateGroup,
  });

  return {
    updateGroupMutation,
  };
}
