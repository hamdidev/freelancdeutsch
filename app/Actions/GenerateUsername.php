<?php

namespace App\Actions;

use App\Models\User;
use Illuminate\Support\Str;

class GenerateUsername
{
    public function __invoke(string $name): string
    {
        $base     = Str::slug(Str::lower($name), '');
        $username = $base;
        $counter  = 1;

        while (User::where('username', $username)->exists()) {
            $username = $base . $counter;
            $counter++;
        }

        return $username;
    }
}
