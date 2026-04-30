import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import type { PageProps } from "@/types";

interface Plan {
    name: string;
    slug: string;
    price_cents: number;
    currency: string;
    limits: Record<string, number>;
    features: string[];
}

interface Props {
    plans: Plan[];
    currentPlan: string;
    onGracePeriod: boolean | null;
    subscriptionEnds: string | null;
}

const FEATURE_LABELS: Record<string, string> = {
    srs: "Spaced repetition flashcards",
    document_generator: "Document generator",
    job_feed: "Job board",
    job_feed_readonly: "Job board (read-only)",
    cv_adapter: "CV adapter",
    bewerbung: "Bewerbungsschreiben generator",
    team_seats: "5 team seats",
    white_label: "White-label documents",
};

const LIMIT_LABELS: Record<string, string> = {
    ai_writing: "AI writing checks/month",
    documents: "Documents/month",
    vocab_cards: "Vocab cards/day",
};

function formatPrice(cents: number, currency: string): string {
    if (cents === 0) return "€0";
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

export default function BillingPlans({
    plans,
    currentPlan,
    onGracePeriod,
    subscriptionEnds,
}: Props) {
    const { errors } = usePage<PageProps>().props;
    const [loading, setLoading] = useState<string | null>(null);

    const checkout = (slug: string) => {
        setLoading(slug);
        router.post(
            route("billing.checkout"),
            { plan: slug },
            { onFinish: () => setLoading(null) },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Billing — Plans" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                {errors.billing && (
                    <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                        {errors.billing}
                    </div>
                )}

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Plans & Billing
                    </h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Current plan:{" "}
                        <span className="font-medium text-zinc-700 capitalize">
                            {currentPlan}
                        </span>
                        {onGracePeriod && subscriptionEnds && (
                            <span className="ml-2 text-amber-600">
                                · Cancels{" "}
                                {new Date(subscriptionEnds).toLocaleDateString(
                                    "de-DE",
                                )}
                            </span>
                        )}
                    </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-5 mb-8">
                    {plans.map((plan) => {
                        const isCurrent = plan.slug === currentPlan;
                        const isHighlight = plan.slug === "pro";

                        return (
                            <div
                                key={plan.slug}
                                className={`rounded-2xl p-6 border transition-colors ${
                                    isHighlight
                                        ? "bg-zinc-900 border-zinc-700 text-white"
                                        : "bg-white border-zinc-200 text-zinc-900"
                                }`}
                            >
                                <div className="mb-5">
                                    <div className="flex items-center justify-between mb-1">
                                        <p
                                            className={`text-sm font-semibold capitalize ${isHighlight ? "text-zinc-400" : "text-zinc-500"}`}
                                        >
                                            {plan.name}
                                        </p>
                                        {isCurrent && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                                Current
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">
                                            {formatPrice(
                                                plan.price_cents,
                                                plan.currency,
                                            )}
                                        </span>
                                        <span
                                            className={`text-sm ${isHighlight ? "text-zinc-500" : "text-zinc-400"}`}
                                        >
                                            / month
                                        </span>
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="space-y-1.5 mb-4">
                                    {Object.entries(plan.limits).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="flex justify-between text-xs"
                                            >
                                                <span
                                                    className={
                                                        isHighlight
                                                            ? "text-zinc-400"
                                                            : "text-zinc-500"
                                                    }
                                                >
                                                    {LIMIT_LABELS[key] ?? key}
                                                </span>
                                                <span
                                                    className={`font-mono font-semibold ${isHighlight ? "text-amber-400" : "text-zinc-900"}`}
                                                >
                                                    {value === -1 ? "∞" : value}
                                                </span>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5 mb-6">
                                    {plan.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex items-start gap-2 text-xs"
                                        >
                                            <span
                                                className={
                                                    isHighlight
                                                        ? "text-amber-400"
                                                        : "text-zinc-400"
                                                }
                                            >
                                                ✓
                                            </span>
                                            <span
                                                className={
                                                    isHighlight
                                                        ? "text-zinc-300"
                                                        : "text-zinc-600"
                                                }
                                            >
                                                {FEATURE_LABELS[feature] ??
                                                    feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.slug === "free" ? (
                                    <div
                                        className={`w-full text-center py-2.5 rounded-xl text-sm font-medium ${
                                            isHighlight
                                                ? "bg-zinc-800 text-zinc-500"
                                                : "bg-zinc-100 text-zinc-400"
                                        }`}
                                    >
                                        {isCurrent
                                            ? "Your current plan"
                                            : "Free forever"}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => checkout(plan.slug)}
                                        disabled={isCurrent || loading === plan.slug}
                                        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                            isHighlight
                                                ? "bg-amber-400 text-zinc-900 hover:bg-amber-300"
                                                : "bg-zinc-900 text-white hover:bg-zinc-700"
                                        }`}
                                    >
                                        {loading === plan.slug
                                            ? "Redirecting…"
                                            : isCurrent
                                              ? "Current plan"
                                              : `Upgrade to ${plan.name}`}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Manage subscription */}
                {currentPlan !== "free" && (
                    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-zinc-900">
                                Manage subscription
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Update payment method, download invoices, or
                                cancel
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {onGracePeriod ? (
                                <button
                                    onClick={() =>
                                        router.post(route("billing.resume"))
                                    }
                                    className="px-4 py-2 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Resume subscription
                                </button>
                            ) : (
                                <>
                                    <a
                                        href={route("billing.portal")}
                                        className="px-4 py-2 text-sm font-medium border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors"
                                    >
                                        Billing portal
                                    </a>
                                    <button
                                        onClick={() =>
                                            router.post(route("billing.cancel"))
                                        }
                                        className="px-4 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
