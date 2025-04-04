import { ExtendedColumnDef } from '@/types/column';
import { PermissionType } from '@/types/permission';

export const columns: ExtendedColumnDef<PermissionType, PermissionType>[] = [
    {
        accessorKey: 'guard_name',
        header: 'Guard',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'updated',
        header: 'Updated',
    },
];
