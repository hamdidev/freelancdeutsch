<?php

namespace App\Services;

use App\Models\Document;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class DocumentCalculator
{
    public function recalculate(Document $document): Document
    {
        if ($document->finalised_at) {
            throw new RuntimeException(
                "Cannot recalculate document #{$document->id} after finalisation"
            );
        }

        return DB::transaction(function () use ($document) {

            // Load items inside transaction to avoid stale reads
            $items = $document->items()->lockForUpdate()->get();

            $subtotal = 0;

            foreach ($items as $item) {
                $totalCents = (int) round($item->quantity * $item->unit_price * 100);
                $total = $totalCents / 100;

                $item->update(['total' => $total]);
                $subtotal += $total;
            }

            $subtotal = round($subtotal, 2);
            $taxAmount = ($document->is_kleinunternehmer || $document->is_reverse_charge)
                ? 0
                : round($subtotal * ($document->tax_rate / 100), 2);
            $total = round($subtotal + $taxAmount, 2);

            $document->update([
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'total' => $total,
            ]);

            $document->subtotal = $subtotal;
            $document->tax_amount = $taxAmount;
            $document->total = $total;
            $document->syncOriginal();

            return $document;
        });
    }
}
