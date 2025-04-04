'use client';

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    HeaderContext,
    useReactTable,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router, usePage } from '@inertiajs/react';
import { PencilIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import React, { ReactNode } from 'react';
import { DeleteDialog } from './dialogs/delete-dialog';
import LoadingDots from './loading/loading-dots';

// Extend the ColumnDef interface to include the 'childs' and 'accessorKey' properties
interface ExtendedColumnDef<TData, TValue> extends Omit<ColumnDef<TData, TValue>, 'childs'> {
    accessorKey: string;
    childs?: ExtendedColumnDef<TData, TValue>[];
}

interface DataTableProps<TData extends { id: string }, TValue> {
    columns: ExtendedColumnDef<TData, TValue>[];
    data: TData[];
    search: string;
    onDelete?: (id: string) => void;
    add?: boolean;
    edit?: boolean;
    leftAction?: (item: TData) => React.ReactNode;
    processingDelete?: boolean;
}

export function DataTable<TData extends { id: string }, TValue>({
    columns,
    data,
    search,
    onDelete,
    add = true,
    edit = true,
    leftAction,
    processingDelete,
}: DataTableProps<TData, TValue>) {
    const page = usePage();

    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns: columns as ColumnDef<TData, TValue>[],
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            columnFilters,
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between gap-2 py-4">
                <Input
                    placeholder="Search data..."
                    value={(table.getColumn(search)?.getFilterValue() as string) ?? ''}
                    onChange={(event) => table.getColumn(search)?.setFilterValue(event.target.value)}
                    className="max-w-sm"
                />
                {add && (
                    <Button size="sm" onClick={() => router.get(`${page.url}/create`)} className="cursor-pointer">
                        <PlusCircleIcon />
                        Add
                    </Button>
                )}
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {/* Render parent headers */}
                                <TableHead rowSpan={2} className="border text-center">
                                    #
                                </TableHead>
                                {headerGroup.headers.map((header) => {
                                    const columnDef = header.column.columnDef as ExtendedColumnDef<TData, TValue>;
                                    if (columnDef.childs) {
                                        return (
                                            <TableHead key={header.id} colSpan={columnDef.childs.length} className="border text-center">
                                                {flexRender(columnDef.header, header.getContext() as HeaderContext<TData, TValue>)}
                                            </TableHead>
                                        );
                                    } else {
                                        return (
                                            <TableHead key={header.id} rowSpan={2} className="border">
                                                {typeof columnDef.header === 'function'
                                                    ? columnDef.header(header.getContext() as HeaderContext<TData, TValue>)
                                                    : columnDef.header}
                                            </TableHead>
                                        );
                                    }
                                })}
                                <TableHead rowSpan={2} className="border"></TableHead>
                            </TableRow>
                        ))}

                        {/* Render child headers */}
                        <TableRow>
                            {columns
                                .filter((column) => column.childs)
                                .flatMap((column) =>
                                    column.childs!.map((child) => (
                                        <TableHead key={child.accessorKey} className="border text-center">
                                            {child.header as ReactNode}
                                        </TableHead>
                                    )),
                                )}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row, idx) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {/* Render the row index */}
                                    <TableCell className="border text-center">
                                        {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + idx + 1}
                                    </TableCell>

                                    {/* Render cells */}
                                    {columns.map((column) => {
                                        if (column.childs) {
                                            // Render each child as a separate <td>
                                            return column.childs.map((child) => (
                                                <TableCell key={`${column.accessorKey}-${child.accessorKey}`} className="border text-center">
                                                    {(row.original as Record<string, ReactNode>)[child.accessorKey]}
                                                </TableCell>
                                            ));
                                        } else {
                                            // Render regular column values
                                            return (
                                                <TableCell key={column.accessorKey} className="border">
                                                    {(row.original as Record<string, ReactNode>)[column.accessorKey]}
                                                </TableCell>
                                            );
                                        }
                                    })}

                                    {/* Render action buttons */}
                                    <TableCell className="flex items-center justify-center gap-2">
                                        {leftAction && leftAction(data[Number(row.id)])}
                                        {edit && (
                                            <Button
                                                size="sm"
                                                onClick={() => router.get(`${page.url}/${data[Number(row.id)].id}/edit`)}
                                                className="cursor-pointer"
                                            >
                                                <PencilIcon />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <DeleteDialog
                                                onClick={() => {
                                                    console.log('asdsad');

                                                    onDelete(data[Number(row.id)].id);
                                                }}
                                            >
                                                <Button variant={'destructive'} size="sm" className="cursor-pointer">
                                                    {processingDelete ? <LoadingDots color="white" /> : <Trash2Icon />}
                                                </Button>
                                            </DeleteDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 5} // Adjust for index and action columns
                                    className="h-24 text-center"
                                >
                                    No data available.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="mt-4 flex items-center justify-between">
                {/* <div className="text-muted-foreground flex-1 text-sm"></div> */}
                <div className="flex w-full items-center justify-between space-x-6 lg:space-x-8">
                    {/* <div className="flex items-center space-x-2"></div> */}
                    <div className="flex items-center justify-center text-sm font-medium">
                        Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                            <span>Previous</span>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            <span>Next</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
