import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Job {
    id: number;
    title: string;
    company: string;
}

interface Application {
    id: number;
    status: string;
    applied_at: string | null;
    created_at: string;
    job: Job;
}

interface Paginator {
    data: Application[];
    total: number;
    current_page: number;
    last_page: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    applications: Paginator;
}

const STATUS_STYLES: Record<string, string> = {
    draft:     "bg-zinc-100 text-zinc-500",
    sent:      "bg-blue-50 text-blue-600",
    interview: "bg-amber-50 text-amber-600",
    rejected:  "bg-red-50 text-red-500",
    offer:     "bg-green-50 text-green-600",
};

const STATUS_LABELS: Record<string, string> = {
    draft:     "Draft",
    sent:      "Sent",
    interview: "Interview",
    rejected:  "Rejected",
    offer:     "Offer",
};

function timeAgo(date: string): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function Applications({ applications }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="My Applications" />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">My Applications</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            {applications.total} application{applications.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Link
                        href={route("jobs.index")}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        Browse jobs
                    </Link>
                </div>

                {applications.data.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
                        <div className="text-4xl mb-3">📬</div>
                        <p className="text-sm text-zinc-500">
                            No applications yet.{" "}
                            <Link href={route("jobs.index")} className="underline">
                                Browse jobs
                            </Link>{" "}
                            to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {applications.data.map((app) => (
                            <Link
                                key={app.id}
                                href={route("applications.show", app.id)}
                                className="block bg-white rounded-xl border border-zinc-200 p-5 hover:border-zinc-300 hover:shadow-sm transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-700 transition-colors truncate mb-0.5">
                                            {app.job.title}
                                        </h3>
                                        <p className="text-sm text-zinc-400">{app.job.company}</p>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[app.status] ?? STATUS_STYLES.draft}`}
                                        >
                                            {STATUS_LABELS[app.status] ?? app.status}
                                        </span>
                                        <span className="text-xs text-zinc-300">
                                            {timeAgo(app.applied_at ?? app.created_at)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {applications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 mt-6">
                        {applications.links.map(
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
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
