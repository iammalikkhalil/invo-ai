import { ClipboardList } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
    title: "Expenses | Invotick"
};

export default function ExpensesPage() {
    return (
        <div className="container-page page">
            <PageHeader
                title="Expenses"
                description="Capture receipts and categorize spending. Hook this up to the expense endpoints in Spring Boot."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Placeholder</CardTitle>
                    <CardDescription>Swap this card with a table/grid once APIs are connected.</CardDescription>
                </CardHeader>
                <CardContent className="icon-text-row">
                    <ClipboardList />
                    Track reimbursements, mileage, and receipt uploads here.
                </CardContent>
            </Card>
        </div>
    );
}
