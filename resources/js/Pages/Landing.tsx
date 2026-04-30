import { Head, Link } from '@inertiajs/react'
import { useTranslation } from 'react-i18next'
import { route } from 'ziggy-js'
import { track } from '@/Utils/analytics'

const PLANS = [
    {
        name: 'Free',
        price: '€0',
        period: '/ month',
        features: [
            '20 vocabulary cards/day',
            '3 AI writing checks/month',
            '2 documents/month',
            'Job board read-only',
        ],
        cta: 'Get started',
        href: '/register',
        highlight: false,
    },
    {
        name: 'Pro',
        price: '€12',
        period: '/ month',
        features: [
            'Unlimited vocabulary + SRS',
            'Unlimited AI writing checks',
            'Unlimited documents',
            'CV adapter + Bewerbung generator',
        ],
        cta: 'Start Pro',
        href: '/register',
        highlight: true,
    },
    {
        name: 'Agency',
        price: '€39',
        period: '/ month',
        features: [
            'Everything in Pro',
            '5 team seats',
            'White-label documents',
            'Priority AI processing',
        ],
        cta: 'Start Agency',
        href: '/register',
        highlight: false,
    },
]

const TESTIMONIALS = [
    {
        quote: 'The writing evaluator caught errors my German colleagues would have cringed at. My emails sound native now.',
        name: 'Arjun S.',
        role: 'Laravel Developer, relocated to Berlin',
    },
    {
        quote: "Generated my first GoBD-compliant invoice in 3 minutes. I'd been putting it off for weeks.",
        name: 'Marta K.',
        role: 'Freelance designer, Warsaw → Munich',
    },
    {
        quote: 'The Bewerbungsschreiben generator saved me hours. Got an interview within a week.',
        name: 'Chen W.',
        role: 'Full-stack developer, targeting German market',
    },
]

