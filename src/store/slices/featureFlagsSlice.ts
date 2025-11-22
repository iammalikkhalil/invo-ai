import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface FeatureFlagsState {
    invoices: boolean;
    expenses: boolean;
    reports: boolean;
}

const initialState: FeatureFlagsState = {
    invoices: true,
    expenses: true,
    reports: true
};

const featureFlagsSlice = createSlice({
    name: "featureFlags",
    initialState,
    reducers: {
        setFeatureFlags(state, action: PayloadAction<Partial<FeatureFlagsState>>) {
            Object.assign(state, action.payload);
        }
    }
});

export const { setFeatureFlags } = featureFlagsSlice.actions;
export default featureFlagsSlice.reducer;
