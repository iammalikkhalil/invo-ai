import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type ToastLevel = "info" | "success" | "warning" | "error";

export interface Toast {
    id: string;
    title: string;
    description?: string;
    level: ToastLevel;
}

interface ModalState {
    open: boolean;
    title?: string;
    description?: string;
    variant?: "info" | "confirm" | "error";
}

export interface UiState {
    loadingCount: number;
    toasts: Toast[];
    modal: ModalState;
}

const initialState: UiState = {
    loadingCount: 0,
    toasts: [],
    modal: { open: false }
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        startLoading(state) {
            state.loadingCount += 1;
        },
        stopLoading(state) {
            state.loadingCount = Math.max(0, state.loadingCount - 1);
        },
        pushToast(
            state,
            action: PayloadAction<Omit<Toast, "id"> & { id?: string }>
        ) {
            const id = action.payload.id ?? nanoid();
            state.toasts.push({ ...action.payload, id });
        },
        removeToast(state, action: PayloadAction<string>) {
            state.toasts = state.toasts.filter((t) => t.id !== action.payload);
        },
        showModal(
            state,
            action: PayloadAction<{
                title: string;
                description?: string;
                variant?: "info" | "confirm" | "error";
            }>
        ) {
            state.modal = { open: true, ...action.payload };
        },
        hideModal(state) {
            state.modal = { open: false };
        }
    }
});

export const {
    startLoading,
    stopLoading,
    pushToast,
    removeToast,
    showModal,
    hideModal
} = uiSlice.actions;

export default uiSlice.reducer;
