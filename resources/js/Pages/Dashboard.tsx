import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface User {
    name: string;
    plan: string;
    german_level: string | null;
    freelance_domain: string | null;
    onboarding_complete: boolean;
}

interface Usage {
    ai_writing: { remaining: number | string; can: boolean };
    documents: { remaining: number | string; can: boolean };
    vocab_cards: { remaining: number | string; can: boolean };
}

interface Stats {
    total: number;
    due: number;
    mastered: number;
    new: number;
}

interface Props {
    user: User;
    usage: Usage;
    srsStats: Stats;
    recentSessions: Array<{
        id: number;
        score: number | null;
        domain: string;
        created_at: string;
    }>;
}

const DOMAIN_LABEL: Record<string, string> = {
    it: "IT / Software",
    legal: "Legal",
    finance: "Finance",
    marketing: "Marketing",
    design: "Design",
    other: "Other",
};

function StatCard({
    label,
    value,
    sub,
    accent = false,
}: {
    label: string;
    value: string | number;
    sub?: string;
    accent?: boolean;
}) {
    return (
        <div
            className={`rounded-xl p-5 border ${accent ? "bg-amber-400 border-amber-300" : "bg-white border-zinc-200"}`}
        >
            <p
                className={`text-xs font-medium uppercase tracking-wide ${accent ? "text-amber-800" : "text-zinc-400"}`}
            >
                {label}
            </p>
            <p
                className={`text-3xl font-bold mt-1 ${accent ? "text-zinc-900" : "text-zinc-900"}`}
            >
                {value}
            </p>
            {sub && (
                <p
                    className={`text-xs mt-1 ${accent ? "text-amber-800" : "text-zinc-400"}`}
                >
                    {sub}
                </p>
            )}
        </div>
    );
}

function QuickAction({
    href,
    label,
    description,
    icon,
}: {
    href: string;
    label: string;
    description: string;
    icon: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            className="group flex items-start gap-4 p-5 bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all"
        >
            <div className="w-10 h-10 rounded-lg bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
            </div>
            <svg
                className="ml-auto w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                />
            </svg>
        </Link>
    );
}

export default function Dashboard({
    user,
    usage,
    srsStats,
    recentSessions,
}: Props) {
    const firstName = user.name.split(" ")[0];
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
                            {greeting}
                        </p>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            {firstName} 👋
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            {user.german_level && `Level ${user.german_level}`}
                            {user.german_level &&
                                user.freelance_domain &&
                                " · "}
                            {user.freelance_domain &&
                                DOMAIN_LABEL[user.freelance_domain]}
                        </p>
                    </div>
                    {user.plan === "free" && (
                        <Link
                            href="/billing"
                            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            <svg
                                width="13"
                                height="13"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                                />
                            </svg>
                            Upgrade to Pro
                        </Link>
                    )}
                </div>

                {/* SRS Stats */}
                {srsStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatCard
                            label="Due today"
                            value={srsStats.due}
                            accent={srsStats.due > 0}
                        />
                        <StatCard label="New cards" value={srsStats.new} />
                        <StatCard
                            label="Mastered"
                            value={srsStats.mastered}
                            sub="5+ reviews"
                        />
                        <StatCard label="Total cards" value={srsStats.total} />
                    </div>
                )}

                {/* Usage limits */}
                {usage && (
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Monthly usage
                            </h2>
                            <span className="text-xs text-zinc-400 capitalize">
                                {user.plan} plan
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { key: "ai_writing", label: "AI evaluations" },
                                { key: "vocab_cards", label: "Vocab reviews" },
                                { key: "documents", label: "Documents" },
                            ].map(({ key, label }) => {
                                const item = usage[key as keyof Usage];
                                if (!item) return null;
                                const isUnlimited =
                                    item.remaining === "unlimited";
                                return (
                                    <div key={key}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-zinc-500">
                                                {label}
                                            </span>
                                            <span
                                                className={`text-xs font-mono font-medium ${
                                                    isUnlimited
                                                        ? "text-amber-600"
                                                        : item.remaining === 0
                                                          ? "text-red-500"
                                                          : "text-zinc-700"
                                                }`}
                                            >
                                                {isUnlimited
                                                    ? "∞"
                                                    : item.remaining}
                                            </span>
                                        </div>
                                        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    isUnlimited
                                                        ? "w-full bg-amber-400"
                                                        : item.remaining === 0
                                                          ? "w-full bg-red-300"
                                                          : "bg-zinc-900"
                                                }`}
                                                style={
                                                    !isUnlimited &&
                                                    item.remaining !== 0
                                                        ? {
                                                              width: `${(Number(item.remaining) / 3) * 100}%`,
                                                          }
                                                        : undefined
                                                }
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick actions */}
                <div>
                    <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                        Quick actions
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <QuickAction
                            href="/language/study"
                            label="Study flashcards"
                            description={
                                srsStats?.due > 0
                                    ? `${srsStats.due} cards due now`
                                    : "No cards due"
                            }
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                </svg>
                            }
                        />
                        <QuickAction
                            href="/language/writing"
                            label="Writing practice"
                            description="Get AI feedback on your German"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            }
                        />
                        <QuickAction
                            href="/documents"
                            label="New document"
                            description="GoBD-compliant invoice or contract"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            }
                        />
                        <QuickAction
                            href="/jobs"
                            label="Browse jobs"
                            description="Remote German tech positions"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            }
                        />
                        <QuickAction
                            href="/language"
                            label="Vocabulary stats"
                            description="Track your progress by domain"
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                    />
                                </svg>
                            }
                        />
                        <QuickAction
                            href="/billing"
                            label={
                                user.plan === "free"
                                    ? "Upgrade plan"
                                    : "Manage billing"
                            }
                            description={
                                user.plan === "free"
                                    ? "Unlock unlimited features"
                                    : "Invoices and subscription"
                            }
                            icon={
                                <svg
                                    width="16"
                                    height="16"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {/* Recent writing sessions */}
                {recentSessions?.length > 0 && (
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Recent writing sessions
                            </h2>
                            <Link
                                href="/language/writing"
                                className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                New session →
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {recentSessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0"
                                >
                                    <span className="text-sm text-zinc-600 capitalize">
                                        {session.domain}
                                    </span>
                                    <div className="flex items-center gap-4">
                                        {session.score !== null && (
                                            <span
                                                className={`text-xs font-mono font-semibold ${
                                                    session.score >= 80
                                                        ? "text-green-600"
                                                        : session.score >= 60
                                                          ? "text-blue-600"
                                                          : session.score >= 40
                                                            ? "text-amber-600"
                                                            : "text-red-500"
                                                }`}
                                            >
                                                {session.score}/100
                                            </span>
                                        )}
                                        <span className="text-xs text-zinc-300">
                                            {new Date(
                                                session.created_at,
                                            ).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
