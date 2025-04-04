import { ColumnDef } from '@tanstack/react-table';

export interface ExtendedColumnDef<TData, TValue> extends Omit<ColumnDef<TData, TValue>, 'childs'> {
    accessorKey: string;
    childs?: ExtendedColumnDef<TData, TValue>[];
}
