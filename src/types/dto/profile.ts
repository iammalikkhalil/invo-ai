export interface Profile {
    id: number;
    username: string;
    email: string;
    isVerified?: boolean;
    phoneNumber?: string | null;
    address?: string | null;
    country?: string | null;
    state?: string | null;
    city?: string | null;
    profilePictureUrl?: string | null;
    notificationToken?: string | null;
}

export interface UpdateProfileRequest {
    username?: string;
    phoneNumber?: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    profilePictureUrl?: string;
    notificationToken?: string | null;
}
