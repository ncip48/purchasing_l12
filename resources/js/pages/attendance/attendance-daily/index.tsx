import Container from '@/components/container';
import { AttendanceDialog } from '@/components/dialogs/attendance-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Calendar,
    CalendarCurrentDate,
    CalendarDayView,
    CalendarMonthView,
    CalendarNextTrigger,
    CalendarPrevTrigger,
    CalendarTodayTrigger,
    CalendarWeekView,
    CalendarYearView,
} from '@/components/ui/full-calendar';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PageProps } from '@/types';
import { AttendanceType } from '@/types/attendance';
import { Head, usePage } from '@inertiajs/react';
import { addHours } from 'date-fns';
import { ChevronLeft, ChevronRight, StampIcon } from 'lucide-react';
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
                        <Calendar
                            events={items.map((item) => ({
                                id: item.id,
                                start: new Date(item.created_at),
                                end: addHours(new Date(item.created_at), 2),
                                title: item.type === 'IN' ? 'Clock-In' : 'Clock-Out',
                                color: item.type === 'IN' ? 'pink' : 'blue',
                            }))}
                        >
                            <div className="flex h-dvh flex-col py-5">
                                <div className="mb-6 flex items-center gap-2">
                                    <CalendarCurrentDate />

                                    <span className="flex-1" />

                                    <CalendarPrevTrigger>
                                        <ChevronLeft size={20} />
                                        <span className="sr-only">Previous</span>
                                    </CalendarPrevTrigger>

                                    <CalendarTodayTrigger>Today</CalendarTodayTrigger>

                                    <CalendarNextTrigger>
                                        <ChevronRight size={20} />
                                        <span className="sr-only">Next</span>
                                    </CalendarNextTrigger>

                                    {/* <ModeToggle /> */}
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <CalendarDayView />
                                    <CalendarWeekView />
                                    <CalendarMonthView />
                                    <CalendarYearView />
                                </div>
                            </div>
                        </Calendar>
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
