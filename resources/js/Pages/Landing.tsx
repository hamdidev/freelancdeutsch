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
        avatar: 'AS',
    },
    {
        quote: "Generated my first GoBD-compliant invoice in 3 minutes. I'd been putting it off for weeks.",
        name: 'Marta K.',
        role: 'Freelance designer, Warsaw → Munich',
        avatar: 'MK',
    },
    {
        quote: 'The Bewerbungsschreiben generator saved me hours. Got an interview within a week.',
        name: 'Chen W.',
        role: 'Full-stack developer, targeting German market',
        avatar: 'CW',
    },
]

const COMPLIANCE_BADGES = [
    { label: 'GoBD', desc: 'Immutable audit trail' },
    { label: 'DSGVO', desc: 'EU data storage' },
    { label: 'eIDAS', desc: 'Contract compliance' },
    { label: '§19 UStG', desc: 'Kleinunternehmer' },
]

function GermanFlagIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="20" height="7" fill="#1a1a1a" />
            <rect y="7" width="20" height="6" fill="#D00" />
            <rect y="13" width="20" height="7" fill="#FFCE00" />
        </svg>
    )
}

function DocumentIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    )
}

function BriefcaseIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

function CheckIcon({ className = '' }: { className?: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    )
}

function ArrowRightIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    )
}

