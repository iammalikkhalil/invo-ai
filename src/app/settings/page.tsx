"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsFormValues, settingsSchema } from "@/lib/validation";

export default function SettingsPage() {
    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            companyName: "Invotick",
            supportEmail: "support@invotick.com",
            currency: "USD",
            taxRate: 15,
            locale: "en-US",
            enableAutoReminders: true
        }
    });

    const onSubmit = (values: SettingsFormValues) => {
        console.log("submit to Spring Boot", values);
    };

    return (
        <div className="container-page page">
            <PageHeader
                title="Settings"
                description="Branding, taxes, locale, and notification preferences."
                actions={<Button size="sm" onClick={form.handleSubmit(onSubmit)}>Save changes</Button>}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Company profile</CardTitle>
                    <CardDescription>Map these fields to your existing settings endpoints.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="page-section" onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="form-grid">
                            <div className="form-control">
                                <Label htmlFor="companyName">Company name</Label>
                                <Input id="companyName" {...form.register("companyName")} />
                                {form.formState.errors.companyName && (
                                    <p className="form-error">{form.formState.errors.companyName.message}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <Label htmlFor="supportEmail">Support email</Label>
                                <Input id="supportEmail" type="email" {...form.register("supportEmail")} />
                                {form.formState.errors.supportEmail && (
                                    <p className="form-error">{form.formState.errors.supportEmail.message}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <Label htmlFor="currency">Currency</Label>
                                <Input id="currency" {...form.register("currency")} />
                                {form.formState.errors.currency && (
                                    <p className="form-error">{form.formState.errors.currency.message}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <Label htmlFor="taxRate">Tax rate (%)</Label>
                                <Input id="taxRate" type="number" step="0.5" {...form.register("taxRate")} />
                                {form.formState.errors.taxRate && (
                                    <p className="form-error">{form.formState.errors.taxRate.message}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <Label htmlFor="locale">Locale</Label>
                                <Input id="locale" placeholder="en-US" {...form.register("locale")} />
                                {form.formState.errors.locale && (
                                    <p className="form-error">{form.formState.errors.locale.message}</p>
                                )}
                            </div>
                            <div className="form-control">
                                <Label htmlFor="enableAutoReminders">Auto reminders</Label>
                                <div className="checkbox-row">
                                    <input id="enableAutoReminders" type="checkbox" {...form.register("enableAutoReminders")} />
                                    <span>Send due-date reminders automatically</span>
                                </div>
                            </div>
                        </div>
                        <div className="settings-actions">
                            <Button type="submit">
                                <Save className="btn__icon" /> Save settings
                            </Button>
                            {form.formState.isDirty && !form.formState.isSubmitting && (
                                <p className="settings-hint">Ready to submit to the Spring Boot settings endpoint.</p>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
