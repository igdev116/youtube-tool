import { toast } from 'react-hot-toast';

export function toastSuccess(message: string) {
  toast.success(message, {
    position: 'top-center',
  });
}

export function toastError(message: string) {
  toast.error(message, {
    position: 'top-center',
  });
}
