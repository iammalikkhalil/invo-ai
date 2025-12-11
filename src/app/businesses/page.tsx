"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { MasterTable } from "@/components/master-data/MasterTable";
import { MasterDrawer } from "@/components/master-data/MasterDrawer";
import { DeleteConfirm } from "@/components/master-data/DeleteConfirm";
import { UuidField } from "@/components/master-data/UuidField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBusinesses, useBusinessMutations, useClientMutations, useClients } from "@/hooks/useBusinessClients";
import { businessSchema, clientSchema, type Business, type Client } from "@/types/dto/business";
import { useAppDispatch } from "@/store";
import { pushToast } from "@/store/slices/uiSlice";
import { useApiError } from "@/hooks/useApiError";

const LS_BUSINESS_KEY = "selected_business_id";

export default function BusinessClientsPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();
    const { data: businesses = [], isLoading: loadingBusinesses } = useBusinesses();
    const bizMut = useBusinessMutations();

    const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>(undefined);
    const [bizSearch, setBizSearch] = useState("");
    const [cliSearch, setCliSearch] = useState("");

    const [bizDrawerOpen, setBizDrawerOpen] = useState(false);
    const [bizEditing, setBizEditing] = useState<Business | null>(null);
    const [bizForm, setBizForm] = useState<Partial<Business>>({
        id: crypto.randomUUID(),
        name: ""
    });
    const [bizDelete, setBizDelete] = useState<Business | null>(null);

    // Hydrate selected business from localStorage or first item
    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(LS_BUSINESS_KEY) : null;
        if (saved) setSelectedBusinessId(saved);
    }, []);
    useEffect(() => {
        if (!selectedBusinessId && businesses.length > 0) {
            setSelectedBusinessId(businesses[0].id);
        }
    }, [selectedBusinessId, businesses]);
    useEffect(() => {
        if (selectedBusinessId && typeof window !== "undefined") {
            localStorage.setItem(LS_BUSINESS_KEY, selectedBusinessId);
        }
    }, [selectedBusinessId]);

    const { data: clients = [], isLoading: loadingClients } = useClients(selectedBusinessId);
    const cliMut = useClientMutations();

    // --- Business form validation ---
    const bizErrors = useMemo(() => {
        const parsed = businessSchema.safeParse({
            ...bizForm,
            logo: bizForm.logo
        });
        if (parsed.success) return {};
        return parsed.error.formErrors.fieldErrors;
    }, [bizForm]);

    // --- Client state ---
    const [cliDrawerOpen, setCliDrawerOpen] = useState(false);
    const [cliEditing, setCliEditing] = useState<Client | null>(null);
    const [cliForm, setCliForm] = useState<Partial<Client>>({
        id: crypto.randomUUID(),
        name: "",
        businessId: selectedBusinessId
    });
    useEffect(() => {
        setCliForm((f) => ({ ...f, businessId: selectedBusinessId }));
    }, [selectedBusinessId]);

    const cliErrors = useMemo(() => {
        const parsed = clientSchema.safeParse({
            ...cliForm,
            businessId: cliForm.businessId,
            rating: cliForm.rating,
            openingBalance: cliForm.openingBalance,
            credit: cliForm.credit
        });
        if (parsed.success) return {};
        return parsed.error.formErrors.fieldErrors;
    }, [cliForm]);

    // --- Business actions ---
    const onSubmitBusiness = () => {
        if (Object.keys(bizErrors).length > 0) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Fix business form",
                    description: "Please resolve the highlighted fields."
                })
            );
            return;
        }
        const payload = bizForm as Business;
        if (bizEditing) {
            bizMut.update.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Business updated",
                            description: "Changes saved."
                        })
                    );
                    setBizDrawerOpen(false);
                    setBizEditing(null);
                },
                onError: (err) => notifyError(err, "Update failed")
            });
        } else {
            bizMut.create.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Business created",
                            description: "Business saved."
                        })
                    );
                    setBizDrawerOpen(false);
                    setBizForm({ id: crypto.randomUUID(), name: "" });
                },
                onError: (err) => notifyError(err, "Create failed")
            });
        }
    };

    // --- Client actions ---
    const onSubmitClient = () => {
        if (Object.keys(cliErrors).length > 0) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Fix client form",
                    description: "Please resolve the highlighted fields."
                })
            );
            return;
        }
        if (!selectedBusinessId) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Select business",
                    description: "Choose a business before adding clients."
                })
            );
            return;
        }
        const payload: Client = {
            ...(cliForm as Client),
            businessId: selectedBusinessId,
            rating: cliForm.rating ?? undefined,
            openingBalance: cliForm.openingBalance ?? undefined,
            credit: cliForm.credit ?? undefined
        };
        if (cliEditing) {
            cliMut.update.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Client updated",
                            description: "Changes saved."
                        })
                    );
                    setCliDrawerOpen(false);
                    setCliEditing(null);
                },
                onError: (err) => notifyError(err, "Update failed")
            });
        } else {
            cliMut.create.mutate(payload, {
                onSuccess: () => {
                    dispatch(
                        pushToast({
                            level: "success",
                            title: "Client created",
                            description: "Client saved."
                        })
                    );
                    setCliDrawerOpen(false);
                    setCliForm({ id: crypto.randomUUID(), name: "", businessId: selectedBusinessId });
                },
                onError: (err) => notifyError(err, "Create failed")
            });
        }
    };

    const openClientCreate = () => {
        if (!selectedBusinessId) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Select business",
                    description: "Choose a business first."
                })
            );
            return;
        }
        setCliEditing(null);
        setCliForm({
            id: crypto.randomUUID(),
            name: "",
            businessId: selectedBusinessId
        });
        setCliDrawerOpen(true);
    };

    return (
        <div className="container-page page">
            <h1>Business & Clients</h1>
            <p className="page-subtitle">
                Manage businesses and their clients. Web is online-only; updates refresh from the API.
            </p>

            <div className="page-section">
                <MasterTable<Business>
                    title="Businesses"
                    data={businesses}
                    loading={loadingBusinesses}
                    search={bizSearch}
                    onSearch={setBizSearch}
                    onCreate={() => {
                        setBizEditing(null);
                        setBizForm({ id: crypto.randomUUID(), name: "" });
                        setBizDrawerOpen(true);
                    }}
                    onEdit={(row) => {
                        setBizEditing(row);
                        setBizForm(row);
                        setBizDrawerOpen(true);
                    }}
                    onDelete={(row) => setBizDelete(row)}
                    getKey={(row) => row.id}
                    columns={[
                        { key: "name", header: "Name" },
                        { key: "emailAddress", header: "Email" },
                        { key: "phone", header: "Phone" },
                        { key: "city", header: "City" },
                        { key: "country", header: "Country" }
                    ]}
                />
            </div>

            <div className="page-section">
                <div className="card">
                    <div className="card__header">
                        <div>
                            <h3 className="card__title">Clients</h3>
                            <p className="card__description">
                                Clients are scoped by the selected business. Pick a business to view or manage its clients.
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div className="form-control" style={{ minWidth: 220, margin: 0 }}>
                                <label className="form-label">Current business</label>
                                <select
                                    className="text-input"
                                    value={selectedBusinessId ?? ""}
                                    onChange={(e) =>
                                        setSelectedBusinessId(e.target.value || undefined)
                                    }
                                >
                                    <option value="">Select a business</option>
                                    {businesses.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button style={{ alignSelf: "flex-end" }} onClick={openClientCreate}>Add client</Button>
                        </div>
                    </div>
                    <div className="card__toolbar">
                        <Input
                            placeholder="Search clients..."
                            value={cliSearch}
                            onChange={(e) => setCliSearch(e.target.value)}
                        />
                    </div>
                    <div className="table-responsive">
                        <MasterTable<Client>
                            title=""
                            data={clients}
                            loading={loadingClients}
                            search={cliSearch}
                            onSearch={setCliSearch}
                            onCreate={undefined}
                            onEdit={(row) => {
                                setCliEditing(row);
                                setCliForm(row);
                                setCliDrawerOpen(true);
                            }}
                            onDelete={(row) =>
                                cliMut.remove.mutate(
                                    { id: row.id, businessId: row.businessId },
                                    {
                                        onSuccess: () =>
                                            dispatch(
                                                pushToast({
                                                    level: "success",
                                                    title: "Client deleted",
                                                    description: "Client removed."
                                                })
                                            ),
                                        onError: (err) => notifyError(err, "Delete failed")
                                    }
                                )
                            }
                            getKey={(row) => row.id}
                            columns={[
                                { key: "name", header: "Name" },
                                { key: "emailAddress", header: "Email" },
                                { key: "phone", header: "Phone" },
                                { key: "city", header: "City" },
                                {
                                    key: "credit",
                                    header: "Credit",
                                    render: (row) => (row.credit ?? 0).toString()
                                }
                            ]}
                            emptyText={
                                selectedBusinessId
                                    ? "No clients found."
                                    : "Select a business to see its clients."
                            }
                        />
                    </div>
                </div>
            </div>


            {/* Business Drawer */}
            <MasterDrawer
                open={bizDrawerOpen}
                title={bizEditing ? "Edit business" : "Create business"}
                subtitle="Provide basic business details. Logo upload not supported; use a URL."
                submitting={bizMut.create.isPending || bizMut.update.isPending}
                onClose={() => {
                    setBizDrawerOpen(false);
                    setBizEditing(null);
                }}
                onSubmit={onSubmitBusiness}
                submitLabel={bizEditing ? "Update" : "Create"}
            >
                <UuidField
                    value={bizForm.id || ""}
                    onChange={(id) => setBizForm((f) => ({ ...f, id }))}
                />
                {bizErrors.id && <p className="form-error">{bizErrors.id}</p>}
                <div className="form-control">
                    <label className="form-label">Name</label>
                    <Input
                        value={bizForm.name || ""}
                        onChange={(e) => setBizForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {bizErrors.name && <p className="form-error">{bizErrors.name}</p>}
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Logo URL</label>
                        <Input
                            value={bizForm.logo || ""}
                            onChange={(e) => setBizForm((f) => ({ ...f, logo: e.target.value }))}
                        />
                        {bizErrors.logo && <p className="form-error">{bizErrors.logo}</p>}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Short name</label>
                        <Input
                            value={bizForm.shortName || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, shortName: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">License number</label>
                        <Input
                            value={bizForm.licenseNumber || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, licenseNumber: e.target.value }))
                            }
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Business number</label>
                        <Input
                            value={bizForm.businessNumber || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, businessNumber: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Phone</label>
                        <Input
                            value={bizForm.phone || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, phone: e.target.value }))
                            }
                        />
                        {bizErrors.phone && <p className="form-error">{bizErrors.phone}</p>}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Email</label>
                        <Input
                            value={bizForm.emailAddress || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, emailAddress: e.target.value }))
                            }
                        />
                        {bizErrors.emailAddress && (
                            <p className="form-error">{bizErrors.emailAddress}</p>
                        )}
                    </div>
                </div>
                <div className="form-control">
                    <label className="form-label">Website</label>
                    <Input
                        value={bizForm.website || ""}
                        onChange={(e) => setBizForm((f) => ({ ...f, website: e.target.value }))}
                    />
                    {bizErrors.website && <p className="form-error">{bizErrors.website}</p>}
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Address line 1</label>
                        <Input
                            value={bizForm.addressLine1 || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, addressLine1: e.target.value }))
                            }
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Address line 2</label>
                        <Input
                            value={bizForm.addressLine2 || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, addressLine2: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">City</label>
                        <Input
                            value={bizForm.city || ""}
                            onChange={(e) => setBizForm((f) => ({ ...f, city: e.target.value }))}
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">State</label>
                        <Input
                            value={bizForm.state || ""}
                            onChange={(e) => setBizForm((f) => ({ ...f, state: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Zipcode</label>
                        <Input
                            value={bizForm.zipcode || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, zipcode: e.target.value }))
                            }
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Country</label>
                        <Input
                            value={bizForm.country || ""}
                            onChange={(e) =>
                                setBizForm((f) => ({ ...f, country: e.target.value }))
                            }
                        />
                    </div>
                </div>
            </MasterDrawer>

            <DeleteConfirm
                open={Boolean(bizDelete)}
                onCancel={() => setBizDelete(null)}
                onConfirm={() => {
                    if (!bizDelete) return;
                    bizMut.remove.mutate(bizDelete.id, {
                        onSuccess: () => {
                            dispatch(
                                pushToast({
                                    level: "success",
                                    title: "Business deleted",
                                    description: "Business removed."
                                })
                            );
                            if (selectedBusinessId === bizDelete.id) {
                                setSelectedBusinessId(undefined);
                            }
                            setBizDelete(null);
                        },
                        onError: (err) => notifyError(err, "Delete failed")
                    });
                }}
                busy={bizMut.remove.isPending}
                title="Delete business"
                description="This will soft-delete the business."
            />

            {/* Client Drawer */}
            <MasterDrawer
                open={cliDrawerOpen}
                title={cliEditing ? "Edit client" : "Create client"}
                subtitle="Assign client to the selected business."
                submitting={cliMut.create.isPending || cliMut.update.isPending}
                onClose={() => {
                    setCliDrawerOpen(false);
                    setCliEditing(null);
                }}
                onSubmit={onSubmitClient}
                submitLabel={cliEditing ? "Update" : "Create"}
            >
                <UuidField
                    value={cliForm.id || ""}
                    onChange={(id) => setCliForm((f) => ({ ...f, id }))}
                />
                {cliErrors.id && <p className="form-error">{cliErrors.id}</p>}
                <div className="form-control">
                    <label className="form-label">Business</label>
                    <select
                        className="text-input"
                        value={cliForm.businessId || ""}
                        onChange={(e) =>
                            setCliForm((f) => ({ ...f, businessId: e.target.value }))
                        }
                    >
                        {businesses.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    {cliErrors.businessId && <p className="form-error">{cliErrors.businessId}</p>}
                </div>
                <div className="form-control">
                    <label className="form-label">Name</label>
                    <Input
                        value={cliForm.name || ""}
                        onChange={(e) => setCliForm((f) => ({ ...f, name: e.target.value }))}
                    />
                    {cliErrors.name && <p className="form-error">{cliErrors.name}</p>}
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Email</label>
                        <Input
                            value={cliForm.emailAddress || ""}
                            onChange={(e) =>
                                setCliForm((f) => ({ ...f, emailAddress: e.target.value }))
                            }
                        />
                        {cliErrors.emailAddress && (
                            <p className="form-error">{cliErrors.emailAddress}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Phone</label>
                        <Input
                            value={cliForm.phone || ""}
                            onChange={(e) => setCliForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                        {cliErrors.phone && <p className="form-error">{cliErrors.phone}</p>}
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Company</label>
                        <Input
                            value={cliForm.companyName || ""}
                            onChange={(e) =>
                                setCliForm((f) => ({ ...f, companyName: e.target.value }))
                            }
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Client ID</label>
                        <Input
                            value={cliForm.clientId || ""}
                            onChange={(e) =>
                                setCliForm((f) => ({ ...f, clientId: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">City</label>
                        <Input
                            value={cliForm.city || ""}
                            onChange={(e) => setCliForm((f) => ({ ...f, city: e.target.value }))}
                        />
                    </div>
                    <div className="form-control">
                        <label className="form-label">Country</label>
                        <Input
                            value={cliForm.country || ""}
                            onChange={(e) =>
                                setCliForm((f) => ({ ...f, country: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Rating</label>
                        <Input
                            type="number"
                            value={cliForm.rating ?? ""}
                            onChange={(e) =>
                                setCliForm((f) => ({
                                    ...f,
                                    rating: e.target.value === "" ? undefined : Number(e.target.value)
                                }))
                            }
                        />
                        {cliErrors.rating && <p className="form-error">{cliErrors.rating}</p>}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Credit</label>
                        <Input
                            type="number"
                            value={cliForm.credit ?? ""}
                            onChange={(e) =>
                                setCliForm((f) => ({
                                    ...f,
                                    credit: e.target.value === "" ? undefined : Number(e.target.value)
                                }))
                            }
                        />
                        {cliErrors.credit && <p className="form-error">{cliErrors.credit}</p>}
                    </div>
                </div>
                <div className="form-grid">
                    <div className="form-control">
                        <label className="form-label">Opening balance</label>
                        <Input
                            type="number"
                            value={cliForm.openingBalance ?? ""}
                            onChange={(e) =>
                                setCliForm((f) => ({
                                    ...f,
                                    openingBalance:
                                        e.target.value === "" ? undefined : Number(e.target.value)
                                }))
                            }
                        />
                        {cliErrors.openingBalance && (
                            <p className="form-error">{cliErrors.openingBalance}</p>
                        )}
                    </div>
                    <div className="form-control">
                        <label className="form-label">Fax</label>
                        <Input
                            value={cliForm.faxNumber || ""}
                            onChange={(e) =>
                                setCliForm((f) => ({ ...f, faxNumber: e.target.value }))
                            }
                        />
                    </div>
                </div>
                <div className="form-control">
                    <label className="form-label">Notes</label>
                    <Input
                        value={cliForm.additionalNotes || ""}
                        onChange={(e) =>
                            setCliForm((f) => ({ ...f, additionalNotes: e.target.value }))
                        }
                    />
                </div>
            </MasterDrawer>
        </div>
    );
}
