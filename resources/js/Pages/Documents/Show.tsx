import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface DocumentItem {
    id: number;
    description: string;
    quantity: string;
    unit: string;
    unit_price: string;
    total: string;
    position: number;
}

interface AuditLog {
    id: number;
    action: string;
    performed_at: string;
    payload: Record<string, any>;
}

interface Document {
    id: number;
    number: string;
    type: string;
    status: string;
    locale: string;
    sender_name: string;
    sender_email: string;
    sender_address: string;
    sender_steuernummer: string | null;
    sender_ust_id: string | null;
    recipient_name: string;
    recipient_company: string | null;
    recipient_address: string | null;
    recipient_ust_id: string | null;
    subtotal: string;
    tax_rate: string;
    tax_amount: string;
    total: string;
    currency: string;
    is_kleinunternehmer: boolean;
    is_reverse_charge: boolean;
    payment_terms: string;
    notes: string | null;
    issued_at: string;
    due_at: string | null;
    paid_at: string | null;
    finalised_at: string | null;
    pdf_path: string | null;
    items: DocumentItem[];
    audit_logs: AuditLog[];
}

interface Props {
    document: Document;
}

const TYPE_LABEL: Record<string, string> = {
    invoice: "Rechnung",
    proposal: "Angebot",
    contract: "Vertrag",
};

const STATUS_STYLES: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-500",
    sent: "bg-blue-50 text-blue-700",
    paid: "bg-green-50 text-green-700",
    cancelled: "bg-red-50 text-red-500",
};

const ACTION_LABEL: Record<string, string> = {
    created: "Created",
    finalised: "Finalised",
    marked_paid: "Marked paid",
    deleted: "Deleted",
};

function fmt(value: string): string {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(parseFloat(value));
}

