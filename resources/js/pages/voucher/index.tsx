import Container from '@/components/container';
import { DataTable } from '@/components/data-table';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { VoucherType } from '@/types/voucher';
import { useFlashToast } from '@/utils/flash';
import { makeToast } from '@/utils/toast';
import { Head, useForm, usePage } from '@inertiajs/react';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Voucher',
        href: '/voucher',
    },
];

export default function Page() {
    const { items } = usePage<PageProps<{ items: VoucherType[] }>>().props;

    useFlashToast();

    const { delete: destroy, processing } = useForm();

    const deleteAction = (id: string) => {
        destroy(route('voucher.destroy', id), {
            preserveScroll: true,
            onSuccess: () => makeToast({ success: true, message: 'Success' }),
            onError: () => makeToast({ success: false, message: 'Error' }),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vouchers" />
            <Container>
                <Card>
                    <CardContent>
                        <h2 className="mb-4 text-xl font-bold">Manage Vouchers</h2>
                        <DataTable columns={columns} data={items} search="name" onDelete={(id) => deleteAction(id)} processingDelete={processing} />
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
