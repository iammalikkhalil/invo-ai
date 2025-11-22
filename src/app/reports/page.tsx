import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
    title: "Reports | Invotick"
};

export default function ReportsPage() {
    return (
        <div className="container-page page">
            <PageHeader
                title="Reports"
                description="Run P&L, tax, and cashflow reports. Connect to your existing PDF/CSV exporters."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Reporting library</CardTitle>
                    <CardDescription>Use Next.js route handlers to proxy report downloads securely.</CardDescription>
                </CardHeader>
                <CardContent className="icon-text-row">
                    <FileText />
                    Wire this UI to the JVM PDF generator already present in the repository.
                </CardContent>
            </Card>
        </div>
    );
}
