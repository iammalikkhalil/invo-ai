"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchProfile, updateProfile } from "@/services/profile";
import { useApiError } from "@/hooks/useApiError";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { setUser } from "@/store/slices/authSlice";
import { saveUser } from "@/services/auth/userStorage";
import { AvatarPicker } from "@/components/profile/AvatarPicker";

const profileSchema = z.object({
    username: z.string().min(2, "Name is required"),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    notificationToken: z.string().optional()
});
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
    const dispatch = useAppDispatch();
    const { notifyError } = useApiError();
    const queryClient = useQueryClient();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);

    const profileQuery = useQuery({
        queryKey: ["profile"],
        queryFn: fetchProfile
    });

    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            username: "",
            phoneNumber: "",
            address: "",
            country: "",
            state: "",
            city: "",
            notificationToken: ""
        }
    });

    useEffect(() => {
        if (profileQuery.data) {
            const p = profileQuery.data;
            profileForm.reset({
                username: p.username ?? "",
                phoneNumber: p.phoneNumber ?? "",
                address: p.address ?? "",
                country: p.country ?? "",
                state: p.state ?? "",
                city: p.city ?? "",
                notificationToken: p.notificationToken ?? ""
            });
            setAvatarPreview(p.profilePictureUrl ?? undefined);
            console.log("[profile][hydrate]", p);
        }
    }, [profileQuery.data, profileForm]);

    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            dispatch(setUser(data));
            saveUser(data);
            dispatch(
                pushToast({
                    level: "success",
                    title: "Profile updated",
                    description: "Your profile has been saved.",
                    durationMs: 2500
                })
            );
            console.log("[profile][update] success", data);
        },
        onError: (err) => notifyError(err, "Update failed")
    });

    const onSubmitProfile = (values: ProfileFormValues) => {
        console.log("[profile][submit]", values, { avatarSelected: Boolean(avatarFile) });
        if (avatarFile) {
            dispatch(
                pushToast({
                    level: "warning",
                    title: "Avatar not synced",
                    description: "Avatar change is not saved to server in this build.",
                    durationMs: 2500
                })
            );
        }
        updateProfileMutation.mutate({
            ...values
        });
    };

    return (
        <div className="container-page page">
            <PageHeader
                title="Profile"
                description="Update your profile and account security."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Personal info</CardTitle>
                    <CardDescription>Manage your name and contact.</CardDescription>
                </CardHeader>
                <CardContent className="page-section">
                    <AvatarPicker
                        initialUrl={avatarPreview}
                        fallbackName={profileForm.watch("username") || "User"}
                        onSelect={(file, url) => {
                            setAvatarFile(file);
                            setAvatarPreview(url);
                        }}
                    />
                    <div className="form-grid">
                        <div className="form-control">
                            <Label htmlFor="username">Name</Label>
                            <Input id="username" {...profileForm.register("username")} />
                            {profileForm.formState.errors.username && (
                                <p className="form-error">
                                    {profileForm.formState.errors.username.message}
                                </p>
                            )}
                        </div>
                        <div className="form-control">
                            <Label>Email</Label>
                            <div className="text-input" aria-readonly="true">
                                {profileQuery.data?.email ?? "Loading..."}
                            </div>
                        </div>
                        <div className="form-control">
                            <Label htmlFor="phoneNumber">Phone</Label>
                            <Input id="phoneNumber" {...profileForm.register("phoneNumber")} />
                        </div>
                        <div className="form-control">
                            <Label htmlFor="notificationToken">Notification token</Label>
                            <Input id="notificationToken" {...profileForm.register("notificationToken")} />
                        </div>
                        <div className="form-control">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" {...profileForm.register("address")} />
                        </div>
                        <div className="form-control">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...profileForm.register("city")} />
                        </div>
                        <div className="form-control">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" {...profileForm.register("state")} />
                        </div>
                        <div className="form-control">
                            <Label htmlFor="country">Country</Label>
                            <Input id="country" {...profileForm.register("country")} />
                        </div>
                    </div>
                    <div className="settings-actions">
                        <Button
                            type="button"
                            onClick={profileForm.handleSubmit(onSubmitProfile)}
                            disabled={updateProfileMutation.isPending}
                        >
                            Save profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>Password changes are not supported in this build.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="settings-hint">Coming soon via backend support.</p>
                </CardContent>
            </Card>
        </div>
    );
}
