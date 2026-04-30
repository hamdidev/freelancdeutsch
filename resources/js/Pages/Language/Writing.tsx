import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Prompt {
    id: number;
    prompt_en: string;
    context: string;
    domain: string;
    level: string;
}

interface Correction {
    original: string;
    corrected: string;
    explanation: string;
}

interface Feedback {
    score: number | null;
    summary: string;
    corrections: Correction[];
    register: "too_informal" | "appropriate" | "too_formal";
    register_note: string;
    native_version: string;
    top_phrases: string[];
}

interface Props {
    prompt: Prompt | null;
    recent: Array<{
        id: number;
        score: number | null;
        domain: string;
        created_at: string;
    }>;
}

const REGISTER_LABEL: Record<string, { label: string; color: string }> = {
    too_informal: {
        label: "Too informal",
        color: "text-orange-600 bg-orange-50",
    },
    appropriate: { label: "Appropriate", color: "text-green-600 bg-green-50" },
    too_formal: { label: "Too formal", color: "text-blue-600 bg-blue-50" },
};

function ScoreRing({ score }: { score: number }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color =
        score >= 80
            ? "#22c55e"
            : score >= 60
              ? "#3b82f6"
              : score >= 40
                ? "#f97316"
                : "#ef4444";

    return (
        <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="absolute inset-0 -rotate-90" width="80" height="80">
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="5"
                />
                <circle
                    cx="40"
                    cy="40"
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 1s ease" }}
                />
            </svg>
            <span className="text-lg font-semibold text-gray-900">{score}</span>
        </div>
    );
}

export default function Writing({ prompt, recent }: Props) {
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<Feedback | null>(null);
    const [error, setError] = useState<string | null>(null);

    const minChars = 20;
    const canSubmit = text.trim().length >= minChars && !loading;

    const evaluate = async () => {
        if (!prompt || !canSubmit) return;
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(route("language.writing.evaluate"), {
                prompt_id: prompt.id,
                text: text.trim(),
            });
            setFeedback(res.data.feedback);
        } catch (err: any) {
            const msg = err.response?.data?.message;
            setError(msg ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setText("");
        setFeedback(null);
        setError(null);
        router.reload({ only: ["prompt"] });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Writing practice" />

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Writing practice
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Write in German. AI feedback in seconds.
                    </p>
                </div>

                {!prompt && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                        No prompts available for your current domain and level.
                        Update your profile to unlock more.
                    </div>
                )}

                {prompt && !feedback && (
                    <div className="space-y-4">
                        {/* Prompt card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                    {prompt.domain}
                                </span>
                                <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                                    {prompt.level}
                                </span>
                            </div>
                            {prompt.context && (
                                <p className="text-xs text-gray-400 mb-3 italic">
                                    {prompt.context}
                                </p>
                            )}
                            <p className="text-gray-900 font-medium">
                                {prompt.prompt_en}
                            </p>
                        </div>

                        {/* Textarea */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Schreiben Sie hier auf Deutsch..."
                                rows={8}
                                className="w-full px-5 py-4 text-sm text-gray-900 placeholder-gray-300 resize-none outline-none font-medium leading-relaxed"
                            />
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                <span
                                    className={`text-xs ${text.length < minChars ? "text-gray-300" : "text-gray-400"}`}
                                >
                                    {text.length} characters{" "}
                                    {text.length < minChars
                                        ? `(min ${minChars})`
                                        : ""}
                                </span>
                                <button
                                    onClick={evaluate}
                                    disabled={!canSubmit}
                                    className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
                                >
                                    {loading ? (
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
                                            Evaluating...
                                        </>
                                    ) : (
                                        "Get feedback →"
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                )}

                {/* Feedback panel */}
                {feedback && (
                    <div className="space-y-4">
                        {/* Score + summary */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-6 items-start">
                            {feedback.score !== null && (
                                <ScoreRing score={feedback.score} />
                            )}
                            <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {feedback.summary}
                                </p>
                                {feedback.register && (
                                    <span
                                        className={`mt-2 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${REGISTER_LABEL[feedback.register]?.color}`}
                                    >
                                        {
                                            REGISTER_LABEL[feedback.register]
                                                ?.label
                                        }
                                    </span>
                                )}
                                {feedback.register_note && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        {feedback.register_note}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Corrections */}
                        {feedback.corrections.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                                    Corrections
                                </h3>
                                <div className="space-y-4">
                                    {feedback.corrections.map((c, i) => (
                                        <div
                                            key={i}
                                            className="text-sm border-l-2 border-red-200 pl-4"
                                        >
                                            <p className="line-through text-red-400">
                                                {c.original}
                                            </p>
                                            <p className="text-green-700 font-medium mt-0.5">
                                                {c.corrected}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-1">
                                                {c.explanation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Native version */}
                        {feedback.native_version && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    Native version
                                </h3>
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {feedback.native_version}
                                </p>
                            </div>
                        )}

                        {/* Top phrases */}
                        {feedback.top_phrases.length > 0 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                    Phrases to remember
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.top_phrases.map((phrase, i) => (
                                        <span
                                            key={i}
                                            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium"
                                        >
                                            {phrase}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Your original text */}
                        <details className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <summary className="text-sm font-semibold text-gray-900 cursor-pointer">
                                Your original text
                            </summary>
                            <p className="text-sm text-gray-500 mt-3 leading-relaxed whitespace-pre-wrap">
                                {text}
                            </p>
                        </details>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={reset}
                                className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                            >
                                New prompt →
                            </button>
                            <button
                                onClick={() =>
                                    router.visit(route("language.index"))
                                }
                                className="px-5 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                            >
                                Back to dashboard
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent sessions */}
                {recent.length > 0 && !feedback && (
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Recent sessions
                        </h3>
                        <div className="space-y-2">
                            {recent.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="text-gray-500 capitalize">
                                        {session.domain}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {session.score !== null && (
                                            <span
                                                className={`text-xs font-medium ${
                                                    session.score >= 80
                                                        ? "text-green-600"
                                                        : session.score >= 60
                                                          ? "text-blue-600"
                                                          : "text-orange-600"
                                                }`}
                                            >
                                                {session.score}/100
                                            </span>
                                        )}
                                        <span className="text-gray-300 text-xs">
                                            {new Date(
                                                session.created_at,
                                            ).toLocaleDateString("en-GB")}
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
