import { ExtendedColumnDef } from '@/types/column';
import { VoucherType } from '@/types/voucher';

export const columns: ExtendedColumnDef<VoucherType, VoucherType>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'duration',
        header: 'Duration',
    },
    {
        accessorKey: 'price',
        header: 'Price',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
];
