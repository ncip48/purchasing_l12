import { ExtendedColumnDef } from '@/types/column';
import { VoucherType } from '@/types/voucher';
import { formatRupiah } from '@/utils/currecny';
import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';

export const columns: ExtendedColumnDef<VoucherType, VoucherType>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
        cell: ({ row }) => {
            const hours = row.original.duration / 60;
            return `${row.original.duration} menit (${hours} jam)`;
        },
    },
    {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => {
            const price = row.original.price;
            return formatRupiah(Number(price));
        },
    },
    {
        accessorKey: 'status',
        header: () => <div className="w-full text-center">Active</div>,
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <div className="flex items-center justify-center">
                    {status === 'ACTIVE' ? (
                        <CheckCircle2Icon className="h-4 w-4 text-green-500" />
                    ) : (
                        <XCircleIcon className="text-destructive h-4 w-4" />
                    )}
                </div>
            );
        },
    },
];
