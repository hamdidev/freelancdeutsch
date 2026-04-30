<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentAuditLog extends Model
{
    protected $fillable = [
        'document_id',
        'user_id',
        'action',
        'payload',
        'user_agent',
        'ip_address',
        'performed_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'performed_at' => 'datetime',
    ];
}
