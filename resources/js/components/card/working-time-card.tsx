// components/WorkingTimeCard.tsx

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SharedData } from '@/types';
import { WorkingTimeType } from '@/types/attendance';
import { getInitialName } from '@/utils/string';
import { usePage } from '@inertiajs/react';
import moment from 'moment';

export default function WorkingTimeCard({ data }: { data: WorkingTimeType }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <div className="flex flex-col gap-4 md:flex-row">
            {/* Profile Section */}
            <Card className="w-full text-center md:w-1/4">
                <CardHeader>
                    <Avatar className="mx-auto h-16 w-16">
                        <AvatarFallback>{getInitialName(auth.user.name)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="mt-4 text-lg font-semibold">{auth.user.name}</CardTitle>
                    <p className="text-muted-foreground text-sm">{auth.user.email}</p>
                </CardHeader>
            </Card>

            {/* Working Time Section */}
            <Card className="w-full md:w-3/4">
                <CardHeader>
                    <CardTitle>
                        {data.date === new Date().toISOString().split('T')[0]
                            ? "Today's Working Time"
                            : `Working Time - ${moment(data.date).format('DD MMM YYYY')}`}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
                        <div>
                            <p className="text-lg font-semibold">{data.in}</p>
                            <p className="text-muted-foreground text-sm">Check-In Time</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{data.out}</p>
                            <p className="text-muted-foreground text-sm">Check-Out Time</p>
                        </div>
                        <div>
                            <p className="text-lg font-semibold">{data.time}</p>
                            <p className="text-muted-foreground text-sm">Total Time</p>
                        </div>
                    </div>

                    {/* Progress Bar Placeholder */}
                    <div className="bg-muted mt-8 h-2 w-full rounded-full" />
                </CardContent>
            </Card>
        </div>
    );
}
