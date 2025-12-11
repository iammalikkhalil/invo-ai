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
import { useUnits } from "@/hooks/useMasterData";
import { createUnit, deleteUnit, updateUnit } from "@/services/masterData/units";
import { isValidUuid, type UnitDto } from "@/types/dto/masterData";

type UnitForm = {
    id: string;
    name: string;
    currentId?: string;
};

const blankUnit = (): UnitForm => ({
    id: crypto.randomUUID(),
    name: ""
});

export function UnitsSection() {
    const dispatch = useAppDispatch();
    const qc = useQueryClient();
    const { notifyError } = useApiError();
    const { data = [], isLoading } = useUnits();
    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [form, setForm] = useState<UnitForm>(blankUnit);
    const [editing, setEditing] = useState<UnitDto | null>(null);
    const [targetDelete, setTargetDelete] = useState<UnitDto | null>(null);

    const formErrors = useMemo(() => {
        const errs: Record<string, string> = {};
        const name = form.name.trim();
        if (!name) errs.name = "Name is required";
        else if (name.length < 2) errs.name = "Name must be at least 2 characters";
        if (!isValidUuid(form.id)) errs.id = "Enter a valid UUID";
        return errs;
    }, [form]);

    const createMutation = useMutation({
        mutationFn: createUnit,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "units"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Unit created",
                    description: "Unit saved successfully."
                })
            );
            setDrawerOpen(false);
            setForm(blankUnit());
        },
        onError: (err) => notifyError(err, "Create failed")
    });

    const updateMutation = useMutation({
        mutationFn: (payload: UnitForm) => {
            if (!payload.currentId) throw new Error("currentId missing");
            return updateUnit(payload.currentId, { id: payload.id, name: payload.name });
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "units"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Unit updated",
                    description: "A new version was created with a new ID."
                })
            );
            setDrawerOpen(false);
            setEditing(null);
            setForm(blankUnit());
        },
        onError: (err) => notifyError(err, "Update failed")
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteUnit(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["master-data", "units"] });
            dispatch(
                pushToast({
                    level: "success",
                    title: "Unit deleted",
                    description: "Unit soft-deleted successfully."
                })
            );
            setConfirmOpen(false);
            setTargetDelete(null);
        },
        onError: (err) => notifyError(err, "Delete failed")
    });

    const openCreate = () => {
        setEditing(null);
        setForm(blankUnit());
        setDrawerOpen(true);
    };

    const openEdit = (row: UnitDto) => {
        setEditing(row);
        setForm({
            id: crypto.randomUUID(),
            name: row.name,
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
            createMutation.mutate({ id: form.id, name: form.name });
        }
    };

    return (
        <div className="container-page page">
            <h2>Units</h2>
            <p className="page-subtitle">
                Manage unit master data. Updates create a new record with a new UUID (backend rule).
            </p>

            <MasterTable<UnitDto>
                title="Units"
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
                    { key: "name", header: "Name" }
                ]}
            />

            <MasterDrawer
                open={drawerOpen}
                title={editing ? "Edit unit" : "Create unit"}
                subtitle={
                    editing
                        ? "Editing will create a new version with a new UUID. The previous record is soft-deleted."
                        : "Provide ID and name."
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
                    <label className="form-label">Name</label>
                    <Input
                        value={form.name}
                        required
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {formErrors.name && <p className="form-error">{formErrors.name}</p>}
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
                title="Delete unit"
                description="This will soft-delete the unit. You can recreate it later."
            />
        </div>
    );
}
