@component('mail::message')
    @if ($user)
        # Willkommen, {{ $user->name }} 👋
    @else
        # Willkommen bei FreelancDeutsch 👋
    @endif

    Schön, dass Sie dabei sind. FreelancDeutsch hilft Ihnen, den deutschen Markt
    als internationaler Freelancer zu erschließen.

    **Was Sie jetzt tun können:**

    @component('mail::panel')
        🇩🇪 **Sprachcoach** — Starten Sie mit Vokabelkarten für Ihre Branche

        📄 **Dokumente** — Erstellen Sie Ihre erste GoBD-konforme Rechnung

        💼 **Jobs** — Entdecken Sie Remote-Stellen bei deutschen Unternehmen
    @endcomponent

    @component('mail::button', ['url' => $dashboardUrl, 'color' => 'dark'])
        Zum Dashboard →
    @endcomponent

    ---

    **Ihr kostenloser Plan beinhaltet:**

    - 20 Vokabelkarten pro Tag
    - 3 KI-Schreibprüfungen pro Monat
    - 2 Dokumente pro Monat
    - Stellenmarkt (nur lesen)

    Für unbegrenzte Nutzung können Sie jederzeit auf **Pro für €12/Monat** upgraden.

    @component('mail::button', ['url' => $billingUrl, 'color' => 'white'])
        Pläne vergleichen
    @endcomponent

    Mit freundlichen Grüßen,
    Das FreelancDeutsch Team

    @component('mail::subcopy')
        Sie erhalten diese E-Mail, weil Sie sich bei FreelancDeutsch registriert haben.
        Diese E-Mail ist transaktional und kann nicht abgemeldet werden.
    @endcomponent
@endcomponent
