import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";

interface Client {
    id: number;
    name: string;
    email: string | null;
    company: string | null;
    address: string | null;
    city: string | null;
    postal_code: string | null;
    country: string;
    ust_id: string | null;
    documents_count: number;
}

interface Props {
    clients: { data: Client[] };
}

const EMPTY: Partial<Client> = {
    name: "",
    email: "",
    company: "",
    address: "",
    city: "",
    postal_code: "",
    country: "DE",
    ust_id: "",
};

export default function Clients({ clients }: Props) {
    const [form, setForm] = useState<Partial<Client>>(EMPTY);
    const [editing, setEditing] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    const openNew = () => {
        setForm(EMPTY);
        setEditing(null);
        setErrors({});
        setOpen(true);
    };

    const openEdit = (client: Client) => {
        setForm(client);
        setEditing(client.id);
        setErrors({});
        setOpen(true);
    };

    const save = async () => {
        setSaving(true);
        setErrors({});

        try {
            if (editing) {
                await axios.put(route("clients.update", editing), form);
            } else {
                await axios.post(route("clients.store"), form);
            }
            setOpen(false);
            router.reload({ only: ["clients"] });
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
        } finally {
            setSaving(false);
        }
    };

    const destroy = async (client: Client) => {
        if (!confirm(`Delete ${client.name}?`)) return;

        try {
            await axios.delete(route("clients.destroy", client.id));
            router.reload({ only: ["clients"] });
        } catch (err: any) {
            alert(err.response?.data?.message ?? "Cannot delete client");
        }
    };

    const field = (
        key: keyof Client,
        label: string,
        opts?: { placeholder?: string; mono?: boolean },
    ) => (
        <div>
            <label className="text-xs font-medium text-zinc-500 block mb-1">
                {label}
            </label>
            <input
                type="text"
                value={(form[key] as string) ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={opts?.placeholder}
                className={`w-full text-sm px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent ${
                    errors[key] ? "border-red-300" : "border-zinc-200"
                } ${opts?.mono ? "font-mono" : ""}`}
            />
            {errors[key] && (
                <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Clients" />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Clients
                        </h1>
                        <p className="text-sm text-zinc-400 mt-0.5">
                            {clients.data.length} total
                        </p>
                    </div>
                    <button
                        onClick={openNew}
                        className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                        + New client
                    </button>
                </div>

                {clients.data.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-zinc-200">
                        <div className="text-4xl mb-3">👤</div>
                        <h3 className="text-sm font-semibold text-zinc-900 mb-1">
                            No clients yet
                        </h3>
                        <p className="text-xs text-zinc-400 mb-4">
                            Add a client to quick-fill your documents
                        </p>
                        <button
                            onClick={openNew}
                            className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            + Add client
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-100">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Name
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Company
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Email
                                    </th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        USt-IdNr
                                    </th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                                        Docs
                                    </th>
                                    <th className="px-5 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {clients.data.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="border-b border-zinc-50 hover:bg-zinc-50 last:border-0 transition-colors"
                                    >
                                        <td className="px-5 py-4 font-medium text-zinc-900">
                                            {client.name}
                                        </td>
                                        <td className="px-5 py-4 text-zinc-500">
                                            {client.company ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 text-zinc-500">
                                            {client.email ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs text-zinc-400">
                                            {client.ust_id ?? "—"}
                                        </td>
                                        <td className="px-5 py-4 text-right text-zinc-400 text-xs">
                                            {client.documents_count}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() =>
                                                        openEdit(client)
                                                    }
                                                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        destroy(client)
                                                    }
                                                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-5">
                            {editing ? "Edit client" : "New client"}
                        </h2>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {field("name", "Name *")}
                                {field("company", "Company")}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {field("email", "Email", {
                                    placeholder: "hello@company.de",
                                })}
                                {field("ust_id", "USt-IdNr", {
                                    placeholder: "DE123456789",
                                    mono: true,
                                })}
                            </div>
                            {field("address", "Address", {
                                placeholder: "Straße 1",
                            })}
                            <div className="grid grid-cols-3 gap-4">
                                {field("postal_code", "PLZ", {
                                    placeholder: "10115",
                                })}
                                {field("city", "City", {
                                    placeholder: "Berlin",
                                })}
                                {field("country", "Country", {
                                    placeholder: "DE",
                                })}
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
                                disabled={saving || !form.name}
                                className="px-5 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                            >
                                {saving
                                    ? "Saving..."
                                    : editing
                                      ? "Update"
                                      : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
