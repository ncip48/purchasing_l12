export type AttendanceMutationType = {
    photo: string;
    latitude: string;
    longitude: string;
    type: 'IN' | 'OUT';
};

export type AttendanceType = {
    id: string;
    user_id: string;
    photo: string;
    latitude: string;
    longitude: string;
    type: 'IN' | 'OUT';
    created_at: string;
    updated_at: string;
};

export type WorkingTimeType = {
    in: string;
    out: string;
    time: string;
    date: string;
};
