<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Face;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class FacialPhotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $face = Face::with('user')->where('user_id', $request->user()->id)->select('user_id', 'id', 'photo', 'created_at')->first();
        return Inertia::render('attendance/facial-photo/index', compact('face'));
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
            'image' => 'required|image',
        ]);

        $image = $request->file('image');

        $userId = $request->user()->id;
        $apiUrl = env("API_URL");
        $response = Http::attach(
            'image',
            file_get_contents($image->getRealPath()),
            $image->getClientOriginalName()
        )
            ->withHeaders([
                'Authorization' => "Bearer $userId",
            ])
            ->post("$apiUrl/api/train-face");

        if ($response->successful()) {
            return response()->json([
                'success' => true,
                'message' => 'Face added successfully',
                'data' => $response->json(),
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Face added failed',
                'error' => $response->body(),
            ], 500);
        }
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
