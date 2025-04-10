<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'id',
        'voucher_id',
        'code',
        'status',
        'total',
        'admin',
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
