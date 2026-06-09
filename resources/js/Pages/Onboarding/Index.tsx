import { useState } from "react";
import { useForm, Head } from "@inertiajs/react";

type Step = 1 | 2 | 3;

interface Props {
    user: {
        name: string;
        username: string;
        email: string;
        german_level: string | null;
        freelance_domain: string | null;
        steuernummer: string | null;
        ust_id: string | null;
    };
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const DOMAINS = [
    { value: "it", label: "IT / Software" },
    { value: "legal", label: "Legal" },
    { value: "finance", label: "Finance" },
    { value: "marketing", label: "Marketing" },
    { value: "design", label: "Design" },
    { value: "other", label: "Other" },
];

export default function Onboarding({ user }: Props) {
    const [step, setStep] = useState<Step>(1);

    const { data, setData, post, processing, errors } = useForm({
        username: user.username ?? "",
        german_level: user.german_level ?? "",
        freelance_domain: user.freelance_domain ?? "",
        steuernummer: user.steuernummer ?? "",
        ust_id: user.ust_id ?? "",
    });

    const next = () => setStep((s) => Math.min(s + 1, 3) as Step);
    const back = () => setStep((s) => Math.max(s - 1, 1) as Step);

    const submit = () => post(route("onboarding.store"));

    return (
        <>
            <Head title="Welcome to JobNomade" />

            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Welcome, {user.name.split(" ")[0]} 👋
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">
                            Let's set up your profile. Takes about 1 minute.
                        </p>
                    </div>

                    {/* Step indicators */}
                    <div className="flex items-center gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                                    ${step === s ? "bg-gray-900 text-white" : step > s ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"}`}
                                >
                                    {step > s ? "✓" : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`h-px w-12 ${step > s ? "bg-green-500" : "bg-gray-200"}`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1 — Username */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-1">
                                    Your username
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    This is how you'll appear on documents and
                                    your client portal.
                                </p>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <div className="flex rounded-md border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent">
                                    <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
                                        @
                                    </span>
                                    <input
                                        type="text"
                                        value={data.username}
                                        onChange={(e) =>
                                            setData("username", e.target.value)
                                        }
                                        className="flex-1 px-3 py-2 text-sm outline-none"
                                        placeholder="yourname"
                                    />
                                </div>
                                {errors.username && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.username}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2 — German level + domain */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-1">
                                    Your German level
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    We'll tailor vocabulary and writing prompts
                                    to your level.
                                </p>
                                <div className="grid grid-cols-6 gap-2">
                                    {LEVELS.map((level) => (
                                        <button
                                            key={level}
                                            type="button"
                                            onClick={() =>
                                                setData("german_level", level)
                                            }
                                            className={`py-2 rounded-lg text-sm font-medium border transition-colors
                                                ${
                                                    data.german_level === level
                                                        ? "bg-gray-900 text-white border-gray-900"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                                {errors.german_level && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.german_level}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your freelance domain
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {DOMAINS.map((d) => (
                                        <button
                                            key={d.value}
                                            type="button"
                                            onClick={() =>
                                                setData(
                                                    "freelance_domain",
                                                    d.value,
                                                )
                                            }
                                            className={`py-2 px-3 rounded-lg text-sm font-medium border text-left transition-colors
                                                ${
                                                    data.freelance_domain ===
                                                    d.value
                                                        ? "bg-gray-900 text-white border-gray-900"
                                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400"
                                                }`}
                                        >
                                            {d.label}
                                        </button>
                                    ))}
                                </div>
                                {errors.freelance_domain && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.freelance_domain}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Tax info */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 mb-1">
                                    Tax information
                                </h2>
                                <p className="text-sm text-gray-500 mb-4">
                                    Used on your German invoices and documents.
                                    You can update these later.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Steuernummer
                                            <span className="text-gray-400 font-normal ml-1">
                                                (optional)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.steuernummer}
                                            onChange={(e) =>
                                                setData(
                                                    "steuernummer",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g. 12/345/67890"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                        {errors.steuernummer && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.steuernummer}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            USt-IdNr
                                            <span className="text-gray-400 font-normal ml-1">
                                                (optional — if VAT registered)
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.ust_id}
                                            onChange={(e) =>
                                                setData(
                                                    "ust_id",
                                                    e.target.value.toUpperCase(),
                                                )
                                            }
                                            placeholder="e.g. DE123456789"
                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                        />
                                        {errors.ust_id && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {errors.ust_id}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Format: DE followed by 9 digits
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={back}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition"
                            >
                                ← Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={next}
                                disabled={
                                    (step === 1 && !data.username) ||
                                    (step === 2 &&
                                        (!data.german_level ||
                                            !data.freelance_domain))
                                }
                                className="px-6 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                Continue →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={submit}
                                disabled={processing}
                                className="px-6 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 disabled:opacity-40 transition"
                            >
                                {processing ? "Saving..." : "Finish setup →"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
