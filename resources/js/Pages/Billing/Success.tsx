import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Props {
    plan: string;
}

export default function BillingSuccess({ plan }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Upgrade successful" />

            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">🎉</div>
                    <h1 className="text-2xl font-bold text-zinc-900 mb-2">
                        Welcome to{" "}
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}!
                    </h1>
                    <p className="text-zinc-500 text-sm mb-6">
                        Your subscription is active. All features are now
                        unlocked.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Link
                            href={route("dashboard")}
                            className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            Go to dashboard →
                        </Link>
                        <Link
                            href={route("language.index")}
                            className="px-5 py-2 border border-zinc-200 text-zinc-600 text-sm font-medium rounded-lg hover:bg-zinc-50 transition-colors"
                        >
                            Start studying
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
