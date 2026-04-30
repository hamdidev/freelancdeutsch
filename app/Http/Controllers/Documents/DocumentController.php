<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Document;
use App\Models\DocumentAuditLog;
use App\Services\DocumentCalculator;
use App\Services\DocumentNumberGenerator;
use App\Services\GobdHashService;
use App\Services\PdfExporter;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DocumentController extends Controller
{
    public function __construct(
        private DocumentNumberGenerator $numberGenerator,
        private DocumentCalculator $calculator,
        private GobdHashService $gobd,
        private PdfExporter $pdf,
    ) {}

    public function index(): Response
    {
        $documents = Document::where('user_id', auth()->id())
            ->with('client')
            ->latest()
            ->paginate(20);

        return Inertia::render('Documents/Index', [
            'documents' => $documents,
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Documents/Create', [
            'type' => $request->get('type', 'invoice'),
            'clients' => Client::where('user_id', auth()->id())->get(['id', 'name', 'email']),
            'user' => auth()->user()->only([
                'name',
                'email',
                'steuernummer',
                'ust_id',
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:invoice,proposal,contract'],
            'client_id' => ['nullable', 'exists:clients,id,user_id,'.auth()->id()],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_company' => ['nullable', 'string', 'max:255'],
            'recipient_address' => ['nullable', 'string', 'max:500'],
            'recipient_ust_id' => ['nullable', 'string', 'max:20'],
            'issued_at' => ['required', 'date'],
            'tax_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'is_kleinunternehmer' => ['nullable', 'boolean'],
            'is_reverse_charge' => ['nullable', 'boolean'],
            'payment_terms' => ['nullable', 'integer', 'min:1', 'max:365'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'sender_address' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.unit' => ['required', 'string', 'max:20'],
        ]);

        return DB::transaction(function () use ($validated) {
            $user = auth()->user();
            $number = $this->numberGenerator->generate($user->id, $validated['type']);
            $issuedAt = Carbon::parse($validated['issued_at'])->startOfDay();

            $terms = (int) ($validated['payment_terms'] ?? 14);
            $dueAt = $validated['type'] === 'invoice'
                ? $issuedAt->copy()->addDays($terms)
                : null;

            $document = Document::create([
                'user_id' => $user->id,
                'client_id' => $validated['client_id'] ?? null,
                'type' => $validated['type'],
                'status' => 'draft',
                'number' => $number,
                'locale' => 'de',
                'currency' => 'EUR',
                // Sender snapshot (critical for GoBD audit trail)
                'sender_name' => $user->name,
                'sender_address' => $validated['sender_address'] ?? '',
                'sender_email' => $user->email,
                'sender_steuernummer' => $user->steuernummer,
                'sender_ust_id' => $user->ust_id,
                // Recipient data
                'recipient_name' => $validated['recipient_name'],
                'recipient_company' => $validated['recipient_company'] ?? null,
                'recipient_address' => $validated['recipient_address'] ?? null,
                'recipient_ust_id' => $validated['recipient_ust_id'] ?? null,
                // Financials
                'tax_rate' => $validated['tax_rate'],
                'is_kleinunternehmer' => $validated['is_kleinunternehmer'] ?? false,
                'is_reverse_charge' => $validated['is_reverse_charge'] ?? false,
                'payment_terms' => $validated['payment_terms'] ?? 14,
                'notes' => $validated['notes'] ?? null,
                'issued_at' => $issuedAt,
                'due_at' => $dueAt,
            ]);

            // Create line items with position ordering
            foreach ($validated['items'] as $position => $item) {
                $document->items()->create([
                    'description' => $item['description'],
                    'quantity' => $item['quantity'],
                    'unit' => $item['unit'],
                    'unit_price' => $item['unit_price'],
                    'total' => round($item['quantity'] * $item['unit_price'], 2),
                    'position' => $position,
                ]);
            }

            // Recalculate totals (ensures financial accuracy)
            $this->calculator->recalculate($document);

            // Log creation
            $this->audit($document, 'created');

            return redirect()->route('documents.show', $document)
                ->with('status', 'Document created.');
        });
    }

    public function show(Document $document): Response
    {
        $this->authorize('view', $document);

        // Load only necessary audit log fields to avoid over-fetching
        return Inertia::render('Documents/Show', [
            'document' => $document->load([
                'items',
                'client',
                'auditLogs' => fn ($query) => $query->select('id', 'action', 'performed_at', 'payload')->latest(),
            ]),
        ]);
    }

    public function finalise(Document $document): RedirectResponse
    {
        $this->authorize('update', $document);

        if ($document->finalised_at) {
            return back()->withErrors(['document' => 'Document is already finalised.']);
        }

        if (! $document->number || $document->total === null) {
            return back()->withErrors(['document' => 'Document must be complete before finalisation.']);
        }

        try {
            // Single transaction — gobd->finalise() uses DB::transaction() internally
            // which creates a savepoint here since we're already in one
            DB::transaction(function () use ($document) {
                $this->gobd->finalise($document);
                $this->pdf->export($document);
            });

            // Audit outside transaction — non-critical, logged separately
            try {
                $this->audit($document, 'finalised');
            } catch (Throwable $e) {
                Log::warning('Audit log failed after finalisation', [
                    'document_id' => $document->id,
                    'error' => $e->getMessage(),
                ]);
            }

            return back()->with('status', 'Document finalised and PDF generated.');
        } catch (Throwable $e) {
            // No compensating update needed — transaction rolled back automatically
            Log::error('Document finalisation failed', [
                'document_id' => $document->id,
                'number' => $document->number,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['document' => 'Failed to finalise document. Please try again.']);
        }
    }

    public function markPaid(Document $document): RedirectResponse
    {
        $this->authorize('update', $document);

        // Guard: Only invoices can be marked paid
        if ($document->type !== 'invoice') {
            return back()->withErrors(['document' => 'Only invoices can be marked as paid.']);
        }

        // Guard: Must be finalised first
        if (! $document->finalised_at) {
            return back()->withErrors(['document' => 'Document must be finalised before marking as paid.']);
        }

        $document->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        $this->audit($document, 'marked_paid');

        return back()->with('status', 'Document marked as paid.');
    }

    public function download(Document $document): \Illuminate\Http\Response
    {
        $this->authorize('view', $document);

        // Guard: Allow download of drafts too, but warn if not finalised
        if (! $document->pdf_path) {
            // Generate on-the-fly if not yet exported
            $this->pdf->export($document);
        }

        return $this->pdf->stream($document);
    }

    public function destroy(Document $document): RedirectResponse
    {
        $this->authorize('view', $document);

        // GoBD compliance: Finalised documents are immutable and cannot be deleted
        if ($document->finalised_at) {
            Log::warning('Attempted to delete finalised document', [
                'document_id' => $document->id,
                'number' => $document->number,
                'user_id' => auth()->id(),
            ]);

            return back()->withErrors(['document' => 'Finalised documents cannot be deleted (GoBD compliance).']);
        }

        $document->delete();

        $this->audit($document, 'deleted');

        return redirect()->route('documents.index')
            ->with('status', 'Draft deleted.');
    }

    /**
     * Record an audit log entry for the document.
     */
    private function audit(Document $document, string $action): void
    {
        DocumentAuditLog::create([
            'document_id' => $document->id,
            'user_id' => auth()->id(),
            'action' => $action,
            'payload' => [
                'status' => $document->status,
                'total_cents' => (int) round($document->total * 100),
                'number' => $document->number,
                'type' => $document->type,
            ],
            'ip_address' => request()->ip(),
            'performed_at' => now(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
