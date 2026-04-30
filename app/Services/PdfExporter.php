<?php

namespace App\Services;

use App\Models\Document;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use LogicException;
use RuntimeException;

class PdfExporter
{
    public function __construct(
        protected string $disk = 'local',
    ) {}

    public function export(Document $document): string
    {
        if (! $document->number) {
            throw new LogicException('Document must have a number before PDF export');
        }

        // GoBD: return existing PDF for finalised documents instead of regenerating
        if ($document->finalised_at && $document->pdf_path) {
            return $document->pdf_path;
        }

        $document->loadMissing('items', 'user', 'client');

        try {
            $pdf = Pdf::loadView('documents.pdf.'.$document->type, [
                'document' => $document,
            ])->setPaper('a4');
            // isRemoteEnabled intentionally omitted — no external resources in invoices

            $filename = sprintf(
                '%d_%s_%s.pdf',
                $document->id,
                strtolower($document->type),
                $document->finalised_at ? 'final' : 'draft'
            );

            $path = 'documents/'.$document->user_id.'/'.$filename;

            Storage::disk($this->disk)->put($path, $pdf->output());

            $document->update(['pdf_path' => $path]);

            return $path;
        } catch (\Exception $e) {
            Log::error('PDF export failed', [
                'document_id' => $document->id,
                'number' => $document->number,
                'error' => $e->getMessage(),
            ]);

            throw new RuntimeException(
                'Failed to generate PDF for document #'.$document->id,
                0,
                $e
            );
        }
    }

    public function stream(Document $document): Response
    {
        $document->loadMissing('items');

        try {
            return Pdf::loadView('documents.pdf.'.$document->type, [
                'document' => $document,
            ])->setPaper('a4')->stream($document->number.'.pdf');
        } catch (\Exception $e) {
            Log::warning('PDF stream failed', [
                'document_id' => $document->id,
                'error' => $e->getMessage(),
            ]);

            abort(500, 'Unable to generate PDF preview');
        }
    }

    public function url(Document $document): ?string
    {
        if (! $document->pdf_path) {
            return null;
        }

        $diskConfig = config("filesystems.disks.{$this->disk}");

        // Only attempt temporaryUrl on S3-compatible disks
        $supportsTemporaryUrls = in_array(
            $diskConfig['driver'] ?? '',
            ['s3', 'gcs', 'r2']
        );

        if ($supportsTemporaryUrls) {
            return Storage::disk($this->disk)->temporaryUrl(
                $document->pdf_path,
                now()->addMinutes(15)
            );
        }

        // Local disk — serve through a signed route instead
        return route('documents.download', $document);
    }
}
