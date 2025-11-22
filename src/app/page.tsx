import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/nav";

const highlights = [
    {
        title: "Realtime sync",
        description: "Invoices, payments, and customers stay in sync with the Kotlin mobile apps via your Spring Boot APIs."
    },
    {
        title: "PDF + CSV ready",
        description: "Download-ready reports and invoice PDFs using the existing JVM PDF generator."
    },
    {
        title: "Secure by design",
        description: "JWT or cookie auth supported; route handlers can proxy sensitive calls to the backend."
    }
];

export default function HomePage() {
    return (
        <div>
            <section className="container-page hero">
                <div className="hero__content">
                    <p className="hero__tag">
                        <ShieldCheck /> Next.js + Kotlin Multiplatform
                    </p>
                    <h1 className="hero__title">
                        Web frontend for Invotick invoices, expenses, and reports
                    </h1>
                    <p className="hero__subtitle">
                        Responsive dashboard built with Next.js 14, Tailwind, React Query, and React Hook Form.
                        Ready to connect to your Spring Boot + Postgres APIs.
                    </p>
                    <div className="hero__actions">
                        <Button asChild size="lg">
                            <Link href="/dashboard">
                                Open dashboard <ArrowRight className="btn__icon" />
                            </Link>
                        </Button>
                        <Button variant="secondary" size="lg" asChild>
                            <Link href="/invoices">View invoices</Link>
                        </Button>
                    </div>
                    <div className="hero__highlights">
                        {highlights.map((item) => (
                            <div key={item.title} className="highlight-card">
                                <CheckCircle2 className="highlight-card__icon" />
                                <div>
                                    <p className="highlight-card__title">{item.title}</p>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <Card className="ia-card">
                    <CardHeader>
                        <CardTitle>Web IA mapping</CardTitle>
                    </CardHeader>
                    <CardContent className="ia-card__list">
                        {NAV_ITEMS.map((item) => (
                            <div key={item.href} className="ia-card__item">
                                <p>{item.title}</p>
                                <p>{item.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
