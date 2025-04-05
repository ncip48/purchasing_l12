import AttendanceDailyCalendar from '@/components/calendar/attendance-daily-calendar';
import Container from '@/components/container';
import { AttendanceDialog } from '@/components/dialogs/attendance-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { AttendanceType } from '@/types/attendance';
import { Head, usePage } from '@inertiajs/react';
import { StampIcon } from 'lucide-react';
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

function Page({ items }: { items: AttendanceType[] }) {
    const { attendanceIn, attendanceOut } = usePage<PageProps<{ attendanceIn: AttendanceType | null; attendanceOut: AttendanceType | null }>>().props;

    const [openModal, setOpenModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Daily" />
            <Container>
                <Card>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <h2 className="mb-4 text-xl font-bold">Attendance Daily</h2>
                            <Button onClick={() => setOpenModal(true)}>
                                <StampIcon />
                                Attend
                            </Button>
                        </div>
                        <AttendanceDailyCalendar items={items} />
                    </CardContent>
                </Card>
            </Container>
            <AttendanceDialog
                open={openModal}
                setOpen={setOpenModal}
                attendance={{ in: attendanceIn ? attendanceIn?.created_at : null, out: attendanceOut ? attendanceOut?.created_at : null }}
            />
        </AppLayout>
    );
}

export default Page;
