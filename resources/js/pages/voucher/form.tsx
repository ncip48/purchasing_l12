import Container from '@/components/container';
import FormButton from '@/components/form-button';
import SwitchInput from '@/components/switch';
import TextInput from '@/components/text-input';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { VoucherType } from '@/types/voucher';
import { useFlashToast } from '@/utils/flash';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs = (isEdit: boolean): BreadcrumbItem[] => [
    {
        title: 'Voucher',
        href: '/voucher',
    },
    {
        title: `${isEdit ? 'Edit' : 'Add'} Vouchers`,
        href: '/voucher/form',
    },
];

export default function Form() {
    const { item } = usePage<PageProps<{ item: VoucherType | null }>>().props;

    const BACK_URL = 'voucher.index';

    const isEdit = !!item;

    const { setData, patch, post, errors, processing } = useForm({
        name: isEdit ? item?.name : '',
        price: isEdit ? item?.price : 0,
        duration: isEdit ? item?.duration : 0,
        status: isEdit ? item?.status : 'ACTIVE',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = isEdit ? patch : post;
        const url = isEdit ? route('voucher.update', item.id || '') : route('voucher.store');

        action(url, {
            preserveScroll: true,
        });
    };

    useFlashToast();

    return (
        <AppLayout breadcrumbs={breadcrumbs(isEdit)}>
            <Head title="Vouchers" />
            <Container>
                <Card>
                    <CardContent>
                        <h2 className="mb-4 text-xl font-bold">{isEdit ? 'Edit ' : 'Add'} Voucher</h2>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <TextInput
                                title="Name"
                                name="name"
                                defaultValue={isEdit ? item?.name || '' : ''}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />
                            <TextInput
                                title="Duration"
                                name="duration"
                                defaultValue={isEdit ? item?.duration || 0 : 0}
                                onChange={(e) => setData('duration', Number(e.target.value))}
                                error={errors.duration}
                            />
                            <TextInput
                                title="Price"
                                name="price"
                                defaultValue={isEdit ? item?.price || 0 : 0}
                                onChange={(e) => setData('price', Number(e.target.value))}
                                error={errors.price}
                            />
                            <SwitchInput
                                title="Active"
                                name="status"
                                checked={isEdit ? (item?.status == 'ACTIVE' ? true : false) : true}
                                onCheckedChange={(val) => setData('status', val ? 'ACTIVE' : 'INACTIVE')}
                                error={errors.status}
                            />
                            <FormButton processing={processing} backUrl={BACK_URL} />
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
