import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarDays, CalendarIcon } from 'lucide-react';
import moment from 'moment';
import { Card } from '../ui/card';

type AttendanceDay = {
    date: string; // ISO: '2025-04-03'
    duration: string | null; // '07:00:07' or '00:00:00'
    highlight?: boolean;
};

type AttendanceWeek = {
    range: string; // '01 - 05'
    total: string; // '14h 50m' or '0 seconds'
    days: AttendanceDay[];
};

type Props = {
    user: string;
    month: string; // e.g., "April"
    weeks: AttendanceWeek[];
    grandTotal?: string; // e.g. "14h 50m"
};

export default function AttendanceTable({ user, month, weeks, grandTotal }: Props) {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <Card className="p-0">
            <div className="overflow-hidden rounded-xl shadow-sm">
                <div className="flex items-center justify-between border-b px-6 py-4 text-lg font-semibold">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        {month} - {user}
                    </div>

                    {grandTotal && <span className="text-sm font-semibold text-red-500">{grandTotal}</span>}
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-sm">
                        <thead className="text-muted-foreground">
                            <tr className="border-b">
                                <th className="px-4 py-2 text-left">Week</th>
                                <th className="px-4 py-2 text-left">Total Worked</th>
                                {weekdays.map((day) => (
                                    <th key={day} className="px-4 py-2 text-center">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weeks.map((week, i) => (
                                <tr key={i} className={cn('border-b', i === weeks.length - 1 && 'border-none')}>
                                    <td className="text-muted-foreground px-4 py-2 font-medium whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" />
                                            {week.range}
                                        </div>
                                    </td>

                                    <td className="px-4 py-2 whitespace-nowrap">{week.total}</td>
                                    {week.days.map((day, j) => (
                                        <td key={j} className="px-2 py-2 text-center">
                                            {day.duration && (
                                                <>
                                                    <div className="text-muted-foreground mb-1 text-xs">{moment(day.date).format('YYYY-MM-DD')}</div>
                                                    <Badge
                                                        variant={day.highlight ? 'default' : 'secondary'}
                                                        className="rounded-full px-2 py-1 text-xs"
                                                    >
                                                        {day.duration}
                                                    </Badge>
                                                </>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
}
