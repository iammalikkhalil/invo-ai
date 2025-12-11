"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch } from "@/store";
import { MasterTable } from "@/components/master-data/MasterTable";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { UuidField } from "@/components/master-data/UuidField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";
import { useTerms } from "@/hooks/useMasterData";
import { createTerms, deleteTerms, updateTerms } from "@/services/masterData/terms";
import { isValidUuid, type TermsDto } from "@/types/dto/masterData";

type TermsForm = {
    id: string;
    title: string;
    description?: string;
    currentId?: string;
};

const blankTerms = (): TermsForm => ({
    id: crypto.randomUUID(),
    title: "",
    description: ""
});

export function TermsSection() {
    const dispatch = useAppDispatch();
    const qc = useQueryClient();
    const { notifyError } = useApiError();
    const { data = [], isLoading } = useTerms();
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [form, setForm] = useState<TermsForm>(blankTerms);
    const [editing, setEditing] = useState<TermsDto | null>(null);
    const [targetDelete, setTargetDelete] = useState<TermsDto | null>(null);

    const formErrors = useMemo(() => {
        const errs: Record<string, string> = {};
        const title = form.title.trim();
        if (!title) errs.title = "Title is required";
        else if (title.length < 2) errs.title = "Title must be at least 2 characters";
        if (!isValidUuid(form.id)) errs.id = "Enter a valid UUID";
        return errs;
    }, [form]);

    const createMutation = useMutation({
        mutationFn: createTerms,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "terms"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Terms created",
                    description: "Terms saved successfully."
                })
            );
            setDrawerOpen(false);
            setForm(blankTerms());
        },
        onError: (err) => notifyError(err, "Create failed")
    });

    const updateMutation = useMutation({
        mutationFn: (payload: TermsForm) => {
            if (!payload.currentId) throw new Error("currentId missing");
            return updateTerms(payload.currentId, {
                id: payload.id,
                title: payload.title,
                description: payload.description
            });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "terms"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Terms updated",
                    description: "A new version was created with a new ID."
                })
            );
            setDrawerOpen(false);
            setEditing(null);
            setForm(blankTerms());
        },
        onError: (err) => notifyError(err, "Update failed")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteTerms(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "terms"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Terms deleted",
                    description: "Terms soft-deleted successfully."
                })
            );
            setConfirmOpen(false);
            setTargetDelete(null);
        },
        onError: (err) => notifyError(err, "Delete failed")
    });

    const openCreate = () => {
        setEditing(null);
        setForm(blankTerms());
        setDrawerOpen(true);
    };

    const openEdit = (row: TermsDto) => {
        setEditing(row);
        setForm({
            id: crypto.randomUUID(),
            title: row.title,
            description: row.description ?? "",
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
            createMutation.mutate({
                id: form.id,
                title: form.title,
                description: form.description
            });
        }
    };

    return (
        <div className="container-page page">
            <h2>Terms</h2>
            <p className="page-subtitle">
                Manage payment terms. Updates create a new record with a new UUID (backend rule).
            </p>

            <MasterTable<TermsDto>
                title="Terms"
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
                    { key: "title", header: "Title" },
                    { key: "description", header: "Description", render: (row) => row.description || "—" }
                ]}
            />

            <MasterDrawer
                open={drawerOpen}
                title={editing ? "Edit terms" : "Create terms"}
                subtitle={
                    editing
                        ? "Editing will create a new version with a new UUID. The previous record is soft-deleted."
                        : "Provide ID and title; description is optional."
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
                    label="ID (UUID)"
                />
                {formErrors.id && <p className="form-error">{formErrors.id}</p>}
                <div className="form-control">
                    <label className="form-label">Title</label>
                    <Input
                        value={form.title}
                        required
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                    {formErrors.title && <p className="form-error">{formErrors.title}</p>}
                </div>
                <div className="form-control">
                    <label className="form-label">Description (optional)</label>
                    <Textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                        }
                    />
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
                title="Delete terms"
                description="This will soft-delete the terms. You can recreate them later."
            />
        </div>
    );
}
