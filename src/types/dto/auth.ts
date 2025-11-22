export interface UserProfile {
    id: number;
    username: string;
    email: string;
    phoneNumber?: string | null;
    isVerified: boolean;
    address?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    profilePictureUrl?: string | null;
}

export interface AuthResponse {
    token: string;
    userProfile: UserProfile;
}

export interface LoginRequest {
    email: string;
    password: string;
    notificationToken?: string | null;
}

export interface SignupRequest {
    username: string;
    email: string;
    phoneNumber?: string;
    password: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface SendOtpRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

export interface SocialLoginRequest {
    socialId: string;
    socialType: "google" | "facebook";
    username: string;
    email: string;
    notificationToken?: string | null;
}
