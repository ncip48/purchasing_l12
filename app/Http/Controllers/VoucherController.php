<?php

namespace App\Http\Controllers;

use App\Models\Voucher;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VoucherController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = Voucher::all();
        return Inertia::render('voucher/index', compact('items'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('voucher/form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'duration' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:1',
        ], [
            'duration.min' => 'Duration must be greather than 0.',
            'price.min' => 'Price must be greather than 0.',
        ]);

        Voucher::create([
            'name' => $request->name,
            'duration' => $request->duration,
            'price' => $request->price,
            'status' => $request->status,
        ]);

        return redirect()->route('voucher.index')->with('success', 'Voucher created successfully.');
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
    public function edit(Request $request, string $id)
    {
        return Inertia::render('voucher/form', [
            'item' => Voucher::find($id),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $voucher = Voucher::find($id);
        $request->validate([
            'name' => 'required|string',
            'duration' => 'required|numeric|min:1',
            'price' => 'required|numeric|min:1',
        ], [
            'duration.min' => 'Duration must be greather than 0.',
            'price.min' => 'Price must be greather than 0.',
        ]);

        $voucher->update([
            'name' => $request->name,
            'duration' => $request->duration,
            'price' => $request->price,
            'status' => $request->status,
        ]);

        return redirect()->route('voucher.index')->with('success', 'Voucher updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Voucher::find($id)->delete();
    }
}
