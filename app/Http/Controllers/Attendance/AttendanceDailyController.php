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
            'time' => $totalTime ? $totalTime >= 60 ? floor($totalTime / 60) . 'h, ' . round($totalTime % 60) . 'm' : round($totalTime) . 'm' : '-',
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
        $request->validate([
            'photo' => 'required|file|image|max:2048', // Max 2MB
            'latitude' => 'required',
            'longitude' => 'required',
            'type' => 'required|in:IN,OUT',
        ]);

        $photoPath = null;

        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = uniqid('attendance_') . '.' . $file->getClientOriginalExtension();

            // Ensure directory exists
            $destinationPath = public_path('img/attendance');
            if (!file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }

            // Move the file manually to public/img/attendance
            $file->move($destinationPath, $filename);

            $photoPath = 'img/attendance/' . $filename; // Save relative path for access
        }

        Attendance::create([
            'user_id' => $request->user()->id,
            'photo' => $photoPath,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'type' => $request->type,
        ]);
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
