<?php

namespace App\Http\Controllers\Language;

use App\Http\Controllers\Controller;
use App\Models\VocabularyCard;
use App\Services\SpacedRepetition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct(private SpacedRepetition $srs) {}

    public function store(Request $request, VocabularyCard $card): RedirectResponse
    {
        abort_if($card->user_id !== auth()->id(), 403);

        $request->validate([
            'quality' => ['required', 'integer', 'min:0', 'max:3'],
        ]);

        $this->srs->review($card, $request->quality);

        return back();
    }
}
