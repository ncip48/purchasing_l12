import moment from 'moment';

export function generateMonthlyAttendanceData(
    year: number,
    month: number, // 1-indexed (1 = January)
    attendance: Record<string, string> = {},
) {
    const startOfMonth = moment([year, month - 1]).startOf('month');
    const endOfMonth = moment([year, month - 1]).endOf('month');

    const calendarStart = startOfMonth.clone().startOf('week');
    const calendarEnd = endOfMonth.clone().endOf('week');

    const weeks = [];
    const current = calendarStart.clone();

    while (current.isSameOrBefore(calendarEnd, 'day')) {
        const weekStart = current.clone();
        const weekEnd = current.clone().add(6, 'days');

        const days = [];
        let totalSeconds = 0;

        for (let i = 0; i < 7; i++) {
            const date = current.clone();
            const dateStr = date.format('YYYY-MM-DD');

            let duration = null;
            let highlight = false;

            if (date.isSameOrAfter(startOfMonth, 'day') && date.isSameOrBefore(endOfMonth, 'day')) {
                duration = attendance[dateStr] || '00:00:00';
                highlight = duration !== '00:00:00';

                const [h, m, s] = duration.split(':').map(Number);
                totalSeconds += h * 3600 + m * 60 + s;
            }

            days.push({
                date: dateStr,
                duration,
                highlight,
            });

            current.add(1, 'day');
        }

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const totalDuration = `${hours}h ${minutes}m`;

        const adjustedStart = weekStart.clone().isBefore(startOfMonth) ? startOfMonth.clone() : weekStart;
        const adjustedEnd = weekEnd.clone().isAfter(endOfMonth) ? endOfMonth.clone() : weekEnd;

        const range = `${adjustedStart.format('DD')} - ${adjustedEnd.format('DD')}`;

        weeks.push({
            range,
            days,
            total: totalDuration,
        });
    }

    return weeks;
}
