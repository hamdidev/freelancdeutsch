import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface CvProfile {
    id: number;
    title: string;
    target_role: string | null;
    years_experience: string | null;
}

interface Job {
    id: number;
    title: string;
    company: string;
    tech_stack: string[];
}

interface Props {
    job: Job;
    cvProfiles: CvProfile[];
}

export default function Apply({ job, cvProfiles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        cv_profile_id: cvProfiles[0]?.id ? String(cvProfiles[0].id) : "",
        notes: "",
    });

    return (
        <AuthenticatedLayout>
            <Head title={`Apply — ${job.title}`} />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3">
                        <a href="/jobs" className="hover:text-zinc-600">
                            Jobs
                        </a>
                        <span>›</span>
                        <a
                            href={`/jobs/${job.id}`}
                            className="hover:text-zinc-600"
                        >
                            {job.title}
                        </a>
                        <span>›</span>
                        <span>Apply</span>
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Generate application
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        AI will adapt your CV and write a Bewerbungsschreiben in
                        German for <strong>{job.title}</strong> at{" "}
                        <strong>{job.company}</strong>
                    </p>
                </div>

                <div className="space-y-5">
                    {/* CV selection */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                            Select CV profile
                        </h2>
                        <div className="space-y-2">
                            {cvProfiles.map((cv) => (
                                <label
                                    key={cv.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                        data.cv_profile_id === String(cv.id)
                                            ? "border-zinc-900 bg-zinc-50"
                                            : "border-zinc-200 hover:border-zinc-300"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="cv_profile_id"
                                        value={cv.id}
                                        checked={
                                            data.cv_profile_id === String(cv.id)
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "cv_profile_id",
                                                e.target.value,
                                            )
                                        }
                                        className="mt-0.5"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {cv.title}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {cv.target_role ??
                                                "No target role set"}
                                            {cv.years_experience &&
                                                ` · ${cv.years_experience} years exp.`}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                        {errors.cv_profile_id && (
                            <p className="text-red-500 text-xs mt-2">
                                {errors.cv_profile_id}
                            </p>
                        )}
                    </div>

                    {/* What will be generated */}
                    <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-5">
                        <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                            What will be generated
                        </h2>
                        <div className="space-y-2">
                            {[
                                {
                                    icon: "📄",
                                    label: "Adapted CV",
                                    desc: "Your CV rewritten to highlight skills matching this role",
                                },
                                {
                                    icon: "✉️",
                                    label: "Bewerbungsschreiben",
                                    desc: "A formal German cover letter in DIN 5008 format",
                                },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="flex items-start gap-3"
                                >
                                    <span className="text-base">
                                        {item.icon}
                                    </span>
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            {item.label}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <label className="text-sm font-semibold text-zinc-900 block mb-2">
                            Notes (optional)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={3}
                            placeholder="Any specific points to emphasise, salary expectations, availability..."
                            className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3">
                        <a
                            href={`/jobs/${job.id}`}
                            className="px-5 py-2 text-sm text-zinc-500 hover:text-zinc-700"
                        >
                            Cancel
                        </a>
                        <button
                            onClick={() =>
                                post(route("applications.store", job.id))
                            }
                            disabled={processing || !data.cv_profile_id}
                            className="flex items-center gap-2 px-6 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                        >
                            {processing ? (
                                <>
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8z"
                                        />
                                    </svg>
                                    Generating...
                                </>
                            ) : (
                                "Generate application →"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
