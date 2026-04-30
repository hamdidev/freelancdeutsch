import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface DomainStat {
    domain: string;
    total: number;
    mastered: number;
}

interface Stats {
    total: number;
    due: number;
    mastered: number;
    new: number;
    by_domain: DomainStat[];
}

interface VocabularyCard {
    id: number;
    term_de: string;
    term_en: string;
    domain: string;
    level: string;
    repetitions: number;
    next_review_at: string | null;
}

interface Props extends PageProps {
    stats: Stats;
    dueCards: VocabularyCard[];
    userDomain: string;
}

const LEVEL_COLORS: Record<string, string> = {
    A1: 'bg-green-100 text-green-700',
    A2: 'bg-green-100 text-green-700',
    B1: 'bg-blue-100 text-blue-700',
    B2: 'bg-blue-100 text-blue-700',
    C1: 'bg-purple-100 text-purple-700',
    C2: 'bg-purple-100 text-purple-700',
};

export default function Vocabulary({ stats, dueCards, userDomain }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Vocabulary
                </h2>
            }
        >
            <Head title="Vocabulary" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">

                    {/* Stats overview */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {[
                            { label: 'Total cards', value: stats.total },
                            { label: 'Due today', value: stats.due, highlight: stats.due > 0 },
                            { label: 'Mastered', value: stats.mastered },
                            { label: 'New', value: stats.new },
                        ].map(({ label, value, highlight }) => (
                            <div
                                key={label}
                                className={`rounded-lg bg-white p-5 shadow sm:rounded-lg ${highlight ? 'ring-2 ring-indigo-500' : ''}`}
                            >
                                <p className="text-sm text-gray-500">{label}</p>
                                <p className={`mt-1 text-3xl font-semibold ${highlight ? 'text-indigo-600' : 'text-gray-900'}`}>
                                    {value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">

                        {/* Start studying */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 shadow sm:rounded-lg">
                                <h3 className="text-base font-semibold text-gray-900">Study session</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {stats.due > 0
                                        ? `You have ${stats.due} card${stats.due === 1 ? '' : 's'} due for review.`
                                        : 'All caught up! No cards due right now.'}
                                </p>
                                <div className="mt-4 space-y-2">
                                    <Link
                                        href={route('language.study', { domain: userDomain })}
                                        className="block w-full rounded-lg bg-gray-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                                    >
                                        Study {userDomain} cards
                                    </Link>
                                    <Link
                                        href={route('language.study')}
                                        className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Browse all domains
                                    </Link>
                                </div>
                            </div>

                            {/* Domain breakdown */}
                            {stats.by_domain.length > 0 && (
                                <div className="mt-6 bg-white p-6 shadow sm:rounded-lg">
                                    <h3 className="mb-3 text-base font-semibold text-gray-900">By domain</h3>
                                    <ul className="space-y-3">
                                        {stats.by_domain.map((d) => (
                                            <li key={d.domain} className="flex items-center justify-between text-sm">
                                                <span className="capitalize text-gray-700">{d.domain}</span>
                                                <span className="text-gray-500">
                                                    {d.mastered}/{d.total} mastered
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Due cards preview */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 shadow sm:rounded-lg">
                                <h3 className="mb-4 text-base font-semibold text-gray-900">
                                    Cards due for review
                                </h3>

                                {dueCards.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
                                        No cards due right now. Check back later!
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {dueCards.map((card) => (
                                            <li key={card.id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <span className="font-medium text-gray-900">{card.term_de}</span>
                                                    <span className="ml-2 text-sm text-gray-400">{card.term_en}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${LEVEL_COLORS[card.level] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {card.level}
                                                    </span>
                                                    <span className="text-xs text-gray-400 capitalize">{card.domain}</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {stats.due > dueCards.length && (
                                    <p className="mt-3 text-xs text-gray-400">
                                        + {stats.due - dueCards.length} more due
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
