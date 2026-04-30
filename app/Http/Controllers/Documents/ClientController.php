<?php

namespace App\Http\Controllers\Documents;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClientController extends Controller
{
    public function index(): Response
    {
        $clients = Client::where('user_id', auth()->id())
            ->withCount('documents')
            ->latest()
            ->paginate(50);

        return Inertia::render('Documents/Clients', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Client::class);

        $validated = $request->validate($this->rules());

        $client = Client::create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        return response()->json($client, 201);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $this->authorize('update', $client);

        $validated = $request->validate($this->rules());

        $client->update($validated);

        // Return fresh data to ensure JSON reflects persisted state
        return response()->json($client->fresh());
    }

    public function destroy(Client $client): JsonResponse
    {
        // Defense in depth: explicit ownership check
        if ($client->user_id !== auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $this->authorize('delete', $client);

        $hasFinalisedDocuments = $client->documents()
            ->whereNotNull('finalised_at')
            ->exists();

        if ($hasFinalisedDocuments) {
            return response()->json([
                'message' => 'Cannot delete client with finalised documents (GoBD compliance)',
                'blocked' => true,
            ], 409);
        }

        $client->delete();

        return response()->json(['deleted' => true]);
    }

    private function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'company' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'min:2', 'max:2'],
            'ust_id' => ['nullable', 'string', 'max:20'],
        ];
    }
}
