"use client";

import { useMemo, useState } from "react";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";
import { useFormatters } from "@/hooks/useFormatters";
import { useBusinesses, useClients } from "@/hooks/useBusinessClients";
import { usePaymentInstructions } from "@/hooks/useMasterData";
import { usePayments, usePaymentMutations } from "@/hooks/usePayments";
import { paymentSchema, type Payment, type PaymentFormValues } from "@/types/dto/payments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UuidField } from "@/components/master-data/UuidField";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { PageHeader } from "@/components/layout/page-header";

const blankForm = (): PaymentFormValues => ({
    id: crypto.randomUUID(),
    businessId: "",
    clientId: "",
    paymentNumber: "",
    amount: 0,
    paymentDate: "",
    paymentInstructionId: undefined,
    referenceNumber: "",
    notes: "",
    status: "",
    customerCredit: undefined,
    invoicePayments: undefined
});

export default function PaymentsPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();
    const { formatCurrency, formatDate } = useFormatters();

    const { data: payments = [], isLoading } = usePayments();
    const paymentMutations = usePaymentMutations();
    const { data: businesses = [] } = useBusinesses();
    const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>(undefined);
    const { data: clients = [] } = useClients(selectedBusinessId);
    const { data: paymentInstructions = [] } = usePaymentInstructions();

    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editing, setEditing] = useState<Payment | null>(null);
    const [targetDelete, setTargetDelete] = useState<Payment | null>(null);
    const [form, setForm] = useState<PaymentFormValues>(blankForm);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return payments;
        return payments.filter((p) => JSON.stringify(p).toLowerCase().includes(term));
    }, [payments, search]);

    const fieldErrors = useMemo(() => {
        const parsed = paymentSchema.safeParse(form);
        if (parsed.success) return {};
        return parsed.error.formErrors.fieldErrors;
    }, [form]);

    const resetForm = () => {
        setForm(blankForm());
        setEditing(null);
    };

    const submit = () => {
        if (Object.keys(fieldErrors).length > 0) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Fix form errors",
                    description: "Please resolve the highlighted fields."
                })
            );
            return;
        }
        const payload: Payment = {
            id: form.id,
            businessId: form.businessId,
            clientId: form.clientId,
            paymentNumber: form.paymentNumber.trim(),
            amount: Number(form.amount),
            paymentDate: form.paymentDate,
            paymentInstructionId: form.paymentInstructionId,
            referenceNumber: form.referenceNumber?.trim() || undefined,
            notes: form.notes?.trim() || undefined,
            status: form.status?.trim() || undefined,
            customerCredit:
                form.customerCredit === undefined || form.customerCredit === null
                    ? undefined
                    : Number(form.customerCredit),
            invoicePayments: editing?.invoicePayments
        };

        if (editing) {
            paymentMutations.update.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Payment updated",
                            description: "Changes saved."
                        })
                    );
                    setDrawerOpen(false);
                    resetForm();
                },
                onError: (err) => notifyError(err, "Update failed")
            });
        } else {
            paymentMutations.create.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Payment created",
                            description: "Payment saved."
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

    const openEdit = (payment: Payment) => {
        setEditing(payment);
        setSelectedBusinessId(payment.businessId);
        setForm({
            id: payment.id,
            businessId: payment.businessId,
            clientId: payment.clientId,
            paymentNumber: payment.paymentNumber,
            amount: payment.amount,
            paymentDate: payment.paymentDate?.slice(0, 10) ?? "",
            paymentInstructionId: payment.paymentInstructionId ?? payment.paymentInstruction?.id,
            referenceNumber: payment.referenceNumber ?? "",
            notes: payment.notes ?? "",
            status: payment.status ?? "",
            customerCredit: payment.customerCredit ?? undefined,
            invoicePayments: payment.invoicePayments
        });
        setDrawerOpen(true);
    };

    const businessName = (id?: string | null) =>
        businesses.find((b) => b.id === id)?.name ?? "—";
    const clientName = (id?: string | null) =>
        clients.find((c) => c.id === id)?.name ?? "—";

    return (
        <div className="container-page page">
            <PageHeader
                title="Payments"
                description="Record payments and view applied invoices. Invoice links are read-only on edit."
                actions={
                    <Button size="sm" onClick={openCreate}>
                        Add payment
                    </Button>
                }
            />

            <div className="card">
                <div className="card__toolbar">
                    <Input
                        placeholder="Search payments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Payment #</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Business</th>
                                <th>Client</th>
                                <th>Invoices</th>
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
                                    <td colSpan={8}>No payments found.</td>
                                </tr>
                            ) : (
                                filtered.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>{payment.paymentNumber}</td>
                                        <td>{formatCurrency(payment.amount)}</td>
                                        <td>{formatDate(payment.paymentDate)}</td>
                                        <td>{payment.status ?? "—"}</td>
                                        <td>{payment.business?.name ?? businessName(payment.businessId)}</td>
                                        <td>{payment.client?.name ?? clientName(payment.clientId)}</td>
                                        <td>{payment.invoicePayments?.length ?? 0}</td>
                                        <td className="table-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEdit(payment)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setTargetDelete(payment);
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
                title={editing ? "Edit payment" : "Create payment"}
                subtitle={
                    editing
                        ? "Invoice links are read-only on edit per backend constraint."
                        : "Provide payment details. Invoice links are managed separately."
                }
                submitting={
                    paymentMutations.create.isPending ||
                    paymentMutations.update.isPending
                }
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

                <div className="form-control">
                    <label className="form-label">Payment number</label>
                    <Input
                        value={form.paymentNumber}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, paymentNumber: e.target.value }))
                        }
                    />
                    {fieldErrors.paymentNumber && (
                        <p className="form-error">{fieldErrors.paymentNumber[0]}</p>
                    )}
                </div>

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Amount</label>
                        <Input
                            type="number"
                            value={form.amount}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, amount: e.target.value }))
                            }
                        />
                        {fieldErrors.amount && (
                            <p className="form-error">{fieldErrors.amount[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Payment date</label>
                        <Input
                            type="date"
                            value={form.paymentDate}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, paymentDate: e.target.value }))
                            }
                        />
                        {fieldErrors.paymentDate && (
                            <p className="form-error">{fieldErrors.paymentDate[0]}</p>
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
                            onChange={(e) =>
                                setForm((f) => ({ ...f, clientId: e.target.value }))
                            }
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

                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Reference #</label>
                        <Input
                            value={form.referenceNumber}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, referenceNumber: e.target.value }))
                            }
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Status</label>
                        <Input
                            value={form.status}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, status: e.target.value }))
                            }
                        />
                    </div>
                </div>

                <div className="form-control">
                    <label className="form-label">Customer credit (optional)</label>
                    <Input
                        type="number"
                        value={form.customerCredit ?? ""}
                        onChange={(e) =>
                            setForm((f) => ({
                                ...f,
                                customerCredit:
                                    e.target.value === "" ? undefined : Number(e.target.value)
                            }))
                        }
                    />
                    {fieldErrors.customerCredit && (
                        <p className="form-error">{fieldErrors.customerCredit[0]}</p>
                    )}
                </div>

                <div className="form-control">
                    <label className="form-label">Notes</label>
                    <Textarea
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                </div>

                {editing && editing.invoicePayments?.length ? (
                    <div className="form-control">
                        <label className="form-label">Invoice payments (read-only)</label>
                        <div className="card table-responsive" style={{ padding: 0 }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Invoice</th>
                                        <th>Amount applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {editing.invoicePayments.map((ip) => (
                                        <tr key={ip.id}>
                                            <td>{ip.invoiceId}</td>
                                            <td>{formatCurrency(ip.amountApplied)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="form-hint">
                            Invoice links cannot be edited here. Backend blocks invoice link changes on update.
                        </p>
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
                    paymentMutations.remove.mutate(targetDelete.id, {
                        onSuccess: () => {
                            dispatch(
                                pushToast({
                                    level: "success",
                                    title: "Payment deleted",
                                    description: "Payment removed."
                                })
                            );
                            setConfirmOpen(false);
                            setTargetDelete(null);
                        },
                        onError: (err) => notifyError(err, "Delete failed")
                    });
                }}
                busy={paymentMutations.remove.isPending}
                title="Delete payment"
                description="This will delete the payment. Invoice links remain unchanged."
            />
        </div>
    );
}
