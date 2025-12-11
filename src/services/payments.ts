import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { Payment } from "@/types/dto/payments";

const BASE = "/payments";

export async function listPayments() {
    console.log("[payments][list]");
    const { data } = await api.get<ApiResponse<Payment[]>>(BASE);
    console.log("[payments][list][response]", {
        length: data?.data?.length,
        sample: data?.data?.[0]
    });
    return data.data;
}

export async function createPayment(payload: Payment) {
    console.log("[payments][create]", payload);
    const { data } = await api.post<ApiResponse<Payment>>(BASE, payload);
    return data.data;
}

export async function updatePayment(id: string, payload: Payment) {
    console.log("[payments][update]", { id, payload });
    const { data } = await api.put<ApiResponse<Payment>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deletePayment(id: string) {
    console.log("[payments][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
