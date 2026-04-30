import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Job {
    id: number;
    title: string;
    company: string;
    company_logo: string | null;
    location: string;
    remote_ok: boolean;
    type: string;
    description: string;
    tech_stack: string[];
    salary_range: string | null;
    url: string;
    language: string;
    posted_at: string;
}

interface Application {
    id: number;
    status: string;
}

interface Props {
    job: Job;
    application: Application | null;
    hasCv: boolean;
}

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-500",
    sent: "bg-blue-50 text-blue-700",
    interview: "bg-amber-50 text-amber-700",
    rejected: "bg-red-50 text-red-500",
    offer: "bg-green-50 text-green-700",
};

export default function JobShow({ job, application, hasCv }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={job.title} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
                    <Link
                        href="/jobs"
                        className="hover:text-zinc-600 transition-colors"
                    >
                        Jobs
                    </Link>
                    <span>›</span>
                    <span className="truncate">{job.title}</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Header */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center text-lg font-bold text-zinc-400 flex-shrink-0">
                                    {job.company_logo ? (
                                        <img
                                            src={job.company_logo}
                                            alt=""
                                            className="w-full h-full object-contain rounded-xl"
                                        />
                                    ) : (
                                        job.company.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-zinc-900">
                                        {job.title}
                                    </h1>
                                    <p className="text-zinc-500 mt-0.5">
                                        {job.company}
                                    </p>
                                    <div className="flex items-center flex-wrap gap-2 mt-3">
                                        <span className="text-xs text-zinc-400">
                                            📍 {job.location}
                                        </span>
                                        {job.remote_ok && (
                                            <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                                                Remote
                                            </span>
                                        )}
                                        {job.salary_range && (
                                            <span className="text-xs font-semibold text-zinc-900">
                                                {job.salary_range}
                                            </span>
                                        )}
                                        {job.language === "de" && (
                                            <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                                                🇩🇪 Auf Deutsch
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-6">
                            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
                                Job description
                            </h2>
                            <div className="text-sm text-zinc-600 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        {/* Tech stack */}
                        {job.tech_stack?.length > 0 && (
                            <div className="bg-white rounded-xl border border-zinc-200 p-6">
                                <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                                    Tech stack
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.tech_stack.map((tech) => (
                                        <span
                                            key={tech}
                                            className="text-xs px-3 py-1.5 bg-zinc-50 text-zinc-600 rounded-lg border border-zinc-100 font-mono"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Apply CTA */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            {application ? (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-sm font-semibold text-zinc-900">
                                            Applied
                                        </span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${STATUS_STYLES[application.status]}`}
                                        >
                                            {application.status}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/applications/${application.id}`}
                                        className="block w-full text-center px-4 py-2.5 text-sm font-medium border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition-colors"
                                    >
                                        View application →
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                                        Apply with AI
                                    </h3>
                                    <p className="text-xs text-zinc-400 mb-4">
                                        Generate a tailored CV and
                                        Bewerbungsschreiben in German
                                        automatically.
                                    </p>
                                    {hasCv ? (
                                        <Link
                                            href={`/applications/jobs/${job.id}/apply`}
                                            className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                                        >
                                            Generate application →
                                        </Link>
                                    ) : (
                                        <div>
                                            <Link
                                                href="/cv-profiles"
                                                className="block w-full text-center px-4 py-2.5 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors mb-2"
                                            >
                                                Add your CV first →
                                            </Link>
                                            <p className="text-xs text-zinc-400 text-center">
                                                You need a CV profile to
                                                generate applications
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* External link */}
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium border border-zinc-200 text-zinc-600 rounded-xl hover:bg-zinc-50 transition-colors"
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
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                            </svg>
                            View original posting
                        </a>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
