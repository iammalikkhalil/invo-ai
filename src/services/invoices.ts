import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { Invoice } from "@/types/dto/invoices";

const BASE = "/invoices";

export async function listInvoices() {
    console.log("[invoices][list]");
    const { data } = await api.get<ApiResponse<Invoice[]>>(BASE);
    console.log("[invoices][list][response]", {
        length: data?.data?.length,
        sample: data?.data?.[0]
    });
    return data.data;
}

export async function createInvoice(payload: Invoice) {
    console.log("[invoices][create]", payload);
    const { data } = await api.post<ApiResponse<Invoice>>(BASE, payload);
    return data.data;
}

export async function updateInvoice(id: string, payload: Invoice) {
    console.log("[invoices][update]", { id, payload });
    const { data } = await api.put<ApiResponse<Invoice>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deleteInvoice(id: string) {
    console.log("[invoices][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
