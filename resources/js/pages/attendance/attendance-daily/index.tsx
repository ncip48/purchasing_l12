import Container from '@/components/container';
import { AttendanceDialog } from '@/components/dialogs/attendance-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { FaceType } from '@/types/face';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Attendance',
        href: '#',
    },
    {
        title: 'Attendance Daily',
        href: '/attendance/attendance-daily',
    },
];

function Page() {
    const { items } = usePage<PageProps<{ items: FaceType[] }>>().props;

    console.log(items);

    const [openModal, setOpenModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Daily" />
            <Container>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h2 className="mb-4 text-xl font-bold">Attendance Daily</h2>
                            <Button onClick={() => setOpenModal(true)}>Attend</Button>
                        </div>
                    </CardContent>
                </Card>
            </Container>
            <AttendanceDialog open={openModal} setOpen={setOpenModal} />
        </AppLayout>
    );
}

export default Page;
