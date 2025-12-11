"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { MasterTable } from "@/components/master-data/MasterTable";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { UuidField } from "@/components/master-data/UuidField";
import { Input } from "@/components/ui/input";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";
import { usePaymentInstructions } from "@/hooks/useMasterData";
import {
    createPaymentInstruction,
    deletePaymentInstruction,
    updatePaymentInstruction
} from "@/services/masterData/paymentInstructions";
import { isValidUuid, type PaymentInstructionDto } from "@/types/dto/masterData";

type FieldType = "TEXT" | "EMAIL" | "PHONE" | "DATE";
type PaymentField = {
    key: string;
    label: string;
    type: FieldType;
    required: boolean;
};

const paymentMethods = [
    "CASH",
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "PAYPAL",
    "STRIPE",
    "CHEQUE",
    "MOBILE_WALLET",
    "CRYPTO",
    "OTHER"
] as const;

function getFieldsForMethod(method: string): PaymentField[] {
    switch (method) {
        case "CASH":
            return [{ key: "notes", label: "Notes (Optional)", type: "TEXT", required: false }];
        case "BANK_TRANSFER":
            return [
                { key: "bank_name", label: "Bank Name", type: "TEXT", required: true },
                { key: "account_no", label: "Account Number", type: "TEXT", required: true },
                { key: "account_holder", label: "Account Holder Name", type: "TEXT", required: true },
                { key: "swift", label: "SWIFT Code", type: "TEXT", required: false },
                { key: "reference", label: "Reference", type: "TEXT", required: false },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "CREDIT_CARD":
            return [
                { key: "card_type", label: "Card Type (VISA, MASTERCARD)", type: "TEXT", required: true },
                { key: "last4", label: "Last 4 Digits", type: "TEXT", required: true },
                { key: "transaction_id", label: "Transaction ID", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "PAYPAL":
            return [
                { key: "paypal_email", label: "PayPal Email", type: "EMAIL", required: true },
                { key: "transaction_id", label: "Transaction ID", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "STRIPE":
            return [
                { key: "stripe_email", label: "Stripe Email", type: "EMAIL", required: true },
                { key: "payment_intent_id", label: "Payment Intent ID", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "CHEQUE":
            return [
                { key: "bank_name", label: "Bank Name", type: "TEXT", required: true },
                { key: "cheque_no", label: "Cheque Number", type: "TEXT", required: true },
                { key: "date", label: "Date", type: "DATE", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "MOBILE_WALLET":
            return [
                { key: "wallet_name", label: "Wallet Name", type: "TEXT", required: true },
                { key: "wallet_number", label: "Wallet Number", type: "PHONE", required: true },
                { key: "transaction_id", label: "Transaction ID", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "CRYPTO":
            return [
                { key: "crypto_currency", label: "Cryptocurrency", type: "TEXT", required: true },
                { key: "wallet_address", label: "Wallet Address", type: "TEXT", required: true },
                { key: "transaction_hash", label: "Transaction Hash", type: "TEXT", required: false },
                { key: "network", label: "Network", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        case "OTHER":
            return [
                { key: "description", label: "Payment Method Description", type: "TEXT", required: true },
                { key: "notes", label: "Notes", type: "TEXT", required: false }
            ];
        default:
            return [];
    }
}

type PiForm = {
    id: string;
    method: string;
    values: Record<string, string>;
    currentId?: string;
};

const blankPi = (): PiForm => ({
    id: crypto.randomUUID(),
    method: paymentMethods[0],
    values: {}
});

export function PaymentInstructionsSection() {
    const dispatch = useAppDispatch();
    const qc = useQueryClient();
    const { notifyError } = useApiError();
    const { data = [], isLoading } = usePaymentInstructions();
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [form, setForm] = useState<PiForm>(blankPi);
    const [editing, setEditing] = useState<PaymentInstructionDto | null>(null);
    const [targetDelete, setTargetDelete] = useState<PaymentInstructionDto | null>(null);

    const formErrors = useMemo(() => {
        const errs: Record<string, string> = {};
        if (!isValidUuid(form.id)) errs.id = "Enter a valid UUID";
        const fields = getFieldsForMethod(form.method);
        fields.forEach((f) => {
            if (f.required && !form.values[f.key]?.trim()) {
                errs[f.key] = `${f.label} is required`;
            }
            if (f.type === "EMAIL" && form.values[f.key]) {
                const email = form.values[f.key];
                if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email)) {
                    errs[f.key] = "Enter a valid email";
                }
            }
            if (f.type === "PHONE" && form.values[f.key]) {
                const phone = form.values[f.key];
                if (!/^[0-9+\\-\\s]{6,20}$/.test(phone)) {
                    errs[f.key] = "Enter a valid phone number";
                }
            }
        });
        return errs;
    }, [form]);

    const buildPayload = (payload: PiForm) => ({
        id: payload.id,
        fieldsJson: JSON.stringify({
            method: payload.method,
            values: payload.values
        })
    });

    const createMutation = useMutation({
        mutationFn: (payload: PiForm) => createPaymentInstruction(buildPayload(payload)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "payment-instructions"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Instruction created",
                    description: "Payment instruction saved successfully."
                })
            );
            setDrawerOpen(false);
            setForm(blankPi());
        },
        onError: (err) => notifyError(err, "Create failed")
    });

    const updateMutation = useMutation({
        mutationFn: (payload: PiForm) => {
            if (!payload.currentId) throw new Error("currentId missing");
            return updatePaymentInstruction(payload.currentId, buildPayload(payload));
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "payment-instructions"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Instruction updated",
                    description: "A new version was created with a new ID."
                })
            );
            setDrawerOpen(false);
            setEditing(null);
            setForm(blankPi());
        },
        onError: (err) => notifyError(err, "Update failed")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deletePaymentInstruction(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "payment-instructions"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Instruction deleted",
                    description: "Instruction soft-deleted successfully."
                })
            );
            setConfirmOpen(false);
            setTargetDelete(null);
        },
        onError: (err) => notifyError(err, "Delete failed")
    });

    const openCreate = () => {
        setEditing(null);
        setForm(blankPi());
        setDrawerOpen(true);
    };

    const openEdit = (row: PaymentInstructionDto) => {
        setEditing(row);
        let method = paymentMethods[0];
        let values: Record<string, string> = {};
        try {
            const parsed = JSON.parse(row.fieldsJson || "{}");
            method = typeof parsed.method === "string" ? parsed.method : method;
            values =
                parsed && typeof parsed.values === "object" && parsed.values !== null
                    ? parsed.values
                    : {};
        } catch (_err) {
            // leave defaults
        }
        setForm({
            id: crypto.randomUUID(),
            method,
            values,
            currentId: row.id
        });
        setDrawerOpen(true);
    };

    const submit = () => {
        if (Object.keys(formErrors).length > 0) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Fix form errors",
                    description: "Please resolve the highlighted fields."
                })
            );
            return;
        }
        if (editing) {
            updateMutation.mutate(form);
        } else {
            createMutation.mutate(form);
        }
    };

    return (
        <div className="container-page page">
            <h2>Payment Instructions</h2>
            <p className="page-subtitle">
                Manage payment instructions. Choose a method, fill required fields, we build JSON for the backend. Updates create a new record with a new UUID (backend rule).
            </p>

            <MasterTable<PaymentInstructionDto>
                title="Payment Instructions"
                data={data}
                loading={isLoading}
                search={search}
                onSearch={setSearch}
                onCreate={openCreate}
                onEdit={openEdit}
                onDelete={(row) => {
                    setTargetDelete(row);
                    setConfirmOpen(true);
                }}
                getKey={(row) => row.id}
                columns={[
                    { key: "id", header: "ID" },
                    { key: "method", header: "Method" },
                    { key: "fieldsJson", header: "fieldsJson" }
                ]}
            />

            <MasterDrawer
                open={drawerOpen}
                title={editing ? "Edit instruction" : "Create instruction"}
                subtitle={
                    editing
                        ? "Editing will create a new version with a new UUID. The previous record is soft-deleted."
                        : "Provide ID, choose method, and fill the required fields."
                }
                submitting={createMutation.isPending || updateMutation.isPending}
                onClose={() => {
                    setDrawerOpen(false);
                    setEditing(null);
                }}
                onSubmit={submit}
                submitLabel={editing ? "Update" : "Create"}
            >
                <UuidField
                    value={form.id}
                    onChange={(id) => setForm((f) => ({ ...f, id }))}
                />
                {formErrors.id && <p className="form-error">{formErrors.id}</p>}

                <div className="form-control">
                    <label className="form-label">Payment method</label>
                    <select
                        className="text-input"
                        value={form.method}
                        onChange={(e) => {
                            const method = e.target.value;
                            const fields = getFieldsForMethod(method);
                            const nextValues: Record<string, string> = {};
                            fields.forEach((f) => {
                                nextValues[f.key] = form.values[f.key] ?? "";
                            });
                            setForm((f) => ({
                                ...f,
                                method,
                                values: nextValues
                            }));
                        }}
                    >
                        {paymentMethods.map((m) => (
                            <option key={m} value={m}>
                                {m}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-grid">
                    {getFieldsForMethod(form.method).map((field) => (
                        <div className="form-control" key={field.key}>
                            <label className="form-label">
                                {field.label} {field.required ? "*" : ""}
                            </label>
                            <Input
                                type={
                                    field.type === "EMAIL"
                                        ? "email"
                                        : field.type === "PHONE"
                                          ? "tel"
                                          : field.type === "DATE"
                                            ? "date"
                                            : "text"
                                }
                                value={form.values[field.key] ?? ""}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        values: { ...f.values, [field.key]: e.target.value }
                                    }))
                                }
                            />
                            {formErrors[field.key] && (
                                <p className="form-error">{formErrors[field.key]}</p>
                            )}
                        </div>
                    ))}
                </div>

                {editing && (
                    <p className="form-hint">
                        Current record ID: <code>{editing.id}</code>
                    </p>
                )}
            </MasterDrawer>

            <DeleteConfirm
                open={confirmOpen}
                onCancel={() => {
                    setConfirmOpen(false);
                    setTargetDelete(null);
                }}
                onConfirm={() => targetDelete && deleteMutation.mutate(targetDelete.id)}
                busy={deleteMutation.isPending}
                title="Delete instruction"
                description="This will soft-delete the instruction. You can recreate it later."
            />
        </div>
    );
}
