"use client";

import { TaxesSection } from "./taxes/page";
import { UnitsSection } from "./units/page";
import { CategoriesSection } from "./categories/page";
import { TermsSection } from "./terms/page";
import { PaymentInstructionsSection } from "./payment-instructions/page";

export default function MasterDataPage() {
    return (
        <div className="container-page page">
            <h1>Master Data</h1>
            <p className="page-subtitle">
                Manage taxes, units, categories, terms, and payment instructions in one place.
                Each update creates a new record with a new UUID per backend rules.
            </p>
            <div className="page-section">
                <TaxesSection />
            </div>
            <div className="page-section">
                <UnitsSection />
            </div>
            <div className="page-section">
                <CategoriesSection />
            </div>
            <div className="page-section">
                <TermsSection />
            </div>
            <div className="page-section">
                <PaymentInstructionsSection />
            </div>
        </div>
    );
}
