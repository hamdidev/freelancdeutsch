<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentPolicy
{
    use HandlesAuthorization;

    /**
     * Superadmin bypass — GoBD finalisation state checked per-method.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('superadmin')) {
            // Finalised check cannot be done here — no $document available
            // Each method below handles the GoBD guard individually
            return true;
        }

        return null;
    }

    public function view(User $user, Document $document): bool
    {
        return $user->id === $document->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            && $document->isEditable();
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            && ! $document->isFinalised();
    }

    public function restore(User $user, Document $document): bool
    {
        return $user->id === $document->user_id
            && ! $document->isFinalised()
            && $document->trashed();
    }

    public function forceDelete(User $user, Document $document): bool
    {
        // GoBD: permanent deletion of finalised documents is never allowed
        // even for superadmin — override the before() bypass explicitly
        if ($document->isFinalised()) {
            return false;
        }

        return $user->id === $document->user_id
            && $document->trashed();
    }
}
