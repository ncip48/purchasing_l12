import { toast } from 'sonner';

export const makeToast = (res: { success: boolean; message: string }) => {
    if (res.success) {
        toast.success(res.message, {
            position: 'top-right',
        });
    } else {
        toast.error(res.message, {
            position: 'top-right',
        });
    }
};
