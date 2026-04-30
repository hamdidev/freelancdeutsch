<?php

namespace App\Policies;

use App\Models\Client;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClientPolicy
{
    use HandlesAuthorization;

    /**
     * Pre-authorization hook for admin bypass (optional).
     * GoBD rules always take precedence.
     */
    public function before(User $user, string $ability, ?Client $client = null): ?bool
    {
        if ($user->hasRole('superadmin')) {
            // GoBD: Never allow modification/deletion of clients with finalised documents
            if (
                in_array($ability, ['delete', 'forceDelete', 'restore'])
                && $client?->documents()->whereNotNull('finalised_at')->exists()
            ) {
                return false;
            }

            return true;
        }

        return null;
    }

    public function view(User $user, Client $client): bool
    {
        return $client->user_id !== null && $user->id === $client->user_id;
    }

    public function create(User $user): bool
    {
        // Optional: Add business rules (e.g., subscription tier limits)
        return true;
    }

    public function update(User $user, Client $client): bool
    {
        return $client->user_id !== null && $user->id === $client->user_id;
    }

    public function delete(User $user, Client $client): bool
    {
        // GoBD: Clients with finalised documents cannot be deleted (audit trail integrity)
        if ($client->documents()->whereNotNull('finalised_at')->exists()) {
            return false;
        }

        return $client->user_id === $user->id;
    }

    // ─────────────────────────────────────────────────────────────
    // Soft Delete Support (if Client model uses SoftDeletes trait)
    // ─────────────────────────────────────────────────────────────

    public function restore(User $user, Client $client): bool
    {
        return $client->user_id === $user->id
            && $client->trashed()
            && ! $client->documents()->whereNotNull('finalised_at')->exists();
    }

    public function forceDelete(User $user, Client $client): bool
    {
        // GoBD: NEVER allow permanent deletion if finalised documents exist
        return $client->user_id === $user->id
            && $client->trashed()
            && ! $client->documents()->whereNotNull('finalised_at')->exists();
    }
}
