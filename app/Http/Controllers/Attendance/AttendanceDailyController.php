<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceDailyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $filterDate = $request->input('date', today()->toDateString());

        // Use new queries each time to avoid reusing consumed builder
        $items = Attendance::where('user_id', $userId)->get();

        $attendanceToday = Attendance::where('user_id', $userId)
            ->whereDate('created_at', today())
            ->get();

        $attendanceIn = $attendanceToday->firstWhere('type', 'IN');
        $attendanceOut = $attendanceToday->firstWhere('type', 'OUT');

        $checkIn = Attendance::where('user_id', $userId)
            ->whereDate('created_at', $filterDate)
            ->where('type', 'IN')
            ->first();

        $checkOut = Attendance::where('user_id', $userId)
            ->whereDate('created_at', $filterDate)
            ->where('type', 'OUT')
            ->first();

        $totalTime = ($checkIn && $checkOut)
            ? $checkIn->created_at->diffInMinutes($checkOut->created_at)
            : 0;

        $workingTime = [
            'in' => $checkIn ? $checkIn->created_at->setTimezone('Asia/Jakarta')->format('H:i') : '-',
            'out' => $checkOut ? $checkOut->created_at->setTimezone('Asia/Jakarta')->format('H:i') : '-',
            'time' => $totalTime ? $totalTime >= 60 ? floor($totalTime / 60) . ' hours, ' . round($totalTime % 60) . ' minutes' : $totalTime . ' minutes' : '-',
            'date' => $filterDate,
        ];

        return Inertia::render('attendance/attendance-daily/index', compact(
            'attendanceIn',
            'attendanceOut',
            'items',
            'workingTime',
        ));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request['user_id'] = $request->user()->id;
        Attendance::create($request->all());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
