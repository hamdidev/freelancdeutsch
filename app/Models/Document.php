<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'client_id',
        'type',
        'status',
        'number',
        'locale',
        'sender_name',
        'sender_address',
        'sender_email',
        'sender_steuernummer',
        'sender_ust_id',
        'recipient_name',
        'recipient_company',
        'recipient_address',
        'recipient_ust_id',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total',
        'currency',
        'is_kleinunternehmer',
        'is_reverse_charge',
        'payment_terms',
        'notes',
        'footer',
        'issued_at',
        'due_at',
        'paid_at',
        'gobd_hash',
        'gobd_prev_hash',
        'finalised_at',
        'pdf_path',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'due_at' => 'date',
        'paid_at' => 'date',
        'finalised_at' => 'datetime',
        'is_kleinunternehmer' => 'boolean',
        'is_reverse_charge' => 'boolean',
        'subtotal' => 'decimal:2',
        'tax_rate' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(DocumentItem::class)->orderBy('position');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(DocumentAuditLog::class);
    }

    public function isFinalised(): bool
    {
        return $this->finalised_at !== null;
    }

    public function isEditable(): bool
    {
        return in_array($this->status, ['draft']);
    }
}
