{{-- resources/views/emails/upgrade-nudge.blade.php --}}
@component('mail::message')
    @slot('preheader')
        Ihr {{ $feature }}-Limit ist fast erreicht. Jetzt Pro freischalten & unbegrenzt nutzen.
    @endslot

    # Noch {{ $remaining }}× {{ $feature }} diesen Monat

    Sie haben Ihr kostenloses Kontingent für **{{ $feature }}** fast aufgebraucht.

    @component('mail::panel')
        **Verbleibend:** {{ $remaining }} von {{ $total ?? '—' }}
        @if (!empty($resetsAt))
            **Reset am:** {{ $resetsAt->locale('de')->isoFormat('D. MMMM YYYY') }}
        @endif
    @endcomponent

    ## Pro freischalten für nur €12/Monat

    - ✅ Unbegrenzte KI-Schreibbewertungen
    - ✅ Unbegrenzte Vokabelkarten & Dokumente
    - ✅ CV-Adapter + Bewerbungsschreiben-Generator
    - ✅ Prioritärer Support

    @component('mail::button', [
        'url' => route('billing.plans', [
            'utm_source' => 'email',
            'utm_medium' => 'limit_warning',
            'utm_campaign' => 'upgrade_nudge',
        ]),
        'color' => 'dark',
    ])
        Jetzt upgraden →
    @endcomponent

    ---

    Oder bleiben Sie kostenlos — Ihr Limit wird am ersten des nächsten Monats zurückgesetzt.

    Mit freundlichen Grüßen,
    Das JobNomade Team

    @component('mail::subcopy')
        Sie erhalten diese E-Mail, weil Sie ein kostenloses JobNomade-Konto haben.
        Diese Nachricht ist transaktional und informiert Sie über Ihren Kontostand.
    @endcomponent
@endcomponent
