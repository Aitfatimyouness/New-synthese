<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Travel extends Model
{
    protected $table = 'travels';

    protected $fillable = ['formation_session_id', 'user_id', 'origin', 'destination', 'transport_mode', 'travel_date', 'cost', 'status'];
}
