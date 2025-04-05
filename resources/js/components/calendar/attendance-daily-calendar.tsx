import { AttendanceType } from '@/types/attendance';
import { addHours } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
} from '../ui/full-calendar';

function AttendanceDailyCalendar({ items }: { items: AttendanceType[] }) {
    return (
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
    );
}

export default AttendanceDailyCalendar;
