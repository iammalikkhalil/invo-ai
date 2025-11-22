import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { customers } from "@/lib/sampleData";
import { Mail, Phone } from "lucide-react";

export const metadata = {
    title: "Customers | Invotick"
};

export default function CustomersPage() {
    return (
        <div className="container-page page">
            <PageHeader
                title="Customers"
                description="Sync customer records with the Kotlin app and use route handlers to hydrate this list from the API."
            />

            <div className="customer-grid">
                {customers.map((customer) => (
                    <Card key={customer.name}>
                        <CardHeader>
                            <CardTitle>{customer.name}</CardTitle>
                            <CardDescription>Last invoice {customer.lastInvoice}</CardDescription>
                        </CardHeader>
                        <CardContent className="customer-card__meta">
                            <div className="customer-card__contact">
                                <Mail size={16} /> {customer.contact}
                            </div>
                            <div className="customer-card__contact">
                                <Phone size={16} /> +00 000 0000
                            </div>
                            <div className="customer-card__footer">
                                <span>${customer.balance.toLocaleString()}</span>
                                <Badge variant="outline">Net 30</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