export default function Landing() {
    const { t, i18n } = useTranslation()

    const features = [
        {
            icon: <GermanFlagIcon />,
            title: t('features.language_coach.title'),
            desc: t('features.language_coach.desc'),
            tag: 'Language',
            span: 'md:col-span-2',
            accent: 'from-amber-500/20 to-yellow-500/5',
        },
        {
            icon: <DocumentIcon />,
            title: t('features.documents.title'),
            desc: t('features.documents.desc'),
            tag: 'Documents',
            span: 'md:col-span-1',
            accent: 'from-blue-500/20 to-indigo-500/5',
        },
        {
            icon: <BriefcaseIcon />,
            title: t('features.jobs.title'),
            desc: t('features.jobs.desc'),
            tag: 'Jobs',
            span: 'md:col-span-1',
            accent: 'from-emerald-500/20 to-teal-500/5',
        },
    ]

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'FreelancDeutsch',
        url: route('home'),
    }

    return (
        <>
            <Head>
                <title>{t('seo.title')}</title>
                <meta name="description" content={t('seo.description')} />
                <meta property="og:title" content={t('seo.title')} />
                <meta property="og:description" content={t('seo.description')} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-amber-400 text-zinc-900 px-4 py-2 rounded-lg font-medium"
            >
                {t('accessibility.skip_to_content')}
            </a>

            <div className="min-h-screen bg-[#080c18] text-white">

                {/* Ambient background glows */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
                    <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-amber-500/[0.06] rounded-full blur-[120px]" />
                    <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-blue-600/[0.05] rounded-full blur-[120px]" />
                    <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] bg-emerald-500/[0.04] rounded-full blur-[100px]" />
                </div>

                {/* Nav */}
                <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#080c18]/80 backdrop-blur-xl">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                        <Link href={route('home')} className="flex items-center gap-2.5 group">
                            <div className="flex gap-[3px] items-end">
                                <span className="w-[5px] h-5 rounded-sm bg-zinc-600 group-hover:bg-zinc-500 transition-colors" />
                                <span className="w-[5px] h-6 rounded-sm bg-red-600" />
                                <span className="w-[5px] h-5 rounded-sm bg-amber-400 group-hover:bg-amber-300 transition-colors" />
                            </div>
                            <span className="font-bold text-sm tracking-tight text-white">FreelancDeutsch</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    const next = i18n.language === 'de' ? 'en' : 'de'
                                    i18n.changeLanguage(next)
                                    track('language_changed', { from: i18n.language, to: next })
                                }}
                                className="text-xs text-zinc-400 hover:text-white transition-colors px-2.5 py-1.5 rounded-md border border-white/10 hover:border-white/20 bg-white/[0.04] hover:bg-white/[0.08]"
                                aria-label={t('accessibility.toggle_language')}
                            >
                                {i18n.language.toUpperCase()}
                            </button>

                            <Link
                                href={route('login')}
                                className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-1.5"
                                onClick={() => track('nav_clicked', { item: 'login' })}
                            >
                                {t('nav.login')}
                            </Link>

                            <Link
                                href={route('register')}
                                className="px-4 py-2 bg-amber-400 text-zinc-900 text-sm font-bold rounded-lg hover:bg-amber-300 transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                                onClick={() => track('nav_clicked', { item: 'register' })}
                            >
                                {t('cta.register_free')}
                            </Link>
                        </div>
                    </div>
                </nav>

                <main id="main-content">

                    {/* Hero */}
                    <section className="relative pt-40 pb-32 px-4 sm:px-6 text-center overflow-hidden">
                        <div className="max-w-4xl mx-auto relative z-10">

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/[0.08] text-xs text-amber-400 mb-8 backdrop-blur-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                Built for international developers targeting Germany
                            </div>

                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight">
                                Break into the{' '}
                                <span className="relative">
                                    <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                                        German market
                                    </span>
                                    <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" aria-hidden="true" />
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                                A SaaS platform combining German business language coaching,
                                GoBD-compliant document generation, and AI-powered job applications —
                                built specifically for international freelancers.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-400 text-zinc-900 font-bold rounded-xl hover:bg-amber-300 transition-all text-sm shadow-[0_0_30px_rgba(251,191,36,0.35)] hover:shadow-[0_0_40px_rgba(251,191,36,0.55)]"
                                    onClick={() => track('cta_clicked', { location: 'hero', plan: 'free' })}
                                >
                                    {t('cta.register_free')}
                                    <ArrowRightIcon />
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/10 text-zinc-300 rounded-xl hover:border-white/25 hover:text-white transition-all text-sm bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-sm"
                                >
                                    {t('nav.login')}
                                </Link>
                            </div>

                            <p className="text-xs text-zinc-600 mt-5">
                                Kostenlos starten · Keine Kreditkarte erforderlich · DSGVO-konform
                            </p>
                        </div>

                        {/* Hero bottom fade */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080c18] to-transparent pointer-events-none" aria-hidden="true" />
                    </section>

                    {/* Stats bar */}
                    <section className="py-8 px-4 sm:px-6 border-y border-white/[0.06]">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: '3 min', label: 'First GoBD invoice' },
                                    { value: 'B2 → C1', label: 'German level-up' },
                                    { value: '10×', label: 'Faster job applications' },
                                ].map((stat) => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-2xl sm:text-3xl font-extrabold text-amber-400">{stat.value}</p>
                                        <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Features — Bento Grid */}
                    <section className="py-24 px-4 sm:px-6">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-14">
                                <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Platform</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Alles was Sie brauchen</h2>
                                <p className="text-zinc-400">Three tools. One platform. Built for the German market.</p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {features.map((f) => (
                                    <div
                                        key={f.title}
                                        className={`relative group rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 overflow-hidden hover:border-white/[0.15] transition-all duration-300 hover:bg-white/[0.05] ${f.span}`}
                                    >
                                        {/* Card glow */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} aria-hidden="true" />

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/[0.1] flex items-center justify-center text-zinc-300">
                                                    {f.icon}
                                                </div>
                                                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 border border-white/[0.08] px-2 py-1 rounded-full">
                                                    {f.tag}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}

                                {/* Compliance bento card */}
                                <div className="relative group md:col-span-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 overflow-hidden hover:border-amber-500/20 transition-all duration-300">
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
                                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                        <div className="flex-1">
                                            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-2">Compliance</p>
                                            <h3 className="text-xl font-bold text-white mb-2">Built for German compliance</h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                                                Every document follows GoBD requirements with sequential invoice numbers,
                                                SHA-256 hash chains, and 10-year retention logic. All data stored in EU (Hetzner Germany).
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-3 shrink-0">
                                            {COMPLIANCE_BADGES.map((item) => (
                                                <div key={item.label} className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-center min-w-[80px]">
                                                    <p className="text-xs font-mono font-bold text-amber-400">{item.label}</p>
                                                    <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Pricing</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Preise</h2>
                                <p className="text-zinc-400">Start free. Upgrade when you need more.</p>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-5">
                                {PLANS.map((plan) => (
                                    <div
                                        key={plan.name}
                                        className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                                            plan.highlight
                                                ? 'bg-gradient-to-b from-amber-400/[0.12] to-amber-400/[0.04] border-amber-400/40 shadow-[0_0_40px_rgba(251,191,36,0.12)]'
                                                : 'bg-white/[0.03] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        {plan.highlight && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(251,191,36,0.4)]">
                                                Most Popular
                                            </div>
                                        )}
                                        <div className="mb-5">
                                            <p className={`text-sm font-semibold mb-1 ${plan.highlight ? 'text-amber-400' : 'text-zinc-500'}`}>
                                                {plan.name}
                                            </p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                                <span className="text-sm text-zinc-500">{plan.period}</span>
                                            </div>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start gap-2.5 text-sm">
                                                    <span className={`mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-amber-400' : 'text-zinc-500'}`}>
                                                        <CheckIcon />
                                                    </span>
                                                    <span className="text-zinc-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={plan.href}
                                            onClick={() => track('cta_clicked', { location: 'pricing', plan: plan.name.toLowerCase() })}
                                            className={`block w-full text-center py-2.5 rounded-xl text-sm font-bold transition-all ${
                                                plan.highlight
                                                    ? 'bg-amber-400 text-zinc-900 hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]'
                                                    : 'bg-white/[0.06] text-white hover:bg-white/[0.1] border border-white/[0.08]'
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
                    <section className="py-24 px-4 sm:px-6 border-t border-white/[0.06]">
                        <div className="max-w-5xl mx-auto">
                            <div className="text-center mb-14">
                                <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-3">Social proof</p>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Was andere sagen</h2>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-5">
                                {TESTIMONIALS.map((testimonial) => (
                                    <div
                                        key={testimonial.name}
                                        className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300"
                                    >
                                        {/* Quote mark */}
                                        <div className="text-4xl font-serif text-amber-400/30 leading-none mb-3 select-none" aria-hidden="true">"</div>
                                        <p className="text-sm text-zinc-300 leading-relaxed mb-5">
                                            {testimonial.quote}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/30 to-amber-600/20 border border-amber-400/20 flex items-center justify-center text-[10px] font-bold text-amber-300">
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                                                <p className="text-[11px] text-zinc-500 mt-0.5">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Final CTA */}
                    <section className="py-28 px-4 sm:px-6 border-t border-white/[0.06]">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="relative inline-block mb-8">
                                <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full" aria-hidden="true" />
                                <h2 className="relative text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                                    Bereit für den{' '}
                                    <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                                        deutschen Markt?
                                    </span>
                                </h2>
                            </div>
                            <p className="text-zinc-400 mb-8 text-lg">Start free. No credit card required.</p>
                            <Link
                                href={route('register')}
                                onClick={() => track('cta_clicked', { location: 'bottom', plan: 'free' })}
                                className="inline-flex items-center gap-2 px-10 py-4 bg-amber-400 text-zinc-900 font-extrabold rounded-xl hover:bg-amber-300 transition-all text-base shadow-[0_0_40px_rgba(251,191,36,0.4)] hover:shadow-[0_0_60px_rgba(251,191,36,0.6)]"
                            >
                                {t('cta.register_free')}
                                <ArrowRightIcon />
                            </Link>
                        </div>
                    </section>

                </main>

                {/* Footer */}
                <footer className="border-t border-white/[0.06] py-10 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex gap-[3px] items-end">
                                <span className="w-[4px] h-4 rounded-sm bg-zinc-700" />
                                <span className="w-[4px] h-5 rounded-sm bg-red-700" />
                                <span className="w-[4px] h-4 rounded-sm bg-amber-500" />
                            </div>
                            <span className="text-sm text-zinc-600">FreelancDeutsch</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-zinc-600">
                            <a href="/impressum" className="hover:text-zinc-300 transition-colors">
                                {t('footer.impressum')}
                            </a>
                            <a href="/datenschutz" className="hover:text-zinc-300 transition-colors">
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
