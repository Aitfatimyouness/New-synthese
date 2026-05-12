<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Accommodation extends Model
{
    protected $fillable = ['formation_session_id', 'user_id', 'hotel_name', 'city', 'check_in', 'check_out', 'cost', 'status'];
}
