import Container from '@/components/container';
import FormButton from '@/components/form-button';
import TextInput from '@/components/text-input';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { PermissionType } from '@/types/permission';
import { useFlashToast } from '@/utils/flash';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs = (isEdit: boolean): BreadcrumbItem[] => [
    {
        title: 'Role & Permission',
        href: '#',
    },
    {
        title: 'Permissions',
        href: '/role-permission/permissions',
    },
    {
        title: `${isEdit ? 'Edit' : 'Add'} Permissions`,
        href: '/role-permission/permissions/form',
    },
];

export default function Form() {
    const { item } = usePage<PageProps<{ item: PermissionType | null }>>().props;

    const BACK_URL = 'permissions.index';

    const isEdit = !!item;

    const { setData, patch, post, errors, processing } = useForm({
        guard_name: isEdit ? item?.guard_name : '',
        name: isEdit ? item?.name : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const action = isEdit ? patch : post;
        const url = isEdit ? route('permissions.update', item.uuid || '') : route('permissions.store');

        action(url, {
            preserveScroll: true,
        });
    };

    useFlashToast();

    return (
        <AppLayout breadcrumbs={breadcrumbs(isEdit)}>
            <Head title="Permissions" />
            <Container>
                <Card>
                    <CardContent>
                        <h2 className="mb-4 text-xl font-bold">{isEdit ? 'Edit ' : 'Add'} Permissions</h2>
                        <form onSubmit={submit} className="flex flex-col gap-4">
                            <TextInput
                                title="Guard"
                                name="guard_name"
                                defaultValue={isEdit ? item?.guard_name || '' : ''}
                                onChange={(e) => setData('guard_name', e.target.value)}
                                error={errors.guard_name}
                            />
                            <TextInput
                                title="Name"
                                name="name"
                                defaultValue={isEdit ? item?.name || '' : ''}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                            />
                            <FormButton processing={processing} backUrl={BACK_URL} />
                        </form>
                    </CardContent>
                </Card>
            </Container>
        </AppLayout>
    );
}
