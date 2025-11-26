const LAST_AUTH_EMAIL_KEY = "invotick_last_auth_email";
const RESET_EMAIL_KEY = "invotick_reset_email";
const RESET_OTP_KEY = "invotick_reset_otp";

export function setLastAuthEmail(email: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(LAST_AUTH_EMAIL_KEY, email);
}

export function getLastAuthEmail() {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(LAST_AUTH_EMAIL_KEY) ?? undefined;
}

export function setResetEmail(email: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(RESET_EMAIL_KEY, email);
}

export function getResetEmail() {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(RESET_EMAIL_KEY) ?? undefined;
}

export function setResetOtp(otp: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(RESET_OTP_KEY, otp);
}

export function getResetOtp() {
    if (typeof window === "undefined") return undefined;
    return localStorage.getItem(RESET_OTP_KEY) ?? undefined;
}

export function clearResetFlow() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(RESET_EMAIL_KEY);
    localStorage.removeItem(RESET_OTP_KEY);
}
