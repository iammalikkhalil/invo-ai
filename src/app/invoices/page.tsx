import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { invoices } from "@/lib/sampleData";

export const metadata = {
    title: "Invoices | Invotick"
};

const statusCopy: Record<string, { label: string; variant: "success" | "danger" | "outline" | "default" }> = {
    sent: { label: "Sent", variant: "success" },
    draft: { label: "Draft", variant: "outline" },
    overdue: { label: "Overdue", variant: "danger" }
};

export default function InvoicesPage() {
    return (
        <div className="container-page page">
            <PageHeader
                title="Invoices"
                description="Create, send, and track invoices. This route will call Spring Boot APIs via fetch or route handlers."
                actions={
                    <Button size="sm">
                        <Plus className="btn__icon" /> New invoice
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>Invoice list</CardTitle>
                    <CardDescription>Replace mocked data with API responses once endpoints are connected.</CardDescription>
                </CardHeader>
                <CardContent className="invoice-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Due</th>
                                <th>Status</th>
                                <th aria-label="Actions" />
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id}>
                                    <td>{invoice.id}</td>
                                    <td>{invoice.customer}</td>
                                    <td>${invoice.amount.toLocaleString()}</td>
                                    <td>{invoice.dueDate}</td>
                                    <td>
                                        <Badge variant={statusCopy[invoice.status].variant}>
                                            {statusCopy[invoice.status].label}
                                        </Badge>
                                    </td>
                                    <td className="data-table__actions">
                                        <Button variant="ghost" size="sm">
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
