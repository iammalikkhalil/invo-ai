"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { UuidField } from "@/components/master-data/UuidField";
import { useFormatters } from "@/hooks/useFormatters";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";
import { useInvoices, useInvoiceMutations } from "@/hooks/useInvoices";
import { useBusinesses, useClients } from "@/hooks/useBusinessClients";
import { useTaxes, useTerms, usePaymentInstructions } from "@/hooks/useMasterData";
import {
    invoiceSchema,
    lineItemSchema,
    type Invoice,
    type InvoiceLineItem,
    type InvoiceFormValues
} from "@/types/dto/invoices";
import { generateUuid } from "@/utils/uuid";

const statusOptions = ["draft", "sent", "paid", "overdue"];

const blankLineItem = (): InvoiceLineItem => ({
    id: generateUuid(),
    description: "",
    qty: 1,
    price: 0,
    itemId: undefined,
    taxId: undefined,
    discount: undefined
});

const blankInvoice = (): InvoiceFormValues => ({
    id: generateUuid(),
    businessId: "",
    clientId: "",
    invoiceNumber: "",
    status: "draft",
    issueDate: "",
    dueDate: "",
    currency: "USD",
    termsId: undefined,
    paymentInstructionId: undefined,
    notes: "",
    lineItems: [blankLineItem()]
});

