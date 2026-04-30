import { Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Client {
    id: number;
    name: string;
    company: string | null;
}

interface Document {
    id: number;
    number: string;
    type: "invoice" | "proposal" | "contract";
    status: "draft" | "sent" | "paid" | "cancelled";
    recipient_name: string;
    recipient_company: string | null;
    total: string;
    currency: string;
    issued_at: string;
    due_at: string | null;
    finalised_at: string | null;
    client: Client | null;
}

interface Paginator {
    data: Document[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

interface Props {
    documents: Paginator;
}

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-500",
    sent: "bg-blue-50 text-blue-700",
    paid: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-500",
};

const TYPE_LABEL: Record<string, string> = {
    invoice: "Rechnung",
    proposal: "Angebot",
    contract: "Vertrag",
};

const TYPE_STYLES: Record<string, string> = {
    invoice: "text-amber-700 bg-amber-50",
    proposal: "text-blue-700 bg-blue-50",
    contract: "text-purple-700 bg-purple-50",
};

function formatEur(value: string): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(parseFloat(value));
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function DocumentsIndex({ documents }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title="Documents" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Documents
                        </h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            {documents.total} document
                            {documents.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(["invoice", "proposal", "contract"] as const).map(
                            (type) => (
                                <Link
                                    key={type}
                                    href={`/documents/create?type=${type}`}
                                    className="px-3 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                                >
                                    + {TYPE_LABEL[type]}
                                </Link>
                            ),
                        )}
                    </div>
                </div>

                {/* Table */}
                {documents.data.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
                        <div className="text-4xl mb-3">📄</div>
                        <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                            No documents yet
                        </h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Create your first invoice, proposal or contract
                        </p>
                        <Link
                            href="/documents/create?type=invoice"
                            className="inline-flex px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            + New invoice
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Number
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Type
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Recipient
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Issued
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Due
                                    </th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Total
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.data.map((doc) => (
                                    <tr
                                        key={doc.id}
                                        onClick={() =>
                                            router.visit(`/documents/${doc.id}`)
                                        }
                                        className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors last:border-0"
                                    >
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-xs font-semibold text-zinc-900">
                                                {doc.number}
                                            </span>
                                            {doc.finalised_at && (
                                                <span
                                                    className="ml-2 text-xs text-zinc-300"
                                                    title="GoBD finalised"
                                                >
                                                    🔒
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[doc.type]}`}
                                            >
                                                {TYPE_LABEL[doc.type]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-zinc-900 font-medium text-xs">
                                                {doc.recipient_company ??
                                                    doc.recipient_name}
                                            </p>
                                            {doc.recipient_company && (
                                                <p className="text-zinc-400 text-xs">
                                                    {doc.recipient_name}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-zinc-500">
                                            {formatDate(doc.issued_at)}
                                        </td>
                                        <td className="px-5 py-4 text-xs">
                                            {doc.due_at ? (
                                                <span
                                                    className={
                                                        doc.status !== "paid" &&
                                                        new Date(doc.due_at) <
                                                            new Date()
                                                            ? "text-red-500 font-medium"
                                                            : "text-zinc-500"
                                                    }
                                                >
                                                    {formatDate(doc.due_at)}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-300">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <span className="font-mono text-xs font-semibold text-zinc-900">
                                                {formatEur(doc.total)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[doc.status]}`}
                                            >
                                                {doc.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {documents.last_page > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100">
                                <span className="text-xs text-zinc-400">
                                    Page {documents.current_page} of{" "}
                                    {documents.last_page}
                                </span>
                                <div className="flex gap-1">
                                    {documents.links.map(
                                        (link, i) =>
                                            link.url && (
                                                <button
                                                    key={i}
                                                    onClick={() =>
                                                        router.visit(link.url!)
                                                    }
                                                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                                        link.active
                                                            ? "bg-zinc-900 text-white"
                                                            : "text-zinc-500 hover:bg-zinc-100"
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
