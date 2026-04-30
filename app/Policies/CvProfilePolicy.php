<?php

namespace App\Policies;

use App\Models\CvProfile;
use App\Models\User;

class CvProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CvProfile $cvProfile): bool
    {
        return $user->id === $cvProfile->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CvProfile $cvProfile): bool
    {
        return $user->id === $cvProfile->user_id;
    }

    public function delete(User $user, CvProfile $cvProfile): bool
    {
        return $user->id === $cvProfile->user_id;
    }
}
