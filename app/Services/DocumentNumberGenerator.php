<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\DB;

class DocumentNumberGenerator
{
    public function generate(int $userId, string $type): string
    {
        $prefix = match ($type) {
            'invoice' => 'INV',
            'proposal' => 'PRO',
            'contract' => 'CON',
            default => 'DOC',
        };

        $year = now()->format('Y');

        return DB::transaction(function () use ($userId, $type, $prefix, $year) {
            if (DB::getDriverName() === 'pgsql') {
                // Advisory lock prevents duplicate sequence numbers under concurrent requests.
                // crc32() on 64-bit PHP returns unsigned values; pg_advisory_xact_lock
                // expects signed int32 — reinterpret via pack/unpack to stay in range.
                $signed = static fn (int $n): int => unpack('l', pack('L', $n))[1];

                DB::statement('SELECT pg_advisory_xact_lock(?, ?)', [
                    $signed(crc32("doc_{$userId}")),
                    $signed(crc32("{$type}_{$year}")),
                ]);
            }

            $last = Document::where('user_id', $userId)
                ->where('type', $type)
                ->whereYear('created_at', $year)
                ->orderByDesc('id')
                ->value('number');

            $sequence = 1;
            if ($last && preg_match('/-(\d{4})$/', $last, $matches)) {
                $sequence = (int) $matches[1] + 1;
            }

            return sprintf('%s-%s-%04d', $prefix, $year, $sequence);
        });
    }
}
