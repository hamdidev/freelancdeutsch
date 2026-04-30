import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Job {
    id: number;
    title: string;
    company: string;
    location: string;
    url: string;
}

interface Application {
    id: number;
    status: string;
    cv_adapted: string | null;
    cover_letter_de: string | null;
    notes: string | null;
    applied_at: string | null;
    job: Job;
}

interface Props {
    application: Application;
}

const STATUSES = ["draft", "sent", "interview", "rejected", "offer"];

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-600",
    sent: "bg-blue-50 text-blue-700",
    interview: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-600",
    offer: "bg-green-50 text-green-700",
};

export default function ApplicationShow({ application }: Props) {
    const [tab, setTab] = useState<"cv" | "letter">("letter");
    const [copied, setCopied] = useState(false);

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateStatus = (status: string) => {
        router.patch(route("applications.status", application.id), { status });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Application — ${application.job.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
                    <a href="/applications" className="hover:text-zinc-600">
                        Applications
                    </a>
                    <span>›</span>
                    <span>{application.job.title}</span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900">
                            {application.job.title}
                        </h1>
                        <p className="text-sm text-zinc-500 mt-0.5">
                            {application.job.company} ·{" "}
                            {application.job.location}
                        </p>
                    </div>
                    <a
                        href={application.job.url}
                        target="_blank"
                        className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                        View job ↗
                    </a>
                </div>

                {/* Status pipeline */}
                <div className="bg-white rounded-xl border border-zinc-200 p-5 mb-5">
                    <p className="text-xs font-medium text-zinc-500 mb-3">
                        Application status
                    </p>
                    <div className="flex items-center gap-1">
                        {STATUSES.map((status, i) => (
                            <div
                                key={status}
                                className="flex items-center flex-1"
                            >
                                <button
                                    onClick={() => updateStatus(status)}
                                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                                        application.status === status
                                            ? STATUS_STYLES[status]
                                            : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50"
                                    }`}
                                >
                                    {status}
                                </button>
                                {i < STATUSES.length - 1 && (
                                    <svg
                                        width="12"
                                        height="12"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        className="text-zinc-200 flex-shrink-0 mx-1"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-zinc-100 rounded-lg p-1 w-fit">
                    {[
                        { key: "letter", label: "✉️ Bewerbungsschreiben" },
                        { key: "cv", label: "📄 Adapted CV" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setTab(key as "cv" | "letter")}
                            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                                tab === key
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
                        <p className="text-xs text-zinc-400">
                            {tab === "letter"
                                ? "Formal German cover letter · DIN 5008"
                                : "CV adapted for this role"}
                        </p>
                        <button
                            onClick={() =>
                                copy(
                                    tab === "letter"
                                        ? (application.cover_letter_de ?? "")
                                        : (application.cv_adapted ?? ""),
                                )
                            }
                            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                        >
                            {copied ? (
                                "✓ Copied"
                            ) : (
                                <>
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
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                    Copy
                                </>
                            )}
                        </button>
                    </div>
                    <div className="p-6">
                        <pre className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed font-sans">
                            {tab === "letter"
                                ? (application.cover_letter_de ??
                                  "No cover letter generated.")
                                : (application.cv_adapted ??
                                  "No adapted CV generated.")}
                        </pre>
                    </div>
                </div>

                {/* Notes */}
                {application.notes && (
                    <div className="mt-4 bg-white rounded-xl border border-zinc-200 p-5">
                        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                            Notes
                        </p>
                        <p className="text-sm text-zinc-600">
                            {application.notes}
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
