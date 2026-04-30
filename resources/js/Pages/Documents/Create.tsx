import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

interface Client {
    id: number;
    name: string;
    company: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    ust_id: string | null;
}

interface User {
    name: string;
    email: string;
    steuernummer: string | null;
    ust_id: string | null;
}

interface Props {
    type: "invoice" | "proposal" | "contract";
    clients: Client[];
    user: User;
}

interface LineItem {
    description: string;
    quantity: string;
    unit: string;
    unit_price: string;
}

const TYPE_LABEL: Record<string, string> = {
    invoice: "Rechnung",
    proposal: "Angebot",
    contract: "Vertrag",
};

const UNITS = ["Std.", "Stk.", "Pauschale", "Tag", "Monat", "km"];

export default function DocumentCreate({ type, clients, user }: Props) {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        type,
        client_id: "",
        recipient_name: "",
        recipient_company: "",
        recipient_address: "",
        recipient_ust_id: "",
        sender_address: "",
        issued_at: new Date().toISOString().split("T")[0],
        tax_rate: "19",
        is_kleinunternehmer: false,
        is_reverse_charge: false,
        payment_terms: "14",
        notes: "",
        items: [
            { description: "", quantity: "1", unit: "Std.", unit_price: "" },
        ] as LineItem[],
    });

    const selectClient = (client: Client | null) => {
        setSelectedClient(client);
        if (client) {
            setData({
                ...data,
                client_id: String(client.id),
                recipient_name: client.name,
                recipient_company: client.company ?? "",
                recipient_address: [
                    client.address,
                    client.postal_code,
                    client.city,
                ]
                    .filter(Boolean)
                    .join(", "),
                recipient_ust_id: client.ust_id ?? "",
            });
        }
    };

    const addItem = () => {
        setData("items", [
            ...data.items,
            { description: "", quantity: "1", unit: "Std.", unit_price: "" },
        ]);
    };

    const removeItem = (index: number) => {
        setData(
            "items",
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateItem = (
        index: number,
        field: keyof LineItem,
        value: string,
    ) => {
        const updated = data.items.map((item, i) =>
            i === index ? { ...item, [field]: value } : item,
        );
        setData("items", updated);
    };

    const subtotal = data.items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0;
        const price = parseFloat(item.unit_price) || 0;
        return sum + qty * price;
    }, 0);

    const taxRate =
        data.is_kleinunternehmer || data.is_reverse_charge
            ? 0
            : parseFloat(data.tax_rate) || 0;

    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const fmt = (n: number) =>
        new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
        }).format(n);

    const submit = () => post(route("documents.store"));

    return (
        <AuthenticatedLayout>
            <Head title={`New ${TYPE_LABEL[type]}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                        <a
                            href="/documents"
                            className="hover:text-zinc-600 transition-colors"
                        >
                            Documents
                        </a>
                        <span>›</span>
                        <span>New {TYPE_LABEL[type]}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        New {TYPE_LABEL[type]}
                    </h1>
                </div>

                <div className="space-y-5">
                    {/* Client selector */}
                    {clients.length > 0 && (
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h2 className="text-sm font-semibold text-zinc-900 mb-3">
                                Quick-fill from client
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {clients.map((client) => (
                                    <button
                                        key={client.id}
                                        type="button"
                                        onClick={() =>
                                            selectClient(
                                                selectedClient?.id === client.id
                                                    ? null
                                                    : client,
                                            )
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            selectedClient?.id === client.id
                                                ? "bg-zinc-900 text-white border-zinc-900"
                                                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                                        }`}
                                    >
                                        {client.company ?? client.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Parties */}
                    <div className="grid sm:grid-cols-2 gap-5">
                        {/* Sender */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
                                Von (Absender)
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-medium text-zinc-500 mb-1">
                                        Name
                                    </p>
                                    <p className="text-sm text-zinc-900">
                                        {user.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-zinc-500 mb-1">
                                        E-Mail
                                    </p>
                                    <p className="text-sm text-zinc-900">
                                        {user.email}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Adresse
                                    </label>
                                    <textarea
                                        value={data.sender_address}
                                        onChange={(e) =>
                                            setData(
                                                "sender_address",
                                                e.target.value,
                                            )
                                        }
                                        rows={3}
                                        placeholder="Straße, PLZ, Stadt"
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                                    />
                                </div>
                                {user.steuernummer && (
                                    <div>
                                        <p className="text-xs font-medium text-zinc-500 mb-1">
                                            Steuernummer
                                        </p>
                                        <p className="text-sm text-zinc-900 font-mono">
                                            {user.steuernummer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipient */}
                        <div className="bg-white rounded-xl border border-zinc-200 p-5">
                            <h2 className="text-sm font-semibold text-zinc-900 mb-4">
                                An (Empfänger)
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Name{" "}
                                        <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.recipient_name}
                                        onChange={(e) =>
                                            setData(
                                                "recipient_name",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                    {errors.recipient_name && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.recipient_name}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Firma
                                    </label>
                                    <input
                                        type="text"
                                        value={data.recipient_company}
                                        onChange={(e) =>
                                            setData(
                                                "recipient_company",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Adresse
                                    </label>
                                    <textarea
                                        value={data.recipient_address}
                                        onChange={(e) =>
                                            setData(
                                                "recipient_address",
                                                e.target.value,
                                            )
                                        }
                                        rows={2}
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        USt-IdNr
                                    </label>
                                    <input
                                        type="text"
                                        value={data.recipient_ust_id}
                                        onChange={(e) =>
                                            setData(
                                                "recipient_ust_id",
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        placeholder="DE123456789"
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document details */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <h2 className="text-sm font-semibold text-zinc-900 mb-4">
                            Details
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs font-medium text-zinc-500 block mb-1">
                                    Datum{" "}
                                    <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={data.issued_at}
                                    onChange={(e) =>
                                        setData("issued_at", e.target.value)
                                    }
                                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                            {type === "invoice" && (
                                <div>
                                    <label className="text-xs font-medium text-zinc-500 block mb-1">
                                        Zahlungsziel (Tage)
                                    </label>
                                    <input
                                        type="number"
                                        value={data.payment_terms}
                                        onChange={(e) =>
                                            setData(
                                                "payment_terms",
                                                e.target.value,
                                            )
                                        }
                                        min="1"
                                        max="365"
                                        className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-medium text-zinc-500 block mb-1">
                                    MwSt. %
                                </label>
                                <select
                                    value={data.tax_rate}
                                    onChange={(e) =>
                                        setData("tax_rate", e.target.value)
                                    }
                                    disabled={
                                        data.is_kleinunternehmer ||
                                        data.is_reverse_charge
                                    }
                                    className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-50 disabled:text-zinc-400"
                                >
                                    <option value="19">19%</option>
                                    <option value="7">7%</option>
                                    <option value="0">0%</option>
                                </select>
                            </div>
                        </div>

                        {/* German tax toggles */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-zinc-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_kleinunternehmer}
                                    onChange={(e) =>
                                        setData(
                                            "is_kleinunternehmer",
                                            e.target.checked,
                                        )
                                    }
                                    className="rounded border-zinc-300"
                                />
                                <span className="text-xs text-zinc-700">
                                    Kleinunternehmer (§19 UStG)
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_reverse_charge}
                                    onChange={(e) =>
                                        setData(
                                            "is_reverse_charge",
                                            e.target.checked,
                                        )
                                    }
                                    className="rounded border-zinc-300"
                                />
                                <span className="text-xs text-zinc-700">
                                    Reverse Charge (§13b UStG)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Line items */}
                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-zinc-900">
                                Positionen
                            </h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
                            >
                                + Position hinzufügen
                            </button>
                        </div>

                        <div className="divide-y divide-zinc-50">
                            {data.items.map((item, index) => (
                                <div key={index} className="px-5 py-4">
                                    <div className="grid grid-cols-12 gap-3 items-start">
                                        {/* Description */}
                                        <div className="col-span-12 sm:col-span-5">
                                            {index === 0 && (
                                                <label className="text-xs text-zinc-400 block mb-1">
                                                    Beschreibung
                                                </label>
                                            )}
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Leistungsbeschreibung..."
                                                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                            />
                                            {errors[
                                                `items.${index}.description` as keyof typeof errors
                                            ] && (
                                                <p className="text-red-500 text-xs mt-1">
                                                    Required
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-span-3 sm:col-span-2">
                                            {index === 0 && (
                                                <label className="text-xs text-zinc-400 block mb-1">
                                                    Menge
                                                </label>
                                            )}
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "quantity",
                                                        e.target.value,
                                                    )
                                                }
                                                min="0"
                                                step="0.5"
                                                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Unit */}
                                        <div className="col-span-3 sm:col-span-2">
                                            {index === 0 && (
                                                <label className="text-xs text-zinc-400 block mb-1">
                                                    Einheit
                                                </label>
                                            )}
                                            <select
                                                value={item.unit}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "unit",
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                            >
                                                {UNITS.map((u) => (
                                                    <option key={u} value={u}>
                                                        {u}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Unit price */}
                                        <div className="col-span-4 sm:col-span-2">
                                            {index === 0 && (
                                                <label className="text-xs text-zinc-400 block mb-1">
                                                    Preis/Einheit €
                                                </label>
                                            )}
                                            <input
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) =>
                                                    updateItem(
                                                        index,
                                                        "unit_price",
                                                        e.target.value,
                                                    )
                                                }
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent font-mono"
                                            />
                                        </div>

                                        {/* Total + remove */}
                                        <div className="col-span-2 sm:col-span-1 flex items-end justify-end gap-2">
                                            {index === 0 && (
                                                <div className="hidden sm:block h-5" />
                                            )}
                                            <div className="flex items-center gap-2 pb-2">
                                                <span className="text-xs font-mono font-semibold text-zinc-900 whitespace-nowrap">
                                                    {fmt(
                                                        (parseFloat(
                                                            item.quantity,
                                                        ) || 0) *
                                                            (parseFloat(
                                                                item.unit_price,
                                                            ) || 0),
                                                    )}
                                                </span>
                                                {data.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        className="text-zinc-300 hover:text-red-400 transition-colors"
                                                    >
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                            strokeWidth={2}
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="px-5 py-4 border-t border-zinc-100 bg-zinc-50">
                            <div className="w-56 ml-auto space-y-1.5 text-sm">
                                <div className="flex justify-between text-zinc-500">
                                    <span>Nettobetrag</span>
                                    <span className="font-mono">
                                        {fmt(subtotal)}
                                    </span>
                                </div>
                                {data.is_kleinunternehmer ? (
                                    <div className="flex justify-between text-zinc-400 text-xs">
                                        <span>MwSt. (§19 UStG)</span>
                                        <span className="font-mono">—</span>
                                    </div>
                                ) : data.is_reverse_charge ? (
                                    <div className="flex justify-between text-zinc-400 text-xs">
                                        <span>MwSt. (Reverse Charge)</span>
                                        <span className="font-mono">—</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between text-zinc-500">
                                        <span>MwSt. {data.tax_rate}%</span>
                                        <span className="font-mono">
                                            {fmt(taxAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-zinc-900 pt-1.5 border-t border-zinc-200">
                                    <span>Gesamtbetrag</span>
                                    <span className="font-mono">
                                        {fmt(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="bg-white rounded-xl border border-zinc-200 p-5">
                        <label className="text-sm font-semibold text-zinc-900 block mb-3">
                            Notizen (optional)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={3}
                            placeholder="Zusätzliche Hinweise, Bankverbindung, etc."
                            className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pb-8">
                        <a
                            href="/documents"
                            className="px-5 py-2 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                        >
                            Abbrechen
                        </a>
                        <button
                            type="button"
                            onClick={submit}
                            disabled={processing}
                            className="px-6 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                        >
                            {processing
                                ? "Speichern..."
                                : `${TYPE_LABEL[type]} erstellen`}
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