function fmtDate(date: string): string {
    return new Date(date).toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

export default function DocumentShow({ document: doc }: Props) {
    const [confirming, setConfirming] = useState<
        "finalise" | "paid" | "delete" | null
    >(null);
    const [processing, setProcessing] = useState(false);

    const isOverdue =
        doc.due_at &&
        doc.status !== "paid" &&
        new Date(doc.due_at) < new Date();

    const action = (href: string, method: "post" | "delete") => {
        setProcessing(true);
        router[method](
            href,
            {},
            {
                onFinish: () => {
                    setProcessing(false);
                    setConfirming(null);
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={doc.number} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
                    <a
                        href="/documents"
                        className="hover:text-zinc-600 transition-colors"
                    >
                        Documents
                    </a>
                    <span>›</span>
                    <span className="font-mono">{doc.number}</span>
                </div>

                {/* Header bar */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-zinc-900 font-mono">
                                {doc.number}
                            </h1>
                            <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[doc.status]}`}
                            >
                                {doc.status}
                            </span>
                            {doc.finalised_at && (
                                <span
                                    className="text-xs text-zinc-400"
                                    title={`Finalised ${fmtDate(doc.finalised_at)}`}
                                >
                                    🔒 GoBD
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-zinc-500">
                            {TYPE_LABEL[doc.type]}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Download */}
                        <a
                            href={route("documents.download", doc.id)}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-zinc-200 text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors"
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
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                />
                            </svg>
                            PDF
                        </a>

                        {/* Finalise */}
                        {!doc.finalised_at && doc.status === "draft" && (
                            <button
                                onClick={() => setConfirming("finalise")}
                                disabled={processing}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
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
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                Finalisieren
                            </button>
                        )}

                        {/* Mark paid */}
                        {doc.type === "invoice" &&
                            doc.finalised_at &&
                            doc.status === "sent" && (
                                <button
                                    onClick={() => setConfirming("paid")}
                                    disabled={processing}
                                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-40 transition-colors"
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
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                    Bezahlt
                                </button>
                            )}

                        {/* Delete draft */}
                        {!doc.finalised_at && (
                            <button
                                onClick={() => setConfirming("delete")}
                                disabled={processing}
                                className="px-3 py-2 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                            >
                                Löschen
                            </button>
                        )}
                    </div>
                </div>

                {/* Overdue warning */}
                {isOverdue && (
                    <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        ⚠️ Overdue since {fmtDate(doc.due_at!)} — consider
                        sending a Mahnung
                    </div>
                )}

                {/* Confirmation dialogs */}
                {confirming && (
                    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
                            {confirming === "finalise" && (
                                <>
                                    <h3 className="font-semibold text-zinc-900 mb-2">
                                        Dokument finalisieren?
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-5">
                                        Das Dokument wird mit einer
                                        GoBD-konformen Hash-Kette gesichert und
                                        kann danach nicht mehr bearbeitet
                                        werden. Eine PDF wird erstellt.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setConfirming(null)}
                                            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700"
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            onClick={() =>
                                                action(
                                                    route(
                                                        "documents.finalise",
                                                        doc.id,
                                                    ),
                                                    "post",
                                                )
                                            }
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-40"
                                        >
                                            {processing
                                                ? "Finalisieren..."
                                                : "Ja, finalisieren"}
                                        </button>
                                    </div>
                                </>
                            )}
                            {confirming === "paid" && (
                                <>
                                    <h3 className="font-semibold text-zinc-900 mb-2">
                                        Als bezahlt markieren?
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-5">
                                        Rechnung {doc.number} über{" "}
                                        {fmt(doc.total)} als bezahlt markieren.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setConfirming(null)}
                                            className="px-4 py-2 text-sm text-zinc-500"
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            onClick={() =>
                                                action(
                                                    route(
                                                        "documents.paid",
                                                        doc.id,
                                                    ),
                                                    "post",
                                                )
                                            }
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium bg-green-700 text-white rounded-lg hover:bg-green-600 disabled:opacity-40"
                                        >
                                            {processing
                                                ? "..."
                                                : "Bezahlt markieren"}
                                        </button>
                                    </div>
                                </>
                            )}
                            {confirming === "delete" && (
                                <>
                                    <h3 className="font-semibold text-zinc-900 mb-2">
                                        Entwurf löschen?
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-5">
                                        Dieser Entwurf wird unwiderruflich
                                        gelöscht.
                                    </p>
                                    <div className="flex gap-3 justify-end">
                                        <button
                                            onClick={() => setConfirming(null)}
                                            className="px-4 py-2 text-sm text-zinc-500"
                                        >
                                            Abbrechen
                                        </button>
                                        <button
                                            onClick={() =>
                                                action(
                                                    route(
                                                        "documents.destroy",
                                                        doc.id,
                                                    ),
                                                    "delete",
                                                )
                                            }
                                            disabled={processing}
                                            className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-40"
                                        >
                                            {processing ? "..." : "Löschen"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Document body */}
                <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden mb-5">
                    {/* Parties */}
                    <div className="grid sm:grid-cols-2 gap-0 border-b border-zinc-100">
                        <div className="p-6 sm:border-r border-zinc-100">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                                Von
                            </p>
                            <p className="font-semibold text-zinc-900">
                                {doc.sender_name}
                            </p>
                            <p className="text-sm text-zinc-500">
                                {doc.sender_email}
                            </p>
                            {doc.sender_address && (
                                <p className="text-sm text-zinc-500 whitespace-pre-line mt-1">
                                    {doc.sender_address}
                                </p>
                            )}
                            {doc.sender_steuernummer && (
                                <p className="text-xs text-zinc-400 mt-2 font-mono">
                                    StNr: {doc.sender_steuernummer}
                                </p>
                            )}
                            {doc.sender_ust_id && (
                                <p className="text-xs text-zinc-400 font-mono">
                                    USt-Id: {doc.sender_ust_id}
                                </p>
                            )}
                        </div>
                        <div className="p-6">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                                An
                            </p>
                            {doc.recipient_company && (
                                <p className="font-semibold text-zinc-900">
                                    {doc.recipient_company}
                                </p>
                            )}
                            <p
                                className={`text-zinc-900 ${doc.recipient_company ? "text-sm" : "font-semibold"}`}
                            >
                                {doc.recipient_name}
                            </p>
                            {doc.recipient_address && (
                                <p className="text-sm text-zinc-500 whitespace-pre-line mt-1">
                                    {doc.recipient_address}
                                </p>
                            )}
                            {doc.recipient_ust_id && (
                                <p className="text-xs text-zinc-400 mt-2 font-mono">
                                    USt-Id: {doc.recipient_ust_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex gap-8 px-6 py-4 border-b border-zinc-100 bg-zinc-50">
                        <div>
                            <p className="text-xs text-zinc-400 mb-0.5">
                                Datum
                            </p>
                            <p className="text-sm font-medium text-zinc-900">
                                {fmtDate(doc.issued_at)}
                            </p>
                        </div>
                        {doc.due_at && (
                            <div>
                                <p className="text-xs text-zinc-400 mb-0.5">
                                    Zahlungsziel
                                </p>
                                <p
                                    className={`text-sm font-medium ${isOverdue ? "text-red-600" : "text-zinc-900"}`}
                                >
                                    {fmtDate(doc.due_at)}
                                </p>
                            </div>
                        )}
                        {doc.paid_at && (
                            <div>
                                <p className="text-xs text-zinc-400 mb-0.5">
                                    Bezahlt am
                                </p>
                                <p className="text-sm font-medium text-green-700">
                                    {fmtDate(doc.paid_at)}
                                </p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-zinc-400 mb-0.5">
                                Zahlungsziel
                            </p>
                            <p className="text-sm font-medium text-zinc-900">
                                {doc.payment_terms} Tage
                            </p>
                        </div>
                    </div>

                    {/* Items */}
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Pos.
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Beschreibung
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Menge
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Einheit
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Einzelpreis
                                </th>
                                <th className="text-right px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                    Gesamt
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {doc.items.map((item, i) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-zinc-50 last:border-0"
                                >
                                    <td className="px-6 py-4 text-zinc-400 text-xs">
                                        {i + 1}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-900">
                                        {item.description}
                                    </td>
                                    <td className="px-4 py-4 text-right text-zinc-600 font-mono text-xs">
                                        {parseFloat(
                                            item.quantity,
                                        ).toLocaleString("de-DE")}
                                    </td>
                                    <td className="px-4 py-4 text-right text-zinc-400 text-xs">
                                        {item.unit}
                                    </td>
                                    <td className="px-4 py-4 text-right text-zinc-600 font-mono text-xs">
                                        {fmt(item.unit_price)}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-xs font-semibold text-zinc-900">
                                        {fmt(item.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="px-6 py-5 border-t border-zinc-100 bg-zinc-50">
                        <div className="w-56 ml-auto space-y-2 text-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span>Nettobetrag</span>
                                <span className="font-mono">
                                    {fmt(doc.subtotal)}
                                </span>
                            </div>
                            {doc.is_kleinunternehmer ? (
                                <div className="flex justify-between text-zinc-400 text-xs">
                                    <span>MwSt. (§19 UStG)</span>
                                    <span>–</span>
                                </div>
                            ) : doc.is_reverse_charge ? (
                                <div className="flex justify-between text-zinc-400 text-xs">
                                    <span>Reverse Charge §13b</span>
                                    <span>–</span>
                                </div>
                            ) : (
                                <div className="flex justify-between text-zinc-500">
                                    <span>
                                        MwSt.{" "}
                                        {parseFloat(doc.tax_rate).toFixed(0)}%
                                    </span>
                                    <span className="font-mono">
                                        {fmt(doc.tax_amount)}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-200 text-base">
                                <span>Gesamtbetrag</span>
                                <span className="font-mono">
                                    {fmt(doc.total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {doc.notes && (
                        <div className="px-6 py-4 border-t border-zinc-100 bg-white">
                            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
                                Notizen
                            </p>
                            <p className="text-sm text-zinc-600 whitespace-pre-line">
                                {doc.notes}
                            </p>
                        </div>
                    )}

                    {/* GoBD hash */}
                    {doc.finalised_at && (
                        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50">
                            <p className="text-xs text-zinc-300 font-mono break-all">
                                GoBD:{" "}
                                {doc.finalised_at
                                    ? "🔒 Finalised " +
                                      fmtDate(doc.finalised_at)
                                    : ""}
                            </p>
                        </div>
                    )}
                </div>

                {/* Audit log */}
                {doc.audit_logs.length > 0 && (
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
                            Audit log
                        </h3>
                        <div className="space-y-2">
                            {doc.audit_logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-center justify-between text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full ${
                                                log.action === "finalised"
                                                    ? "bg-zinc-900"
                                                    : log.action ===
                                                        "marked_paid"
                                                      ? "bg-green-500"
                                                      : log.action === "deleted"
                                                        ? "bg-red-400"
                                                        : "bg-zinc-300"
                                            }`}
                                        />
                                        <span className="text-zinc-700 font-medium">
                                            {ACTION_LABEL[log.action] ??
                                                log.action}
                                        </span>
                                        {log.payload?.total_cents && (
                                            <span className="text-zinc-400 font-mono">
                                                {fmt(
                                                    String(
                                                        log.payload
                                                            .total_cents / 100,
                                                    ),
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-zinc-300">
                                        {new Date(
                                            log.performed_at,
                                        ).toLocaleString("de-DE")}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
