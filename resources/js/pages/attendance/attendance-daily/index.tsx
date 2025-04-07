import AttendanceDailyCalendar from '@/components/calendar/attendance-daily-calendar';
import WorkingTimeCard from '@/components/card/working-time-card';
import Container from '@/components/container';
import { AttendanceDialog } from '@/components/dialogs/attendance-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { AttendanceType, WorkingTimeType } from '@/types/attendance';
import { Head, router, usePage } from '@inertiajs/react';
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

function Page({ items, workingTime }: { items: AttendanceType[]; workingTime: WorkingTimeType }) {
    const { attendanceIn, attendanceOut } = usePage<PageProps<{ attendanceIn: AttendanceType | null; attendanceOut: AttendanceType | null }>>().props;

    const [openModal, setOpenModal] = useState(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance Daily" />
            <Container>
                <Card>
                    <CardContent>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="mb-4 text-xl font-bold">Attendance Daily</h2>
                            <Button onClick={() => setOpenModal(true)}>
                                <StampIcon />
                                Attend
                            </Button>
                        </div>
                        <div className="hidden">
                            <WorkingTimeCard data={workingTime} />
                        </div>
                        <AttendanceDailyCalendar
                            items={items}
                            onClickDate={(date) => {
                                // Make sure to format date as YYYY-MM-DD
                                const formattedDate = date;

                                router.get(route('attendance-daily.index'), { date: formattedDate });
                            }}
                        />
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
