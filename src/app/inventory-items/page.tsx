"use client";

import { useMemo, useState } from "react";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { UuidField } from "@/components/master-data/UuidField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";
import { useFormatters } from "@/hooks/useFormatters";
import { useInventoryItems, useInventoryMutations } from "@/hooks/useInventoryItems";
import { useTaxes, useUnits, useCategories } from "@/hooks/useMasterData";
import { inventoryItemSchema, type InventoryItem } from "@/types/dto/inventory";

type InventoryForm = {
    id: string;
    name: string;
    description?: string;
    unitPrice: number | string;
    netPrice: number | string;
    discount?: number | string;
    discountType?: string;
    taxId?: string;
    unitTypeId?: string;
    itemCategoryId?: string;
};

const blankForm = (): InventoryForm => ({
    id: crypto.randomUUID(),
    name: "",
    description: "",
    unitPrice: "",
    netPrice: "",
    discount: "",
    discountType: "",
    taxId: "",
    unitTypeId: "",
    itemCategoryId: ""
});

export default function InventoryItemsPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();
    const { formatCurrency } = useFormatters();

    const { data: items = [], isLoading } = useInventoryItems();
    const mutations = useInventoryMutations();

    const { data: taxes = [] } = useTaxes();
    const { data: units = [] } = useUnits();
    const { data: categories = [] } = useCategories();

    const [search, setSearch] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [editing, setEditing] = useState<InventoryItem | null>(null);
    const [targetDelete, setTargetDelete] = useState<InventoryItem | null>(null);
    const [form, setForm] = useState<InventoryForm>(blankForm);

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return items;
        return items.filter((item) =>
            JSON.stringify(item).toLowerCase().includes(term)
        );
    }, [items, search]);

    const fieldErrors = useMemo(() => {
        const parsed = inventoryItemSchema.safeParse({
            ...form,
            discount: form.discount === "" ? undefined : form.discount,
            discountType: form.discountType || undefined
        });
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
        const payload: InventoryItem = {
            id: form.id,
            name: form.name.trim(),
            description: form.description?.trim() || undefined,
            unitPrice: Number(form.unitPrice),
            netPrice: Number(form.netPrice),
            discount:
                form.discount === "" || form.discount === undefined
                    ? undefined
                    : Number(form.discount),
            discountType: form.discountType?.trim() || undefined,
            taxId: form.taxId?.trim() || undefined,
            unitTypeId: form.unitTypeId?.trim() || undefined,
            itemCategoryId: form.itemCategoryId?.trim() || undefined
        };

        if (editing) {
            mutations.update.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Item updated",
                            description: "Changes saved."
                        })
                    );
                    setDrawerOpen(false);
                    resetForm();
                },
                onError: (err) => notifyError(err, "Update failed")
            });
        } else {
            mutations.create.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Item created",
                            description: "Inventory item saved."
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

    const openEdit = (item: InventoryItem) => {
        setEditing(item);
        setForm({
            id: item.id,
            name: item.name,
            description: item.description ?? "",
            unitPrice: item.unitPrice,
            netPrice: item.netPrice,
            discount: item.discount ?? "",
            discountType: item.discountType ?? "",
            taxId: item.taxId ?? "",
            unitTypeId: item.unitTypeId ?? "",
            itemCategoryId: item.itemCategoryId ?? ""
        });
        setDrawerOpen(true);
    };

    const taxName = (item: InventoryItem) =>
        item.tax?.name ??
        taxes.find((t) => t.id === (item.taxId ?? item.tax?.id))?.name ??
        "—";
    const unitName = (item: InventoryItem) =>
        item.unitType?.name ??
        units.find((u) => u.id === (item.unitTypeId ?? item.unitType?.id))?.name ??
        "—";
    const categoryName = (item: InventoryItem) =>
        item.itemCategory?.name ??
        categories.find((c) => c.id === (item.itemCategoryId ?? item.itemCategory?.id))
            ?.name ??
        "—";

    return (
        <div className="container-page page">
            <h1>Inventory Items</h1>
            <p className="page-subtitle">
                Manage items with pricing and master data links. Updates are online-only and persist immediately.
            </p>

            <div className="card">
                <div className="card__header">
                    <div>
                        <h3 className="card__title">Items</h3>
                        <p className="card__description">
                            Search, create, edit, or delete inventory items. Uses backend IDs (no offline cache).
                        </p>
                    </div>
                    <Button onClick={openCreate}>Add item</Button>
                </div>
                <div className="card__toolbar">
                    <Input
                        placeholder="Search items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Unit price</th>
                                <th>Net price</th>
                                <th>Discount</th>
                                <th>Tax</th>
                                <th>Unit</th>
                                <th>Category</th>
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
                                    <td colSpan={8}>No items found.</td>
                                </tr>
                            ) : (
                                filtered.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{formatCurrency(item.unitPrice)}</td>
                                        <td>{formatCurrency(item.netPrice)}</td>
                                        <td>
                                            {item.discount !== null && item.discount !== undefined
                                                ? `${formatCurrency(item.discount)} ${item.discountType ?? ""}`
                                                : "—"}
                                        </td>
                                        <td>{taxName(item)}</td>
                                        <td>{unitName(item)}</td>
                                        <td>{categoryName(item)}</td>
                                        <td className="table-actions">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEdit(item)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setTargetDelete(item);
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
                title={editing ? "Edit item" : "Create item"}
                subtitle="Provide item details. Related IDs must be valid UUIDs."
                submitting={
                    mutations.create.isPending ||
                    mutations.update.isPending
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
                    <label className="form-label">Name</label>
                    <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {fieldErrors.name && <p className="form-error">{fieldErrors.name[0]}</p>}
                </div>
                <div className="form-control">
                    <label className="form-label">Description</label>
                    <Textarea
                        value={form.description}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, description: e.target.value }))
                        }
                    />
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Unit price</label>
                        <Input
                            type="number"
                            value={form.unitPrice}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, unitPrice: e.target.value }))
                            }
                        />
                        {fieldErrors.unitPrice && (
                            <p className="form-error">{fieldErrors.unitPrice[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Net price</label>
                        <Input
                            type="number"
                            value={form.netPrice}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, netPrice: e.target.value }))
                            }
                        />
                        {fieldErrors.netPrice && (
                            <p className="form-error">{fieldErrors.netPrice[0]}</p>
                        )}
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Discount (optional)</label>
                        <Input
                            type="number"
                            value={form.discount}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, discount: e.target.value }))
                            }
                        />
                        {fieldErrors.discount && (
                            <p className="form-error">{fieldErrors.discount[0]}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Discount type</label>
                        <select
                            className="text-input"
                            value={form.discountType}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, discountType: e.target.value }))
                            }
                        >
                            <option value="">Select type (optional)</option>
                            <option value="PERCENT">PERCENT</option>
                            <option value="FLAT">FLAT</option>
                        </select>
                        {fieldErrors.discountType && (
                            <p className="form-error">{fieldErrors.discountType[0]}</p>
                        )}
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Tax</label>
                        <select
                            className="text-input"
                            value={form.taxId}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, taxId: e.target.value }))
                            }
                        >
                            <option value="">None</option>
                            {taxes.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.taxId && <p className="form-error">{fieldErrors.taxId[0]}</p>}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Unit</label>
                        <select
                            className="text-input"
                            value={form.unitTypeId}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, unitTypeId: e.target.value }))
                            }
                        >
                            <option value="">None</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.unitTypeId && (
                            <p className="form-error">{fieldErrors.unitTypeId[0]}</p>
                        )}
                    </div>
                </div>
                <div className="form-control">
                    <label className="form-label">Category</label>
                    <select
                        className="text-input"
                        value={form.itemCategoryId}
                        onChange={(e) =>
                            setForm((f) => ({ ...f, itemCategoryId: e.target.value }))
                        }
                    >
                        <option value="">None</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    {fieldErrors.itemCategoryId && (
                        <p className="form-error">{fieldErrors.itemCategoryId[0]}</p>
                    )}
                </div>
            </MasterDrawer>

            <DeleteConfirm
                open={confirmOpen}
                onCancel={() => {
                    setConfirmOpen(false);
                    setTargetDelete(null);
                }}
                onConfirm={() => {
                    if (!targetDelete) return;
                    mutations.remove.mutate(targetDelete.id, {
                        onSuccess: () => {
                            dispatch(
                                pushToast({
                                    level: "success",
                                    title: "Item deleted",
                                    description: "Inventory item removed."
                                })
                            );
                            setConfirmOpen(false);
                            setTargetDelete(null);
                        },
                        onError: (err) => notifyError(err, "Delete failed")
                    });
                }}
                busy={mutations.remove.isPending}
                title="Delete item"
                description="This will delete the inventory item."
            />
        </div>
    );
}
