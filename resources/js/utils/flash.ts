import { PageProps } from '@/types';
import { makeToast } from '@/utils/toast';
import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

export const useFlashToast = () => {
    const { flash } = usePage<PageProps<{ flash: { success?: string; error?: string } }>>().props;

    useEffect(() => {
        if (flash.success) makeToast({ success: true, message: flash.success });
        if (flash.error) makeToast({ success: false, message: flash.error });
    }, [flash]);
};
