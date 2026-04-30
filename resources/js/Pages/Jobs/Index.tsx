import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Job {
    id: number;
    title: string;
    company: string;
    company_logo: string | null;
    location: string;
    remote_ok: boolean;
    type: string;
    tech_stack: string[];
    salary_range: string | null;
    language: string;
    posted_at: string;
}

interface Paginator {
    data: Job[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    jobs: Paginator;
    appliedIds: number[];
    filters: { search?: string; tech?: string; remote?: string };
}

const TYPE_BADGE: Record<string, string> = {
    full_time: "bg-blue-50 text-blue-700",
    part_time: "bg-purple-50 text-purple-700",
    contract: "bg-amber-50 text-amber-700",
    freelance: "bg-green-50 text-green-700",
};

const TYPE_LABEL: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    freelance: "Freelance",
};

function timeAgo(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function JobsIndex({ jobs, appliedIds, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? "");

    const doSearch = () => {
        router.get(
            "/jobs",
            { search: search || undefined },
            { preserveState: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job listings" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Job listings
                    </h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Remote German tech positions · {jobs.total} total
                    </p>
                </div>

                {/* Search + filters */}
                <div className="flex gap-3 mb-6">
                    <div className="flex-1 flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 overflow-hidden focus-within:ring-2 focus-within:ring-zinc-900">
                        <svg
                            width="14"
                            height="14"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                            className="text-zinc-400 flex-shrink-0"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && doSearch()}
                            placeholder="Search title, company, skills..."
                            className="flex-1 py-2.5 text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={doSearch}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Search
                    </button>
                    <Link
                        href="/jobs?remote=1"
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            filters.remote
                                ? "bg-zinc-900 text-white border-zinc-900"
                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                        }`}
                    >
                        Remote only
                    </Link>
                </div>

                {/* Sync button */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={() => router.post("/jobs/sync")}
                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        <svg
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Sync jobs
                    </button>
                </div>

                {/* Job list */}
                {jobs.data.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
                        <div className="text-4xl mb-3">🔍</div>
                        <p className="text-sm text-zinc-500">
                            No jobs found. Try syncing or adjusting your search.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {jobs.data.map((job) => (
                            <Link
                                key={job.id}
                                href={`/jobs/${job.id}`}
                                className="block bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        {/* Logo */}
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-zinc-400">
                                            {job.company_logo ? (
                                                <img
                                                    src={job.company_logo}
                                                    alt=""
                                                    className="w-full h-full object-contain rounded-lg"
                                                />
                                            ) : (
                                                job.company.charAt(0)
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors">
                                                    {job.title}
                                                </h3>
                                                {appliedIds.includes(
                                                    job.id,
                                                ) && (
                                                    <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                                                        Applied
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-zinc-500 mb-2">
                                                {job.company}
                                            </p>

                                            <div className="flex items-center flex-wrap gap-2">
                                                <span className="text-xs text-zinc-400 flex items-center gap-1">
                                                    <svg
                                                        width="11"
                                                        height="11"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={2}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>
                                                    {job.location}
                                                </span>

                                                {job.remote_ok && (
                                                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                                                        Remote
                                                    </span>
                                                )}

                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE[job.type]}`}
                                                >
                                                    {TYPE_LABEL[job.type]}
                                                </span>

                                                {job.language === "de" && (
                                                    <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                                                        🇩🇪 Deutsch
                                                    </span>
                                                )}

                                                {job.tech_stack
                                                    ?.slice(0, 4)
                                                    .map((tech) => (
                                                        <span
                                                            key={tech}
                                                            className="text-xs bg-zinc-50 text-zinc-500 px-2 py-0.5 rounded border border-zinc-100"
                                                        >
                                                            {tech}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        {job.salary_range && (
                                            <p className="text-xs font-semibold text-zinc-900 mb-1">
                                                {job.salary_range}
                                            </p>
                                        )}
                                        <p className="text-xs text-zinc-300">
                                            {timeAgo(job.posted_at)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {jobs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {jobs.links.map(
                            (link, i) =>
                                link.url && (
                                    <button
                                        key={i}
                                        onClick={() => router.visit(link.url!)}
                                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                                            link.active
                                                ? "bg-zinc-900 text-white"
                                                : "text-zinc-500 hover:bg-zinc-100"
                                        }`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
