import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { PaymentInstructionDto } from "@/types/dto/masterData";

const BASE = "/payment-instructions";

export async function listPaymentInstructions() {
    console.log("[pi][list] start");
    const { data } = await api.get<ApiResponse<PaymentInstructionDto[]>>(BASE);
    console.log("[pi][list] ok", data?.data?.length);
    return data.data;
}

export async function createPaymentInstruction(payload: PaymentInstructionDto) {
    console.log("[pi][create]", payload);
    const { data } = await api.post<ApiResponse<PaymentInstructionDto>>(BASE, payload);
    return data.data;
}

export async function updatePaymentInstruction(id: string, payload: PaymentInstructionDto) {
    console.log("[pi][update]", { id, payload });
    const { data } = await api.put<ApiResponse<PaymentInstructionDto>>(`${BASE}/${id}`, payload);
    return data.data;
}

export async function deletePaymentInstruction(id: string) {
    console.log("[pi][delete]", id);
    const { data } = await api.delete<ApiResponse<null>>(`${BASE}/${id}`);
    return data.data;
}