export default function InvoicesPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();
    const { formatCurrency, formatDate } = useFormatters();

    const { data: invoices = [], isLoading } = useInvoices();
    const invoiceMutations = useInvoiceMutations();
    const { data: businesses = [] } = useBusinesses();
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>(undefined);
    const { data: clients = [] } = useClients(selectedBusinessId);
    const { data: taxes = [] } = useTaxes();
    const { data: terms = [] } = useTerms();
    const { data: paymentInstructions = [] } = usePaymentInstructions();

    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editing, setEditing] = useState<Invoice | null>(null);
    const [targetDelete, setTargetDelete] = useState<Invoice | null>(null);
    const [form, setForm] = useState<InvoiceFormValues>(blankInvoice);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return invoices;
        return invoices.filter((inv) => JSON.stringify(inv).toLowerCase().includes(term));
    }, [invoices, search]);

    const totals = useMemo(() => {
        const subtotal = form.lineItems.reduce(
            (sum, li) => sum + Number(li.qty) * Number(li.price),
            0
        );
        const discount = form.lineItems.reduce(
            (sum, li) => sum + (li.discount ? Number(li.discount) : 0),
            0
        );
        const tax = 0; // backend authoritative; unknown calculation yet
        const grandTotal = subtotal - discount + tax;
        return { subtotal, discount, tax, grandTotal };
    }, [form.lineItems]);

    const fieldErrors = useMemo(() => {
        const parsed = invoiceSchema.safeParse(form);
        if (parsed.success) return {};
        return parsed.error.formErrors.fieldErrors;
    }, [form]);

    const lineErrors = useMemo(() => {
        return form.lineItems.map((li) => {
            const parsed = lineItemSchema.safeParse(li);
            if (parsed.success) return {};
            return parsed.error.formErrors.fieldErrors;
        });
    }, [form.lineItems]);

    const resetForm = () => {
        setForm(blankInvoice());
        setEditing(null);
    };

    const submit = () => {
        if (Object.keys(fieldErrors).length > 0 || lineErrors.some((e) => Object.keys(e).length > 0)) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Fix form errors",
                    description: "Please resolve the highlighted fields."
                })
            );
            return;
        }
        const payload: Invoice = {
            id: form.id,
            businessId: form.businessId,
            clientId: form.clientId,
            invoiceNumber: form.invoiceNumber.trim(),
            status: form.status.trim(),
            issueDate: form.issueDate,
            dueDate: form.dueDate,
            currency: form.currency.trim(),
            termsId: form.termsId,
            paymentInstructionId: form.paymentInstructionId,
            notes: form.notes?.trim() || undefined,
            lineItems: form.lineItems.map((li) => ({
                ...li,
                itemId: li.itemId || undefined,
                taxId: li.taxId || undefined,
                discount:
                    li.discount === undefined || li.discount === null || li.discount === ""
                        ? undefined
                        : Number(li.discount)
            })),
            totals: totals
        };

        if (editing) {
            invoiceMutations.update.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Invoice updated",
                            description: "Changes saved."
                        })
                    );
                    setDrawerOpen(false);
                    resetForm();
                },
                onError: (err) => notifyError(err, "Update failed")
            });
        } else {
            invoiceMutations.create.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Invoice created",
                            description: "Invoice saved."
                        })
                    );
                    setDrawerOpen(false);
                    resetForm();
                },
                onError: (err) => notifyError(err, "Create failed")
            });
        }
    };

    const openCreate = () => {
        resetForm();
        setDrawerOpen(true);
    };

    const openEdit = (invoice: Invoice) => {
        setEditing(invoice);
        setSelectedBusinessId(invoice.businessId);
        setForm({
            id: invoice.id,
            businessId: invoice.businessId,
            clientId: invoice.clientId,
            invoiceNumber: invoice.invoiceNumber,
            status: invoice.status,
            issueDate: invoice.issueDate?.slice(0, 10) ?? "",
            dueDate: invoice.dueDate?.slice(0, 10) ?? "",
            currency: invoice.currency ?? "USD",
            termsId: invoice.termsId ?? invoice.terms?.id,
            paymentInstructionId: invoice.paymentInstructionId ?? invoice.paymentInstruction?.id,
            notes: invoice.notes ?? "",
            lineItems: invoice.lineItems?.length ? invoice.lineItems : [blankLineItem()]
        });
        setDrawerOpen(true);
    };

    const businessName = (id?: string | null) =>
        businesses.find((b) => b.id === id)?.name ?? "?";
    const clientName = (id?: string | null) =>
        clients.find((c) => c.id === id)?.name ?? "?";

    const setLineItem = (idx: number, updater: (item: InvoiceLineItem) => InvoiceLineItem) => {
        setForm((f) => {
            const next = [...f.lineItems];
            next[idx] = updater(next[idx]);
            return { ...f, lineItems: next };
        });
    };

    const addLineItem = () =>
        setForm((f) => ({ ...f, lineItems: [...f.lineItems, blankLineItem()] }));
    const removeLineItem = (idx: number) =>
        setForm((f) => ({
            ...f,
            lineItems: f.lineItems.filter((_, i) => i !== idx)
        }));

    return (
        <div className="container-page page">
            <PageHeader
                title="Invoices"
                description="Create, send, and track invoices. Backend assumed; online-only."
                actions={
                    <Button size="sm" onClick={openCreate}>
                        New invoice
                    </Button>
                }
            />

            <div className="card">
                <div className="card__toolbar">
                    <Input
                        placeholder="Search invoices..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Client</th>
                                <th>Status</th>
                                <th>Issue</th>
                                <th>Due</th>
                                <th>Total</th>
                                <th>Business</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={8}>Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>No invoices found.</td>
                                </tr>
                            ) : (
                                filtered.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>{inv.invoiceNumber}</td>
                                        <td>{inv.client?.name ?? clientName(inv.clientId)}</td>
                                        <td>
                                            <Badge variant={
                                                inv.status === "paid" ? "success" :
                                                inv.status === "overdue" ? "danger" :
                                                inv.status === "draft" ? "outline" : "default"
                                            }>
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td>{formatDate(inv.issueDate)}</td>
                                        <td>{formatDate(inv.dueDate)}</td>
                                        <td>{inv.totals ? formatCurrency(inv.totals.grandTotal) : "?"}</td>
                                        <td>{inv.business?.name ?? businessName(inv.businessId)}</td>
                                        <td className="table-actions">
                                            <Button variant="ghost" size="sm" onClick={() => openEdit(inv)}>
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setTargetDelete(inv);
                                                    setConfirmOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <MasterDrawer
                open={drawerOpen}
                title={editing ? "Edit invoice" : "Create invoice"}
                subtitle="Provide invoice details. Line items required; payments are read-only."
                submitting={invoiceMutations.create.isPending || invoiceMutations.update.isPending}
                onClose={() => {
                    setDrawerOpen(false);
                    resetForm();
                }}
                onSubmit={submit}
                submitLabel={editing ? "Update" : "Create"}
            >
                <UuidField
                    value={form.id}
                    onChange={(id) => setForm((f) => ({ ...f, id }))}
                />
                {fieldErrors.id && <p className="form-error">{fieldErrors.id[0]}</p>}

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Invoice number</label>
                        <Input
                            value={form.invoiceNumber}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, invoiceNumber: e.target.value }))
                            }
                        />
                        {fieldErrors.invoiceNumber && (
                            <p className="form-error">{fieldErrors.invoiceNumber[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Status</label>
                        <select
                            className="text-input"
                            value={form.status}
                            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        >
                            {statusOptions.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.status && <p className="form-error">{fieldErrors.status[0]}</p>}
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Issue date</label>
                        <Input
                            type="date"
                            value={form.issueDate}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, issueDate: e.target.value }))
                            }
                        />
                        {fieldErrors.issueDate && (
                            <p className="form-error">{fieldErrors.issueDate[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Due date</label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                        />
                        {fieldErrors.dueDate && (
                            <p className="form-error">{fieldErrors.dueDate[0]}</p>
                        )}
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Business</label>
                        <select
                            className="text-input"
                            value={form.businessId}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSelectedBusinessId(val || undefined);
                                setForm((f) => ({ ...f, businessId: val, clientId: "" }));
                            }}
                        >
                            <option value="">Select business</option>
                            {businesses.map((b) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.businessId && (
                            <p className="form-error">{fieldErrors.businessId[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Client</label>
                        <select
                            className="text-input"
                            value={form.clientId}
                            onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}
                            disabled={!form.businessId}
                        >
                            <option value="">Select client</option>
                            {clients.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.clientId && (
                            <p className="form-error">{fieldErrors.clientId[0]}</p>
                        )}
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Currency</label>
                        <Input
                            value={form.currency}
                            onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                        />
                        {fieldErrors.currency && (
                            <p className="form-error">{fieldErrors.currency[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Terms</label>
                        <select
                            className="text-input"
                            value={form.termsId ?? ""}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, termsId: e.target.value || undefined }))
                            }
                        >
                            <option value="">None</option>
                            {terms.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.termsId && (
                            <p className="form-error">{fieldErrors.termsId[0]}</p>
                        )}
                    </div>
                </div>

                <div className="form-control">
                    <label className="form-label">Payment instruction</label>
                    <select
                        className="text-input"
                        value={form.paymentInstructionId ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                paymentInstructionId: e.target.value || undefined
                            }))
                        }
                    >
                        <option value="">None</option>
                        {paymentInstructions.map((pi) => (
                            <option key={pi.id} value={pi.id}>
                                {pi.id}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.paymentInstructionId && (
                        <p className="form-error">{fieldErrors.paymentInstructionId[0]}</p>
                    )}
                </div>

                <div className="form-control">
                    <label className="form-label">Notes</label>
                    <Textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                </div>

                <div className="form-control">
                    <label className="form-label">Line items</label>
                    <div className="card table-responsive" style={{ padding: 0 }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Discount</th>
                                    <th>Tax</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {form.lineItems.map((li, idx) => (
                                    <tr key={li.id}>
                                        <td>
                                            <Input
                                                value={li.description}
                                                onChange={(e) =>
                                                    setLineItem(idx, (item) => ({
                                                        ...item,
                                                        description: e.target.value
                                                    }))
                                                }
                                            />
                                            {lineErrors[idx]?.description && (
                                                <p className="form-error">
                                                    {lineErrors[idx].description[0]}
                                                </p>
                                            )}
                                        </td>
                                        <td>
                                            <Input
                                                type="number"
                                                value={li.qty}
                                                onChange={(e) =>
                                                    setLineItem(idx, (item) => ({
                                                        ...item,
                                                        qty: Number(e.target.value)
                                                    }))
                                                }
                                            />
                                            {lineErrors[idx]?.qty && (
                                                <p className="form-error">{lineErrors[idx].qty[0]}</p>
                                            )}
                                        </td>
                                        <td>
                                            <Input
                                                type="number"
                                                value={li.price}
                                                onChange={(e) =>
                                                    setLineItem(idx, (item) => ({
                                                        ...item,
                                                        price: Number(e.target.value)
                                                    }))
                                                }
                                            />
                                            {lineErrors[idx]?.price && (
                                                <p className="form-error">{lineErrors[idx].price[0]}</p>
                                            )}
                                        </td>
                                        <td>
                                            <Input
                                                type="number"
                                                value={li.discount ?? ""}
                                                onChange={(e) =>
                                                    setLineItem(idx, (item) => ({
                                                        ...item,
                                                        discount:
                                                            e.target.value === "" ? undefined : Number(e.target.value)
                                                    }))
                                                }
                                            />
                                            {lineErrors[idx]?.discount && (
                                                <p className="form-error">
                                                    {lineErrors[idx].discount[0]}
                                                </p>
                                            )}
                                        </td>
                                        <td>
                                            <select
                                                className="text-input"
                                                value={li.taxId ?? ""}
                                                onChange={(e) =>
                                                    setLineItem(idx, (item) => ({
                                                        ...item,
                                                        taxId: e.target.value || undefined
                                                    }))
                                                }
                                            >
                                                <option value="">None</option>
                                                {taxes.map((t) => (
                                                    <option key={t.id} value={t.id}>
                                                        {t.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {lineErrors[idx]?.taxId && (
                                                <p className="form-error">{lineErrors[idx].taxId[0]}</p>
                                            )}
                                        </td>
                                        <td className="table-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeLineItem(idx)}
                                                disabled={form.lineItems.length === 1}
                                            >
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {fieldErrors.lineItems && (
                        <p className="form-error">{fieldErrors.lineItems[0] as string}</p>
                    )}
                    <Button variant="secondary" size="sm" onClick={addLineItem} style={{ marginTop: 8 }}>
                        Add line
                    </Button>
                </div>

                <div className="card" style={{ padding: 12 }}>
                    <p className="card__title" style={{ marginBottom: 8 }}>
                        Totals (preview)
                    </p>
                    <div className="form-grid">
                        <div>
                            <p>Subtotal</p>
                            <p>{formatCurrency(totals.subtotal)}</p>
                        </div>
                        <div>
                            <p>Discount</p>
                            <p>{formatCurrency(totals.discount)}</p>
                        </div>
                        <div>
                            <p>Tax</p>
                            <p>{formatCurrency(totals.tax)}</p>
                        </div>
                        <div>
                            <p>Grand total</p>
                            <p>{formatCurrency(totals.grandTotal)}</p>
                        </div>
                    </div>
                </div>

                {editing && editing.payments?.length ? (
                    <div className="form-control">
                        <label className="form-label">Linked payments (read-only)</label>
                        <div className="card table-responsive" style={{ padding: 0 }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Payment #</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editing.payments.map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.paymentNumber ?? p.id}</td>
                                            <td>{formatCurrency(p.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="form-hint">Payment links are read-only until backend allows edits.</p>
                    </div>
                ) : null}
            </MasterDrawer>

            <DeleteConfirm
                open={confirmOpen}
                onCancel={() => {
                    setConfirmOpen(false);
                    setTargetDelete(null);
                }}
                onConfirm={() => {
                    if (!targetDelete) return;
                    invoiceMutations.remove.mutate(targetDelete.id, {
                        onSuccess: () => {
                            dispatch(
                                pushToast({
                                    level: "success",
                                    title: "Invoice deleted",
                                    description: "Invoice removed."
                                })
                            );
                            setConfirmOpen(false);
                            setTargetDelete(null);
                        },
                        onError: (err) => notifyError(err, "Delete failed")
                    });
                }}
                busy={invoiceMutations.remove.isPending}
                title="Delete invoice"
                description="This will delete the invoice. Payments remain unchanged."
            />
        </div>
    );
}
