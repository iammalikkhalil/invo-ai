import api from "@/services/api";
import type {
    LoginRequest,
    SignupRequest,
    VerifyOtpRequest,
    SendOtpRequest,
    ResetPasswordRequest,
    SocialLoginRequest,
    AuthResponse
} from "@/types/dto/auth";
import type { ApiResponse } from "@/types/dto";

export async function login(req: LoginRequest) {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/login", req);
    return data.data;
}

export async function signup(req: SignupRequest) {
    const { data } = await api.post<ApiResponse<never>>("/auth/signup", req);
    return data;
}

export async function verifyOtp(req: VerifyOtpRequest) {
    const { data } = await api.post<ApiResponse<AuthResponse>>("/auth/verify-otp", req);
    return data.data;
}

export async function sendOtp(req: SendOtpRequest) {
    const { data } = await api.post<ApiResponse<never>>("/auth/send-otp", req);
    return data;
}

export async function resetPassword(req: ResetPasswordRequest) {
    const { data } = await api.post<ApiResponse<never>>("/auth/reset-password", req);
    return data;
}

export async function socialLogin(req: SocialLoginRequest) {
    const { data } = await api.post<ApiResponse<AuthResponse>>(
        "/auth/social-login",
        req
    );
    return data.data;
}
