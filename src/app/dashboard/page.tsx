import { ArrowUpRight, Download, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { invoices, stats } from "@/lib/sampleData";

export const metadata = {
    title: "Dashboard | Invotick"
};

export default function DashboardPage() {
    return (
        <div className="container-page page">
            <PageHeader
                title="Dashboard"
                description="Overview of cash flow, invoices, and customer health."
                actions={
                    <>
                        <Button variant="secondary" size="sm" className="is-hidden-mobile">
                            Export CSV
                        </Button>
                        <Button size="sm">
                            New invoice
                            <ArrowUpRight className="btn__icon" />
                        </Button>
                    </>
                }
            />

            <div className="stat-grid">
                {stats.map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader>
                            <CardDescription>{stat.label}</CardDescription>
                            <CardTitle className="stat-card__value">{stat.value}</CardTitle>
                            <p className="stat-card__delta">{stat.change}</p>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent invoices</CardTitle>
                    <CardDescription>Synced with the Kotlin app; auto-refresh via React Query.</CardDescription>
                </CardHeader>
                <CardContent className="recent-list">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="recent-item"
                        >
                            <div className="recent-item__meta">
                                <p>{invoice.id}</p>
                                <p>{invoice.customer}</p>
                            </div>
                            <div className="recent-item__actions invoice-summary">
                                <Badge
                                    variant={
                                        invoice.status === "overdue"
                                            ? "danger"
                                            : invoice.status === "sent"
                                                ? "success"
                                                : "outline"
                                    }
                                >
                                    {invoice.status}
                                </Badge>
                                <span className="invoice-summary__amount">${invoice.amount.toLocaleString()}</span>
                                <span>Due {invoice.dueDate}</span>
                                <Button variant="secondary" size="sm">
                                    <Mail className="btn__icon" /> Send reminder
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Exports</CardTitle>
                    <CardDescription>PDF/CSV endpoints can be called from Next.js route handlers.</CardDescription>
                </CardHeader>
                <CardContent className="export-actions">
                    <Button variant="secondary">
                        <Download className="btn__icon" /> Download PDF
                    </Button>
                    <Button variant="secondary">
                        <Download className="btn__icon" /> Export CSV
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