export default function Landing() {
    const { t, i18n } = useTranslation()

    const features = [
        {
            icon: '🇩🇪',
            title: t('features.language_coach.title'),
            desc:  t('features.language_coach.desc'),
        },
        {
            icon: '📄',
            title: t('features.documents.title'),
            desc:  t('features.documents.desc'),
        },
        {
            icon: '💼',
            title: t('features.jobs.title'),
            desc:  t('features.jobs.desc'),
        },
    ]

    const structuredData = {
        '@context': 'https://schema.org',
        '@type':    'WebSite',
        name:       'FreelancDeutsch',
        url:        route('home'),
    }

    return (
        <>
            <Head>
                <title>{t('seo.title')}</title>
                <meta name="description" content={t('seo.description')} />
                <meta property="og:title"       content={t('seo.title')} />
                <meta property="og:description" content={t('seo.description')} />
                <meta property="og:type"        content="website" />
                <meta name="twitter:card"       content="summary_large_image" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            {/* Skip link for accessibility */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-amber-400 text-zinc-900 px-4 py-2 rounded-lg font-medium"
            >
                {t('accessibility.skip_to_content')}
            </a>

            <div className="min-h-screen bg-zinc-50 text-zinc-900">

                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                        <Link href={route('home')} className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                <span className="w-1.5 h-5 rounded-sm bg-zinc-400" />
                                <span className="w-1.5 h-5 rounded-sm bg-red-600" />
                                <span className="w-1.5 h-5 rounded-sm bg-amber-400" />
                            </div>
                            <span className="font-semibold text-sm tracking-tight text-zinc-900">FreelancDeutsch</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            {/* Language toggle */}
                            <button
                                onClick={() => {
                                    const next = i18n.language === 'de' ? 'en' : 'de'
                                    i18n.changeLanguage(next)
                                    track('language_changed', { from: i18n.language, to: next })
                                }}
                                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors px-2 py-1 rounded border border-zinc-300 hover:border-zinc-400"
                                aria-label={t('accessibility.toggle_language')}
                            >
                                {i18n.language.toUpperCase()}
                            </button>

                            <Link
                                href={route('login')}
                                className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                                onClick={() => track('nav_clicked', { item: 'login' })}
                            >
                                {t('nav.login')}
                            </Link>

                            <Link
                                href={route('register')}
                                className="px-4 py-1.5 bg-amber-400 text-zinc-900 text-sm font-semibold rounded-lg hover:bg-amber-300 transition-colors"
                                onClick={() => track('nav_clicked', { item: 'register' })}
                            >
                                {t('cta.register_free')}
                            </Link>
                        </div>
                    </div>
                </nav>

                <main id="main-content">

                    {/* Hero */}
                    <section className="pt-32 pb-24 px-4 sm:px-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl" />
                        </div>

                        <div className="max-w-4xl mx-auto relative">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-full text-xs text-zinc-500 mb-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Built for international developers targeting Germany
                            </div>

                            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight text-zinc-900">
                                Break into the{' '}
                                <span className="text-amber-500">German market</span>
                            </h1>

                            <p className="text-lg text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                                A SaaS platform combining German business language coaching,
                                GoBD-compliant document generation, and AI-powered job applications —
                                built specifically for international freelancers.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={route('register')}
                                    className="px-8 py-3 bg-amber-400 text-zinc-900 font-bold rounded-xl hover:bg-amber-300 transition-colors text-sm"
                                    onClick={() => track('cta_clicked', { location: 'hero', plan: 'free' })}
                                >
                                    {t('cta.register_free')} →
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-8 py-3 border border-zinc-300 text-zinc-600 rounded-xl hover:border-zinc-400 hover:text-zinc-900 transition-colors text-sm"
                                >
                                    {t('nav.login')}
                                </Link>
                            </div>

                            <p className="text-xs text-zinc-400 mt-4">
                                Kostenlos starten · Keine Kreditkarte erforderlich · DSGVO-konform
                            </p>
                        </div>
                    </section>

                    {/* Features */}
                    <section className="py-20 px-4 sm:px-6 border-t border-zinc-200">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-14">
                                <h2 className="text-3xl font-bold text-zinc-900 mb-3">Alles was Sie brauchen</h2>
                                <p className="text-zinc-500">Three tools. One platform. Built for the German market.</p>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-6">
                                {features.map((f) => (
                                    <div
                                        key={f.title}
                                        className="bg-white border border-zinc-200 rounded-2xl p-6 hover:border-zinc-300 hover:shadow-sm transition-all"
                                    >
                                        <div className="text-3xl mb-4">{f.icon}</div>
                                        <h3 className="text-lg font-bold text-zinc-900 mb-2">{f.title}</h3>
                                        <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Compliance */}
                    <section className="py-16 px-4 sm:px-6">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white border border-zinc-200 rounded-2xl p-8 grid sm:grid-cols-2 gap-8 items-center shadow-sm">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 mb-3">Built for German compliance</h3>
                                    <p className="text-sm text-zinc-500 leading-relaxed">
                                        Every document follows GoBD requirements with sequential invoice numbers,
                                        SHA-256 hash chains, and 10-year retention logic.
                                        All data stored in EU (Hetzner Germany). DSGVO-compliant by design.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'GoBD',     desc: 'Immutable audit trail' },
                                        { label: 'DSGVO',    desc: 'EU data storage' },
                                        { label: 'eIDAS',    desc: 'Contract compliance' },
                                        { label: '§19 UStG', desc: 'Kleinunternehmer' },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-zinc-50 rounded-xl p-3 border border-zinc-200">
                                            <p className="text-xs font-mono font-bold text-amber-600">{item.label}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="py-20 px-4 sm:px-6 border-t border-zinc-200">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <h2 className="text-3xl font-bold text-zinc-900 mb-3">Preise</h2>
                                <p className="text-zinc-500">Start free. Upgrade when you need more.</p>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-5">
                                {PLANS.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`rounded-2xl p-6 border transition-all ${
                                            plan.highlight
                                                ? 'bg-amber-400 border-amber-300 text-zinc-900 shadow-md'
                                                : 'bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:shadow-sm'
                                        }`}
                                    >
                                        <div className="mb-5">
                                            <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                                {plan.name}
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold">{plan.price}</span>
                                                <span className={`text-sm ${plan.highlight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                    {plan.period}
                                                </span>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 mb-6">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2 text-sm">
                                                    <span className={plan.highlight ? 'text-zinc-700' : 'text-amber-500'}>✓</span>
                                                    <span className={plan.highlight ? 'text-zinc-800' : 'text-zinc-600'}>
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={plan.href}
                                            onClick={() => track('cta_clicked', { location: 'pricing', plan: plan.name.toLowerCase() })}
                                            className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                                                plan.highlight
                                                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                                                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                                            }`}
                                        >
                                            {plan.cta} →
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="py-20 px-4 sm:px-6 border-t border-zinc-200">
                        <div className="max-w-5xl mx-auto">
                            <h2 className="text-3xl font-bold text-zinc-900 text-center mb-14">Was andere sagen</h2>
                            <div className="grid sm:grid-cols-3 gap-5">
                                {TESTIMONIALS.map((testimonial) => (
                                    <div key={testimonial.name} className="bg-white border border-zinc-200 rounded-2xl p-6">
                                        <p className="text-sm text-zinc-600 leading-relaxed mb-5 italic">"{testimonial.quote}"</p>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900">{testimonial.name}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5">{testimonial.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Final CTA */}
                    <section className="py-24 px-4 sm:px-6 border-t border-zinc-200">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-4xl font-bold text-zinc-900 mb-4">Bereit für den deutschen Markt?</h2>
                            <p className="text-zinc-500 mb-8">Start free. No credit card required.</p>
                            <Link
                                href={route('register')}
                                onClick={() => track('cta_clicked', { location: 'bottom', plan: 'free' })}
                                className="inline-block px-10 py-4 bg-amber-400 text-zinc-900 font-bold rounded-xl hover:bg-amber-300 transition-colors"
                            >
                                {t('cta.register_free')} →
                            </Link>
                        </div>
                    </section>

                </main>

                {/* Footer */}
                <footer className="border-t border-zinc-200 bg-white py-10 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                                <span className="w-1 h-4 rounded-sm bg-zinc-400" />
                                <span className="w-1 h-4 rounded-sm bg-red-600" />
                                <span className="w-1 h-4 rounded-sm bg-amber-400" />
                            </div>
                            <span className="text-sm text-zinc-400">FreelancDeutsch</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-zinc-400">
                            <a href="/impressum" className="hover:text-zinc-600 transition-colors">
                                {t('footer.impressum')}
                            </a>
                            <a href="/datenschutz" className="hover:text-zinc-600 transition-colors">
                                {t('footer.privacy')}
                            </a>
                            <span>{t('footer.compliance')}</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    )
}
