@component('mail::message')
    # Ihre Woche, {{ $user->name }} 📊

    @component('mail::table')
        | Bereich | Diese Woche |
        |:--------|------------:|
        | Vokabelkarten gelernt | {{ $stats['cards_reviewed'] }} |
        | Schreibübungen | {{ $stats['writing_sessions'] }} |
        | Durchschnittlicher Score | {{ $stats['avg_score'] ?? '—' }}/100 |
        | Dokumente erstellt | {{ $stats['documents_created'] }} |
        | Bewerbungen | {{ $stats['applications'] }} |
    @endcomponent

    @if ($stats['cards_due'] > 0)
        @component('mail::panel')
            📚 Sie haben **{{ $stats['cards_due'] }}** Karten, die heute zur Wiederholung fällig sind.
        @endcomponent
    @endif

    @component('mail::button', ['url' => config('app.url') . '/language/study', 'color' => 'dark'])
        Weiterlernen →
    @endcomponent

    Mit freundlichen Grüßen,
    Das JobNomade Team
@endcomponent
