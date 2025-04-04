<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class Face extends Model
{
    use HasUuids;

    protected $fillable = ['user_id', 'face_encoding'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
