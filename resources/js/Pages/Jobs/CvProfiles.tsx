import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

interface CvProfile {
    id: number;
    title: string;
    target_role: string | null;
    years_experience: string | null;
    ai_processing_consent_at: string | null;
    created_at: string;
}

interface Props {
    profiles: CvProfile[];
}

const EMPTY = {
    title: "",
    raw_cv: "",
    target_role: "",
    years_experience: "",
    ai_consent: false,
};

export default function CvProfiles({ profiles }: Props) {
    const [form, setForm] = useState(EMPTY);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!form.ai_consent) {
            setErrors({
                ai_consent:
                    "You must consent to AI processing to use this feature.",
            });
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            await axios.post(route("cv.store"), form);
            setOpen(false);
            setForm(EMPTY);
            router.reload({ only: ["profiles"] });
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    const destroy = async (id: number) => {
        if (!confirm("Delete this CV profile?")) return;
        await axios.delete(route("cv.destroy", id));
        router.reload({ only: ["profiles"] });
    };

    return (
        <AuthenticatedLayout>
            <Head title="CV Profiles" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            CV Profiles
                        </h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            Your CV is used to generate tailored applications
                            and Bewerbungsschreiben
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setForm(EMPTY);
                            setErrors({});
                            setOpen(true);
                        }}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        + Add CV
                    </button>
                </div>

                {profiles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
                        <div className="text-4xl mb-3">📄</div>
                        <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                            No CV profiles yet
                        </h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Add your CV to generate AI-powered applications for
                            German jobs
                        </p>
                        <button
                            onClick={() => setOpen(true)}
                            className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            + Add CV
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {profiles.map((profile) => (
                            <div
                                key={profile.id}
                                className="bg-white rounded-xl border border-zinc-200 p-5 flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">
                                        {profile.title}
                                    </p>
                                    <p className="text-xs text-zinc-400 mt-0.5">
                                        {profile.target_role ??
                                            "No target role"}
                                        {profile.years_experience &&
                                            ` · ${profile.years_experience} years exp.`}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        {profile.ai_processing_consent_at ? (
                                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                ✓ AI processing consent given
                                            </span>
                                        ) : (
                                            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                                ✗ No AI consent — cannot
                                                generate applications
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => destroy(profile.id)}
                                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-5">
                            Add CV profile
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium text-zinc-500 block mb-1">
                                    Profile title *
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Laravel Developer CV"
                                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900"
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Target role
                                    </label>
                                    <input
                                        type="text"
                                        value={form.target_role}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                target_role: e.target.value,
                                            })
                                        }
                                        placeholder="Senior Laravel Developer"
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Years of experience
                                    </label>
                                    <input
                                        type="text"
                                        value={form.years_experience}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                years_experience:
                                                    e.target.value,
                                            })
                                        }
                                        placeholder="4+"
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-medium text-zinc-500 block mb-1">
                                    CV content *{" "}
                                    <span className="text-zinc-400 font-normal">
                                        (paste your full CV text)
                                    </span>
                                </label>
                                <textarea
                                    value={form.raw_cv}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            raw_cv: e.target.value,
                                        })
                                    }
                                    rows={12}
                                    placeholder="Paste your CV here — work experience, skills, education, etc."
                                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 resize-none font-mono"
                                />
                                {errors.raw_cv && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.raw_cv}
                                    </p>
                                )}
                            </div>

                            {/* DSGVO consent */}
                            <div
                                className={`rounded-xl border p-4 ${form.ai_consent ? "border-green-200 bg-green-50" : "border-zinc-200 bg-zinc-50"}`}
                            >
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.ai_consent}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                ai_consent: e.target.checked,
                                            })
                                        }
                                        className="mt-0.5 rounded border-zinc-300"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-zinc-900">
                                            DSGVO: I consent to AI processing of
                                            my CV data
                                        </p>
                                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                                            Your CV text will be sent to
                                            OpenRouter (EU-compliant) to
                                            generate adapted CVs and cover
                                            letters. This data is not stored by
                                            the AI provider and is only used to
                                            generate your application materials.
                                            You can withdraw consent by deleting
                                            this CV profile.
                                        </p>
                                    </div>
                                </label>
                                {errors.ai_consent && (
                                    <p className="text-red-500 text-xs mt-2">
                                        {errors.ai_consent}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={save}
                                disabled={saving || !form.title || !form.raw_cv}
                                className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                            >
                                {saving ? "Saving..." : "Save CV profile"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
