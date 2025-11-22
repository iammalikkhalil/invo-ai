export const invoices = [
    {
        id: "INV-1001",
        customer: "Acme Corp",
        amount: 1250.5,
        status: "sent",
        dueDate: "2024-08-15"
    },
    {
        id: "INV-1002",
        customer: "Globex",
        amount: 4200,
        status: "overdue",
        dueDate: "2024-07-28"
    },
    {
        id: "INV-1003",
        customer: "Soylent Industries",
        amount: 640,
        status: "draft",
        dueDate: "2024-09-05"
    }
];

export const customers = [
    {
        name: "Acme Corp",
        contact: "jane@acme.com",
        balance: 1250.5,
        lastInvoice: "INV-1001"
    },
    {
        name: "Globex",
        contact: "ops@globex.com",
        balance: 4200,
        lastInvoice: "INV-1002"
    },
    {
        name: "Soylent Industries",
        contact: "billing@soylent.com",
        balance: 640,
        lastInvoice: "INV-1003"
    }
];

export const stats = [
    {
        label: "MRR",
        value: "$18,420",
        change: "+12.4% vs last month"
    },
    {
        label: "Outstanding",
        value: "$6,230",
        change: "5 invoices overdue"
    },
    {
        label: "Expenses",
        value: "$2,180",
        change: "Tracked in the last 30 days"
    }
];