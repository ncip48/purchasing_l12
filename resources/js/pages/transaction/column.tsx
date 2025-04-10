import { ExtendedColumnDef } from '@/types/column';
import { TransactionType } from '@/types/transaction';
import { formatRupiah } from '@/utils/currecny';
import { CheckCircle2Icon, TimerIcon, XCircleIcon } from 'lucide-react';

export const columns: ExtendedColumnDef<TransactionType, TransactionType>[] = [
    {
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'voucher.name',
        header: 'Package',
    },
    {
        accessorKey: 'total_price',
        header: 'Total Price',
        cell: ({ row }) => {
            const price = row.original.total + row.original.admin;
            return formatRupiah(Number(price));
        },
    },
    {
        accessorKey: 'status',
        header: () => <div className="w-full text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="flex items-center justify-center">
                    {status === 'SUCCESS' ? (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                    ) : status === 'PENDING' ? (
                        <TimerIcon className="text-warning h-4 w-4" />
                    ) : (
                        <XCircleIcon className="text-destructive h-4 w-4" />
                    )}
                </div>
            );
        },
    },
];
