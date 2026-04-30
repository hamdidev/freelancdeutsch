<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#09090b">
    <link rel="manifest" href="/manifest.json">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <!-- SEO -->
    <title inertia>{{ config('app.name') }}</title>
    <meta name="description"
        content="FreelancDeutsch — German business language coach, GoBD-compliant document generator, and job market intelligence for international freelancers.">
    <meta name="keywords"
        content="German freelancer, Rechnung erstellen, GoBD, DSGVO, German business German, international developer Germany">
    <link rel="canonical" href="{{ url()->current() }}">

    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="FreelancDeutsch">
    <meta property="og:title" content="FreelancDeutsch — Break into the German market">
    <meta property="og:description"
        content="German business language coach, GoBD-compliant invoicing, and remote job board for international freelancers.">
    <meta property="og:url" content="{{ url()->current() }}">

    <!-- DSGVO: no external tracking -->
    <meta name="robots" content="index, follow">

    @viteReactRefresh
    @routes
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>
