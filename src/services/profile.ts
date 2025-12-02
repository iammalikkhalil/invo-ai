import api from "@/services/api";
import type { ApiResponse } from "@/types/dto";
import type { Profile, UpdateProfileRequest } from "@/types/dto/profile";

export async function fetchProfile() {
    console.log("[profile][fetch] start");
    const { data } = await api.get<ApiResponse<Profile>>("/profile/me");
    console.log("[profile][fetch] success", data.data);
    return data.data;
}

export async function updateProfile(payload: UpdateProfileRequest) {
    console.log("[profile][update] start", payload);
    const { data } = await api.put<ApiResponse<Profile>>("/profile", payload);
    console.log("[profile][update] success", data.data);
    return data.data;
}

export async function updatePassword(payload: { oldPassword: string; newPassword: string }) {
    console.log("[profile][password] start");
    const { data } = await api.put<ApiResponse<never>>("/profile/password", payload);
    console.log("[profile][password] success");
    return data;
}
