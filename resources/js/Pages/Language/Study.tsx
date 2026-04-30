import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Card {
    id: number;
    term_de: string;
    term_en: string;
    example_de: string | null;
    example_en: string | null;
    domain: string;
    level: string;
    repetitions: number;
}

interface Props {
    cards: Card[];
    domain: string;
}

const RATINGS = [
    {
        label: "Again",
        quality: 0,
        className: "border-red-200 text-red-700 hover:bg-red-50",
    },
    {
        label: "Hard",
        quality: 1,
        className: "border-orange-200 text-orange-700 hover:bg-orange-50",
    },
    {
        label: "Good",
        quality: 2,
        className: "border-blue-200 text-blue-700 hover:bg-blue-50",
    },
    {
        label: "Easy",
        quality: 3,
        className: "border-green-200 text-green-700 hover:bg-green-50",
    },
];

export default function Study({ cards, domain }: Props) {
    const [queue, setQueue] = useState<Card[]>(cards);
    const [flipped, setFlipped] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [reviewed, setReviewed] = useState(0);

    const current = queue[0];

    const submitReview = async (quality: number) => {
        if (!current || submitting) return;
        setSubmitting(true);

        await router.post(
            route("language.cards.review", current.id),
            { quality },
            {
                preserveScroll: true,
                onFinish: () => {
                    const next = queue.slice(1);
                    setReviewed((r) => r + 1);
                    setFlipped(false);
                    setSubmitting(false);
                    if (next.length === 0) {
                        setDone(true);
                    } else {
                        setQueue(next);
                    }
                },
            },
        );
    };

    if (done) {
        return (
            <AuthenticatedLayout>
                <Head title="Session complete" />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center max-w-sm">
                        <div className="text-5xl mb-4">🎉</div>
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                            Session complete!
                        </h2>
                        <p className="text-gray-500 mb-6">
                            You reviewed <strong>{reviewed}</strong> card
                            {reviewed !== 1 ? "s" : ""}. Keep it up —
                            consistency is the key to fluency.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() =>
                                    router.visit(
                                        route("language.study", domain),
                                    )
                                }
                                className="px-5 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition"
                            >
                                Study more
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
                </div>
            </AuthenticatedLayout>
        );
    }

    if (!current) return null;

    return (
        <AuthenticatedLayout>
            <Head title={`Study — ${domain}`} />

            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
                {/* Progress bar */}
                <div className="w-full max-w-lg mb-6">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{reviewed} reviewed</span>
                        <span>{queue.length} remaining</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gray-900 rounded-full transition-all duration-500"
                            style={{
                                width: `${(reviewed / (reviewed + queue.length)) * 100}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Card */}
                <div
                    className="w-full max-w-lg cursor-pointer"
                    onClick={() => !flipped && setFlipped(true)}
                    style={{ perspective: "1000px" }}
                >
                    <div
                        className="relative transition-transform duration-500"
                        style={{
                            transformStyle: "preserve-3d",
                            transform: flipped
                                ? "rotateY(180deg)"
                                : "rotateY(0deg)",
                            minHeight: "280px",
                        }}
                    >
                        {/* Front */}
                        <div
                            className="absolute inset-0 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center p-8"
                            style={{ backfaceVisibility: "hidden" }}
                        >
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-6">
                                {current.domain} · {current.level}
                            </span>
                            <p className="text-3xl font-semibold text-gray-900 text-center mb-4">
                                {current.term_de}
                            </p>
                            {current.example_de && (
                                <p className="text-sm text-gray-400 text-center italic max-w-xs">
                                    {current.example_de}
                                </p>
                            )}
                            <p className="text-xs text-gray-300 mt-8">
                                Tap to reveal
                            </p>
                        </div>

                        {/* Back */}
                        <div
                            className="absolute inset-0 bg-gray-900 rounded-2xl flex flex-col items-center justify-center p-8"
                            style={{
                                backfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                            }}
                        >
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-6">
                                translation
                            </span>
                            <p className="text-3xl font-semibold text-white text-center mb-4">
                                {current.term_en}
                            </p>
                            {current.example_en && (
                                <p className="text-sm text-gray-400 text-center italic max-w-xs">
                                    {current.example_en}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rating buttons — only show after flip */}
                <div
                    className={`w-full max-w-lg mt-6 transition-all duration-300 ${
                        flipped
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                >
                    <p className="text-xs text-center text-gray-400 mb-3">
                        How well did you know this?
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                        {RATINGS.map(({ label, quality, className }) => (
                            <button
                                key={quality}
                                onClick={() => submitReview(quality)}
                                disabled={submitting}
                                className={`py-3 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 ${className}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
