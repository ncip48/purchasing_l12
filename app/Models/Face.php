<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Face extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['user_id', 'face_encoding', 'photo'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
