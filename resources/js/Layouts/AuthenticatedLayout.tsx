import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";

interface Props {
    children: React.ReactNode;
    header?: React.ReactNode;
}

const NAV_ITEMS = [
    {
        label: "Dashboard",
        href: "/dashboard",
        routeName: "dashboard",
        icon: (
            <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
            </svg>
        ),
    },
    {
        label: "Language",
        href: "/language",
        routeName: "language.index",
        icon: (
            <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
            </svg>
        ),
    },
    {
        label: "Documents",
        href: "/documents",
        routeName: "documents.index",
        icon: (
            <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
        ),
    },
    {
        label: "Jobs",
        href: "/jobs",
        routeName: "jobs.index",
        icon: (
            <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            </svg>
        ),
    },
    {
        label: "Billing",
        href: "/billing",
        routeName: "billing.plans",
        icon: (
            <svg
                width="16"
                height="16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
            </svg>
        ),
    },
];

const PLAN_BADGE: Record<string, string> = {
    free: "bg-zinc-100 text-zinc-500",
    pro: "bg-amber-100 text-amber-700",
    agency: "bg-zinc-900 text-white",
};

export default function AuthenticatedLayout({ children }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentPath = window.location.pathname;

    const isActive = (href: string) =>
        href === "/dashboard"
            ? currentPath === "/dashboard"
            : currentPath.startsWith(href);

    const logout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950 border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 group"
                            >
                                <div className="flex gap-0.5">
                                    <span className="w-1.5 h-5 rounded-sm bg-zinc-800 group-hover:bg-zinc-700 transition-colors" />
                                    <span className="w-1.5 h-5 rounded-sm bg-red-600" />
                                    <span className="w-1.5 h-5 rounded-sm bg-amber-400" />
                                </div>
                                <span className="text-white font-semibold text-sm tracking-tight">
                                    JobNomade
                                </span>
                            </Link>

                            {/* Desktop nav links */}
                            <div className="hidden md:flex items-center gap-1">
                                {NAV_ITEMS.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                            isActive(item.href)
                                                ? "bg-zinc-800 text-white"
                                                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {/* German level badge */}
                            {user.german_level && (
                                <span className="hidden sm:block text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-amber-400">
                                    {user.german_level}
                                </span>
                            )}

                            {/* Plan badge */}
                            <span
                                className={`hidden sm:block text-xs font-medium px-2 py-0.5 rounded capitalize ${PLAN_BADGE[user.plan]}`}
                            >
                                {user.plan}
                            </span>

                            {/* User menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setMenuOpen(!menuOpen)}
                                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-xs font-semibold text-zinc-900">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="hidden sm:block text-xs text-zinc-300 max-w-[100px] truncate">
                                        {user.username ?? user.name}
                                    </span>
                                    <svg
                                        width="12"
                                        height="12"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                        className="text-zinc-500"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {/* Dropdown */}
                                {menuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden">
                                            <div className="px-4 py-3 border-b border-zinc-800">
                                                <p className="text-xs font-medium text-white truncate">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {user.email}
                                                </p>
                                            </div>
                                            <div className="py-1">
                                                <Link
                                                    href="/onboarding"
                                                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                        />
                                                    </svg>
                                                    Edit profile
                                                </Link>
                                                <Link
                                                    href="/billing"
                                                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                                                    onClick={() =>
                                                        setMenuOpen(false)
                                                    }
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                        />
                                                    </svg>
                                                    Billing
                                                </Link>
                                            </div>
                                            <div className="py-1 border-t border-zinc-800">
                                                <button
                                                    onClick={logout}
                                                    className="flex items-center gap-2 w-full px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                                                >
                                                    <svg
                                                        width="13"
                                                        height="13"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                        strokeWidth={1.5}
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                        />
                                                    </svg>
                                                    Sign out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                className="md:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    {mobileOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-3 space-y-1">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isActive(item.href)
                                        ? "bg-zinc-800 text-white"
                                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Page content */}
            <main className="pt-14">{children}</main>
        </div>
    );
}
