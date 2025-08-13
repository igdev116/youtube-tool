import { useMutation } from '@tanstack/react-query';
import { telegramService } from '../services/telegramService';

export function useTelegramService() {
  const updateGroupMutation = useMutation({
    mutationFn: telegramService.updateGroup,
  });

  const updateBotTokenMutation = useMutation({
    mutationFn: telegramService.updateBotToken,
  });

  return {
    updateGroupMutation,
    updateBotTokenMutation,
  };
}
