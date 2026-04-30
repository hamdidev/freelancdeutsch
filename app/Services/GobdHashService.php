<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class GobdHashService
{
    public function generate(Document $document, string $prevHash = ''): string
    {
        if (! $document->issued_at) {
            throw new InvalidArgumentException("Document #{$document->id} missing issued_at");
        }

        $issuedAt = $document->issued_at->setTimezone('Europe/Berlin');

        $payload = [
            'number' => $document->number,
            'type' => $document->type,
            'issued_at' => $issuedAt->format('Y-m-d'),
            'sender_name' => $document->sender_name ?? '',
            'sender_steuernummer' => $document->sender_steuernummer ?? '',
            'sender_ust_id' => $document->sender_ust_id ?? '',
            'recipient_name' => $document->recipient_name ?? '',
            'recipient_ust_id' => $document->recipient_ust_id ?? '',
            'subtotal' => number_format((float) $document->subtotal, 2, '.', ''),
            'tax_rate' => number_format((float) $document->tax_rate, 2, '.', ''),
            'tax_amount' => number_format((float) $document->tax_amount, 2, '.', ''),
            'total' => number_format((float) $document->total, 2, '.', ''),
            'currency' => $document->currency ?? 'EUR',
            'prev_hash' => $prevHash,
        ];

        ksort($payload);

        $canonical = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        return hash('sha256', $canonical);
    }

    public function finalise(Document $document): Document
    {
        return DB::transaction(function () use ($document) {

            $prevHash = Document::where('user_id', $document->user_id)
                ->where('type', $document->type)
                ->whereNotNull('gobd_hash')
                ->orderByDesc('finalised_at')
                ->orderByDesc('id')
                ->lockForUpdate()
                ->value('gobd_hash') ?? '';

            $newHash = $this->generate($document, $prevHash);
            $finalisedAt = now();

            $document->update([
                'gobd_hash' => $newHash,
                'gobd_prev_hash' => $prevHash,
                'finalised_at' => $finalisedAt,
                'status' => 'sent',
            ]);

            $document->gobd_hash = $newHash;
            $document->gobd_prev_hash = $prevHash;
            $document->finalised_at = $finalisedAt;
            $document->status = 'sent';
            $document->syncOriginal();

            return $document;
        });
    }

    public function verify(Document $document): bool
    {
        if (! $document->gobd_hash) {
            return false;
        }

        $expected = $this->generate($document, $document->gobd_prev_hash ?? '');

        return hash_equals($expected, $document->gobd_hash);
    }

    public function verifyChain(int $userId, string $type): array
    {
        $errors = [];

        $docs = Document::where('user_id', $userId)
            ->where('type', $type)
            ->whereNotNull('gobd_hash')
            ->orderBy('finalised_at')
            ->orderBy('id')
            ->get();

        $expectedPrev = '';

        foreach ($docs as $doc) {
            if ($doc->gobd_prev_hash !== $expectedPrev) {
                $errors[] = [
                    'document_id' => $doc->id,
                    'issue' => 'broken_chain_link',
                    'expected_prev' => $expectedPrev,
                    'actual_prev' => $doc->gobd_prev_hash,
                ];
            }

            if (! $this->verify($doc)) {
                $errors[] = [
                    'document_id' => $doc->id,
                    'issue' => 'hash_mismatch',
                ];
            }

            $expectedPrev = $doc->gobd_hash;
        }

        return $errors;
    }
}
