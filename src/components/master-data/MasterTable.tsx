"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type MasterColumn<T> = {
    key: string;
    header: string;
    render?: (row: T) => React.ReactNode;
};

type Props<T> = {
    title: string;
    data: T[];
    columns: MasterColumn<T>[];
    loading?: boolean;
    search: string;
    onSearch: (value: string) => void;
    onCreate?: () => void;
    onEdit: (row: T) => void;
    onDelete: (row: T) => void;
    getKey: (row: T) => string;
    emptyText?: string;
};

export function MasterTable<T>({
    title,
    data,
    columns,
    loading,
    search,
    onSearch,
    onCreate,
    onEdit,
    onDelete,
    getKey,
    emptyText = "No records found."
}: Props<T>) {
    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return data;
        return data.filter((item) =>
            JSON.stringify(item).toLowerCase().includes(term)
        );
    }, [data, search]);

    return (
        <div className="card">
            <div className="card__header">
                <div>
                    <h3 className="card__title">{title}</h3>
                    <p className="card__description">
                        Search, create, edit, or delete records. Updates require a new UUID
                        for tax/unit/category per backend rules.
                    </p>
                </div>
                {onCreate && <Button onClick={onCreate}>Create</Button>}
            </div>
            <div className="card__toolbar">
                <Input
                    placeholder="Search…"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key}>{col.header}</th>
                            ))}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + 1}>Loading…</td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1}>{emptyText}</td>
                            </tr>
                        ) : (
                            filtered.map((row) => (
                                <tr key={getKey(row)}>
                                    {columns.map((col) => (
                                        <td key={col.key}>
                                            {col.render ? col.render(row) : (row as any)[col.key]}
                                        </td>
                                    ))}
                                    <td className="table-actions">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(row)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(row)}
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
    );
}
