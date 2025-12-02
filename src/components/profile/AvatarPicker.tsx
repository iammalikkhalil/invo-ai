"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { pushToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store";
import { NameAvatar } from "@/components/ui/name-avatar";

interface Props {
    initialUrl?: string | null;
    onSelect?: (file: File | null, previewUrl?: string) => void;
    fallbackName?: string;
}

export function AvatarPicker({ initialUrl, onSelect, fallbackName = "User" }: Props) {
    const dispatch = useAppDispatch();
    const [preview, setPreview] = useState<string | undefined>(
        initialUrl ?? undefined
    );

    const handleFile = (file?: File) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setPreview(url);
        onSelect?.(file, url);
        dispatch(
            pushToast({
                level: "info",
                title: "Avatar selected",
                description: "Image preview updated (not saved to server).",
                durationMs: 2000
            })
        );
    };

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file);
    };

    return (
        <div className="avatar-uploader">
            <div className="avatar-uploader__preview">
                {preview ? (
                    <Image src={preview} alt="Avatar preview" fill sizes="96px" />
                ) : (
                    <NameAvatar name={fallbackName} size={96} variant="gradient" />
                )}
            </div>
            <label className="btn avatar-uploader__button">
                Choose avatar
                <input
                    type="file"
                    accept="image/*"
                    className="avatar-uploader__input"
                    onChange={onFileChange}
                />
            </label>
        </div>
    );
}
