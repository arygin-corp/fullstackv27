const INVOICE_DATA=[
  {
    id: "inv-9044", number: "INV-9044", customer: "Summit Digital", email: "billing@summitdigital.io", status: "issued", issueDate: "2026-08-20", dueDate: "2026-09-04",
    currency: "USD", subtotal: 8500, discount: 0, tax: 425, fees: 0, total: 8925, amountPaid: 0, balanceDue: 8925,
    sourceModule: "CRM", sourceReference: "DEAL-2119 / QUO-1908", billingModel: "one-time", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "ACH", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Liam Brooks", lastEvent: "Finalized Aug 20 · ready to send",
    items: [{ id: "li-17", sku: "CRM-ONBOARD", description: "CRM onboarding and data migration", quantity: 1, rate: 8500, taxRate: 5 }],
  },
  {
    id: "inv-9043", number: "INV-9043", customer: "Northstar Labs", email: "ap@northstarlabs.io", status: "sent", issueDate: "2026-08-18", dueDate: "2026-09-02",
    currency: "USD", subtotal: 24000, discount: 1200, tax: 1140, fees: 0, total: 23940, amountPaid: 0, balanceDue: 23940,
    sourceModule: "CRM", sourceReference: "DEAL-2048 / QUO-1872", billingModel: "one-time", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "ACH", legalEntity: "Northwind Digital Inc.", purchaseOrder: "PO-NS-8814", recurring: false, owner: "Liam Brooks", lastEvent: "Invoice emailed Aug 18",
    items: [
      { id: "li-14", sku: "ENT-IMP", description: "Enterprise implementation package", quantity: 1, rate: 18000, discountPct: 5, taxRate: 5 },
      { id: "li-15", sku: "TRAIN-ADV", description: "Administrator enablement", quantity: 2, rate: 3000, discountPct: 5, taxRate: 5 },
    ],
  },
  {
    id: "inv-9042", number: "INV-9042", customer: "Apex Infrastructure", email: "finance@apexinfra.com", status: "viewed", issueDate: "2026-08-18", dueDate: "2026-09-01",
    currency: "USD", subtotal: 42000, discount: 0, tax: 2100, fees: 0, total: 44100, amountPaid: 0, balanceDue: 44100,
    sourceModule: "Projects", sourceReference: "PRJ-PHX-22 / MS-04", billingModel: "milestone", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "Wire", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Sofia Reed", lastEvent: "Milestone invoice viewed Aug 19",
    items: [{ id: "li-16", sku: "MS-04", description: "Production handover stage", quantity: 1, rate: 42000, taxRate: 5 }],
  },
  {
    id: "inv-9041", number: "INV-9041", customer: "Acme Studio", email: "finance@acmestudio.com", status: "paid", issueDate: "2026-08-01", dueDate: "2026-08-15",
    currency: "USD", subtotal: 18000, discount: 0, tax: 900, fees: 0, total: 18900, amountPaid: 18900, balanceDue: 0,
    sourceModule: "SaaS", sourceReference: "SUB-ENT-1048", billingModel: "recurring", collectionMethod: "Auto charge", paymentTerms: "Due on receipt",
    paymentMethod: "Visa · 4242", legalEntity: "Northwind Digital Inc.", recurring: true, owner: "Mia Chen", lastEvent: "Payment settled Aug 15",
    items: [
      { id: "li-1", sku: "ENT-100", description: "Enterprise platform · 100 seats", quantity: 1, rate: 15000, taxRate: 5 },
      { id: "li-2", sku: "SUP-PRIO", description: "Priority support", quantity: 1, rate: 3000, taxRate: 5 },
    ],
  },
  {
    id: "inv-9040", number: "INV-9040", customer: "Harbor Build Group", email: "ap@harborbuild.com", status: "partial", issueDate: "2026-08-05", dueDate: "2026-08-20",
    currency: "USD", subtotal: 12000, discount: 0, tax: 600, fees: 0, total: 12600, amountPaid: 5000, balanceDue: 7600,
    sourceModule: "Construction", sourceReference: "PB-26-0817-03", billingModel: "milestone", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "ACH", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Liam Brooks", lastEvent: "$5,000 applied Aug 17",
    items: [{ id: "li-3", sku: "PB-03", description: "Progress billing · structural package", quantity: 1, rate: 12000, taxRate: 5 }],
  },
  {
    id: "inv-9039", number: "INV-9039", customer: "Orbit Systems", email: "billing@orbitsystems.co", status: "overdue", issueDate: "2026-07-15", dueDate: "2026-07-30",
    currency: "USD", subtotal: 26500, discount: 0, tax: 1325, fees: 0, total: 27825, amountPaid: 0, balanceDue: 27825,
    sourceModule: "SaaS", sourceReference: "SUB-ENT-0981", billingModel: "recurring", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "ACH", legalEntity: "Northwind Digital Inc.", recurring: true, owner: "Mia Chen", lastEvent: "Reminder sent Aug 18",
    items: [{ id: "li-4", sku: "ENT-ANN", description: "Enterprise annual renewal", quantity: 1, rate: 26500, taxRate: 5 }],
  },
  {
    id: "inv-9038", number: "INV-9038", customer: "Mosaic Creative", email: "accounts@mosaiccreative.co", status: "paid", issueDate: "2026-08-02", dueDate: "2026-08-12",
    currency: "USD", subtotal: 4800, discount: 0, tax: 240, fees: 0, total: 5040, amountPaid: 5040, balanceDue: 0,
    sourceModule: "eCommerce", sourceReference: "ORD-104892", billingModel: "order", collectionMethod: "Auto charge", paymentTerms: "Due on receipt",
    paymentMethod: "Mastercard · 8210", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Liam Brooks", lastEvent: "Payment settled Aug 12",
    items: [{ id: "li-5", sku: "B2B-ORDER", description: "B2B commerce order", quantity: 12, rate: 400, taxRate: 5 }],
  },
  {
    id: "inv-9037", number: "INV-9037", customer: "Harbor Logistics", email: "finance@harborlogistics.com", status: "draft", issueDate: "2026-08-17", dueDate: "2026-08-31",
    currency: "USD", subtotal: 9200, discount: 0, tax: 460, fees: 0, total: 9660, amountPaid: 0, balanceDue: 9660,
    sourceModule: "ERP", sourceReference: "SO-260817-0934", billingModel: "order", collectionMethod: "Send invoice", paymentTerms: "Net 30",
    paymentMethod: "Not selected", legalEntity: "Northwind Digital Inc.", purchaseOrder: "PO-HL-204", recurring: false, owner: "Sofia Reed", lastEvent: "Draft updated Aug 18",
    items: [{ id: "li-6", sku: "ERP-SO", description: "ERP sales order fulfillment", quantity: 1, rate: 9200, taxRate: 5 }],
  },
  {
    id: "inv-9036", number: "INV-9036", customer: "Vale Energy", email: "ap@valeenergy.com", status: "paid", issueDate: "2026-07-20", dueDate: "2026-08-05",
    currency: "USD", subtotal: 30000, discount: 0, tax: 1500, fees: 0, total: 31500, amountPaid: 31500, balanceDue: 0,
    sourceModule: "Manual", sourceReference: "SOW-ENERGY-071", billingModel: "one-time", collectionMethod: "Offline / bank", paymentTerms: "Net 15",
    paymentMethod: "Wire", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Sofia Reed", lastEvent: "Wire reconciled Aug 05",
    items: [{ id: "li-7", sku: "SERV-ANN", description: "Annual enterprise services", quantity: 1, rate: 30000, taxRate: 5 }],
  },
  {
    id: "inv-9035", number: "INV-9035", customer: "Cedar Academy", email: "billing@cedaracademy.edu", status: "overdue", issueDate: "2026-07-25", dueDate: "2026-08-08",
    currency: "USD", subtotal: 3900, discount: 0, tax: 195, fees: 0, total: 4095, amountPaid: 1500, balanceDue: 2595,
    sourceModule: "Education", sourceReference: "FEE-2026-FALL-884", billingModel: "installment", collectionMethod: "Send invoice", paymentTerms: "Installment",
    paymentMethod: "Bank transfer", legalEntity: "Northwind Education Services", recurring: false, owner: "Mia Chen", lastEvent: "Collection task opened Aug 16",
    items: [{ id: "li-8", sku: "FEE-FALL", description: "Fall program fee · installment 2", quantity: 1, rate: 3900, taxRate: 5 }],
  },
  {
    id: "inv-9034", number: "INV-9034", customer: "Frame Health", email: "billing@framehealth.org", status: "partial", issueDate: "2026-08-10", dueDate: "2026-08-24",
    currency: "USD", subtotal: 7600, discount: 0, tax: 380, fees: 0, total: 7980, amountPaid: 2980, balanceDue: 5000,
    sourceModule: "Hospital", sourceReference: "PAT-BILL-260810-184", billingModel: "installment", collectionMethod: "Send invoice", paymentTerms: "Insurance split",
    paymentMethod: "Insurance + card", legalEntity: "Northwind Health Services", recurring: false, owner: "Liam Brooks", lastEvent: "Insurance portion applied Aug 18",
    items: [{ id: "li-9", sku: "PAT-BILL", description: "Patient billing balance", quantity: 1, rate: 7600, taxRate: 5 }],
  },
  {
    id: "inv-9033", number: "INV-9033", customer: "Kite Health", email: "finance@kitehealth.com", status: "paid", issueDate: "2026-07-28", dueDate: "2026-08-11",
    currency: "USD", subtotal: 14200, discount: 0, tax: 710, fees: 0, total: 14910, amountPaid: 14910, balanceDue: 0,
    sourceModule: "Hospital", sourceReference: "PAT-BILL-260728-091", billingModel: "one-time", collectionMethod: "Send invoice", paymentTerms: "Net 14",
    paymentMethod: "ACH", legalEntity: "Northwind Health Services", recurring: false, owner: "Sofia Reed", lastEvent: "Payment settled Aug 11",
    items: [{ id: "li-10", sku: "PAT-AR", description: "Clinical service billing", quantity: 1, rate: 14200, taxRate: 5 }],
  },
  {
    id: "inv-9032", number: "INV-9032", customer: "Helio Properties", email: "billing@helioproperties.com", status: "sent", issueDate: "2026-08-11", dueDate: "2026-08-26",
    currency: "USD", subtotal: 24800, discount: 0, tax: 1240, fees: 0, total: 26040, amountPaid: 0, balanceDue: 26040,
    sourceModule: "Real Estate", sourceReference: "LEASE-AUS-1208", billingModel: "recurring", collectionMethod: "Send invoice", paymentTerms: "Net 15",
    paymentMethod: "ACH", legalEntity: "Northwind Property Services", recurring: true, owner: "Mia Chen", lastEvent: "Tenant invoice sent Aug 12",
    items: [{ id: "li-11", sku: "LEASE-MONTH", description: "Commercial lease billing", quantity: 1, rate: 24800, taxRate: 5 }],
  },
  {
    id: "inv-9031", number: "INV-9031", customer: "Nova Retail", email: "finance@novaretail.com", status: "draft", issueDate: "2026-08-16", dueDate: "2026-09-01",
    currency: "USD", subtotal: 6400, discount: 0, tax: 320, fees: 0, total: 6720, amountPaid: 0, balanceDue: 6720,
    sourceModule: "eCommerce", sourceReference: "ORD-104931", billingModel: "order", collectionMethod: "Auto charge", paymentTerms: "Due on receipt",
    paymentMethod: "Not selected", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Liam Brooks", lastEvent: "Draft created Aug 16",
    items: [{ id: "li-12", sku: "B2B-COM", description: "Commerce analytics package", quantity: 1, rate: 6400, taxRate: 5 }],
  },
  {
    id: "inv-9030", number: "INV-9030", customer: "Atlas Mobility", email: "ap@atlasmobility.com", status: "paid", issueDate: "2026-07-21", dueDate: "2026-08-04",
    currency: "USD", subtotal: 11000, discount: 0, tax: 550, fees: 0, total: 11550, amountPaid: 11550, balanceDue: 0,
    sourceModule: "Manual", sourceReference: "SOW-2026-043", billingModel: "one-time", collectionMethod: "Offline / bank", paymentTerms: "Net 14",
    paymentMethod: "Wire", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Sofia Reed", lastEvent: "Wire reconciled Aug 04",
    items: [{ id: "li-13", sku: "PRO-SERV", description: "Professional services", quantity: 1, rate: 11000, taxRate: 5 }],
  },  {
    id: "inv-9029", number: "INV-9029", customer: "Legacy Account", email: "billing@legacyaccount.com", status: "void", issueDate: "2026-07-18", dueDate: "2026-08-01",
    currency: "USD", subtotal: 2000, discount: 0, tax: 100, fees: 0, total: 2100, amountPaid: 0, balanceDue: 0,
    sourceModule: "Manual", sourceReference: "FIN-VOID-029", billingModel: "one-time", collectionMethod: "Send invoice", paymentTerms: "Net 14",
    paymentMethod: "Not applicable", legalEntity: "Northwind Digital Inc.", recurring: false, owner: "Sofia Reed", lastEvent: "Voided Jul 19 · duplicate billing event",
    items: [{ id: "li-18", sku: "LEGACY", description: "Legacy service adjustment", quantity: 1, rate: 2000, taxRate: 5 }],
  },
];
const months=["Mar","Apr","May","Jun","Jul","Aug"];
const FINANCE_REPORTS={
    eyebrow: "Finance · Reports",
    title: "Finance Reports",
    description: "Review financial performance, liquidity, aging, spend and close readiness without expanding the global sidebar.",
    exportPrefix: "finance-report",
    reports: [
      {
        id: "summary",
        title: "Finance Summary",
        description: "Executive finance posture across revenue, cash, receivables, payables and close controls.",
        metrics: [
          { label: "Revenue", value: "$289K", detail: "+12.8% vs previous period", tone: "success" },
          { label: "Net cash flow", value: "+$117K", detail: "Operating inflow less outflow", tone: "primary" },
          { label: "Open receivables", value: "$83.1K", detail: "18 invoices require collection", tone: "warning" },
          { label: "Close readiness", value: "86%", detail: "18 of 21 controls ready", tone: "info" },
        ],
        seriesLabel: "Monthly revenue",
        series: months.map((label, index) => ({ label, value: [218, 231, 246, 258, 271, 289][index], display: `$${[218, 231, 246, 258, 271, 289][index]}K` })),
        breakdownLabel: "Operating focus",
        breakdown: [
          { label: "Receivables", value: "$83.1K", detail: "Aging and collections", status: "Review", tone: "warning" },
          { label: "Payables", value: "$61.8K", detail: "Approved and scheduled", status: "On track", tone: "success" },
          { label: "Processor settlement", value: "$142K", detail: "Pending bank match", status: "Monitor", tone: "info" },
          { label: "Close controls", value: "18 / 21", detail: "Three actions remain", status: "Review", tone: "warning" },
        ],
      },
      {
        id: "profit-loss",
        title: "Profit & Loss",
        description: "Revenue, cost structure, operating expense and profitability for management reporting.",
        metrics: [
          { label: "Revenue", value: "$289K", detail: "+12.8%", tone: "success" },
          { label: "Gross profit", value: "$210K", detail: "72.7% gross margin", tone: "primary" },
          { label: "Operating expense", value: "$101K", detail: "+4.1%", tone: "info" },
          { label: "Net profit", value: "$109K", detail: "37.7% margin", tone: "success" },
        ],
        seriesLabel: "Net profit trend",
        series: months.map((label, index) => ({ label, value: [72, 78, 86, 92, 99, 109][index], display: `$${[72, 78, 86, 92, 99, 109][index]}K` })),
        breakdownLabel: "P&L lines",
        breakdown: [
          { label: "Revenue", value: "$289K", detail: "Recognized revenue", status: "+12.8%", tone: "success" },
          { label: "Cost of revenue", value: "$79K", detail: "Direct delivery costs", status: "+6.1%", tone: "info" },
          { label: "Operating expenses", value: "$101K", detail: "Operating cost base", status: "+4.1%", tone: "info" },
          { label: "Net profit", value: "$109K", detail: "After operating costs", status: "+29.8%", tone: "success" },
        ],
      },
      {
        id: "cash-flow",
        title: "Cash Flow",
        description: "Operating inflows, outflows, liquidity and net cash generation across finance accounts.",
        metrics: [
          { label: "Opening cash", value: "$1.72M", detail: "Period opening balance", tone: "primary" },
          { label: "Cash inflow", value: "$301K", detail: "+7.1%", tone: "success" },
          { label: "Cash outflow", value: "$184K", detail: "+4.5%", tone: "info" },
          { label: "Net cash flow", value: "+$117K", detail: "+11.4%", tone: "success" },
        ],
        seriesLabel: "Net cash generation",
        series: months.map((label, index) => ({ label, value: [75, 80, 89, 97, 105, 117][index], display: `$${[75, 80, 89, 97, 105, 117][index]}K` })),
        breakdownLabel: "Liquidity accounts",
        breakdown: [
          { label: "Operating", value: "$1.18M", detail: "Primary operating account", status: "Healthy", tone: "success" },
          { label: "Reserve", value: "$420K", detail: "Liquidity reserve", status: "Healthy", tone: "success" },
          { label: "Regional", value: "$201K", detail: "Multi-currency operating balance", status: "Healthy", tone: "success" },
          { label: "Payouts", value: "$56K", detail: "Near-term payout funding", status: "Review", tone: "warning" },
        ],
      },
      {
        id: "receivables",
        title: "Receivables Aging",
        description: "Outstanding customer balances grouped by collection age and follow-up priority.",
        metrics: [
          { label: "Open balance", value: "$83.1K", detail: "Across 18 invoices", tone: "warning" },
          { label: "Current", value: "$42.8K", detail: "Not yet overdue", tone: "success" },
          { label: "31–60 days", value: "$18.7K", detail: "Collection attention", tone: "warning" },
          { label: "60+ days", value: "$7.4K", detail: "Escalation required", tone: "destructive" },
        ],
        seriesLabel: "Aging exposure",
        series: [
          { label: "Current", value: 43, display: "$42.8K" },
          { label: "1–30", value: 14, display: "$14.2K" },
          { label: "31–60", value: 19, display: "$18.7K" },
          { label: "61–90", value: 8, display: "$7.8K" },
          { label: "90+", value: 7, display: "$7.4K" },
        ],
        breakdownLabel: "Collection queues",
        breakdown: [
          { label: "Current", value: "$42.8K", detail: "8 invoices", status: "Healthy", tone: "success" },
          { label: "1–30 days", value: "$14.2K", detail: "4 invoices", status: "Monitor", tone: "info" },
          { label: "31–60 days", value: "$18.7K", detail: "4 invoices", status: "Review", tone: "warning" },
          { label: "60+ days", value: "$7.4K", detail: "2 invoices", status: "Escalate", tone: "destructive" },
        ],
      },
      {
        id: "payables",
        title: "Payables Aging",
        description: "Supplier and operating obligations grouped by due window, approval and funding readiness.",
        metrics: [
          { label: "Open payables", value: "$61.8K", detail: "14 obligations", tone: "warning" },
          { label: "Due this week", value: "$24.6K", detail: "6 obligations", tone: "info" },
          { label: "Approved", value: "$47.2K", detail: "Ready for schedule", tone: "success" },
          { label: "Blocked", value: "$6.8K", detail: "Needs owner action", tone: "destructive" },
        ],
        seriesLabel: "Due exposure",
        series: [
          { label: "0–7d", value: 25, display: "$24.6K" },
          { label: "8–14d", value: 15, display: "$14.8K" },
          { label: "15–30d", value: 14, display: "$13.7K" },
          { label: "30+d", value: 9, display: "$8.7K" },
        ],
        breakdownLabel: "Payable status",
        breakdown: [
          { label: "Approved", value: "$47.2K", detail: "Funding scheduled", status: "Ready", tone: "success" },
          { label: "Pending approval", value: "$7.8K", detail: "Owner review", status: "Review", tone: "warning" },
          { label: "Blocked", value: "$6.8K", detail: "Missing match or evidence", status: "Blocked", tone: "destructive" },
        ],
      },
      {
        id: "spend",
        title: "Spend & Expenses",
        description: "Operating spend, vendor concentration and budget pacing across accountable cost owners.",
        metrics: [
          { label: "Operating spend", value: "$184K", detail: "+4.5%", tone: "info" },
          { label: "Budget consumed", value: "71%", detail: "Current period", tone: "primary" },
          { label: "Largest category", value: "Cloud", detail: "$62.4K", tone: "warning" },
          { label: "Savings identified", value: "$18.6K", detail: "Approved opportunities", tone: "success" },
        ],
        seriesLabel: "Monthly operating spend",
        series: months.map((label, index) => ({ label, value: [151, 158, 162, 170, 176, 184][index], display: `$${[151, 158, 162, 170, 176, 184][index]}K` })),
        breakdownLabel: "Spend categories",
        breakdown: [
          { label: "Cloud & infrastructure", value: "$62.4K", detail: "34% of spend", status: "Review", tone: "warning" },
          { label: "People operations", value: "$48.1K", detail: "26% of spend", status: "On plan", tone: "success" },
          { label: "Sales & marketing", value: "$39.6K", detail: "22% of spend", status: "On plan", tone: "success" },
          { label: "Software & services", value: "$33.9K", detail: "18% of spend", status: "Monitor", tone: "info" },
        ],
      },
      {
        id: "tax-close",
        title: "Tax & Close",
        description: "Month-end control readiness, reconciliation status and reporting evidence for finance close.",
        metrics: [
          { label: "Close readiness", value: "86%", detail: "18 of 21 controls", tone: "warning" },
          { label: "Reconciled accounts", value: "24 / 27", detail: "Three remain", tone: "info" },
          { label: "Tax review", value: "Ready", detail: "Current filing pack", tone: "success" },
          { label: "Open exceptions", value: "3", detail: "Owned and tracked", tone: "warning" },
        ],
        seriesLabel: "Close completion",
        series: [
          { label: "Day 1", value: 24, display: "24%" },
          { label: "Day 2", value: 46, display: "46%" },
          { label: "Day 3", value: 63, display: "63%" },
          { label: "Day 4", value: 78, display: "78%" },
          { label: "Day 5", value: 86, display: "86%" },
        ],
        breakdownLabel: "Close workstreams",
        breakdown: [
          { label: "Bank reconciliation", value: "8 / 8", detail: "All accounts matched", status: "Ready", tone: "success" },
          { label: "Revenue controls", value: "5 / 6", detail: "One variance review", status: "Review", tone: "warning" },
          { label: "Payables accrual", value: "4 / 5", detail: "One vendor estimate", status: "Review", tone: "warning" },
          { label: "Tax pack", value: "Ready", detail: "Evidence attached", status: "Ready", tone: "success" },
        ],
      },
    ],
  };

function route(){return document.body?.dataset.currentRoute||""}
function root(){return document.querySelector("#main-content")}
function byText(scope,selector,text){return [...(scope||document).querySelectorAll(selector)].find(el=>el.textContent.trim()===text)}
function invoiceById(id){return INVOICE_DATA.find(x=>x.id===id)||INVOICE_DATA[0]}
function requestedInvoice(){let id=document.body?.dataset.d2FinanceInvoice||"";try{id=id||new URL(location.href).searchParams.get("invoice")||""}catch{}return invoiceById(id)}
function money(n,currency="USD",fraction=false){return new Intl.NumberFormat("en-US",{style:"currency",currency,maximumFractionDigits:fraction?2:0,minimumFractionDigits:fraction?2:0}).format(Number(n??0))}
function csvCell(v){return `"${String(v??"").replaceAll('"','""')}"`}
function financeDownloadCsv(filename,rows){const csv=rows.map(row=>row.map(csvCell).join(",")).join("\n"),blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),0)}
const exportColumns=["Invoice","Customer","Source","Source reference","Status","Billing model","Issue date","Due date","Currency","Total","Paid","Balance","Owner"];
function invoiceRows(records){return [exportColumns,...records.map(x=>[x.number,x.customer,x.sourceModule,x.sourceReference,x.status,x.billingModel,x.issueDate,x.dueDate,x.currency,x.total,x.amountPaid,x.balanceDue,x.owner])]}
function setBadgeTone(el,status){if(!el)return;const all=["bg-primary/10","text-primary","bg-info/10","text-info","bg-success/10","text-success","bg-destructive/10","text-destructive","bg-warning/15","text-warning-foreground","dark:text-warning","bg-muted","text-muted-foreground"];el.classList.remove(...all);const map={issued:["bg-primary/10","text-primary"],sent:["bg-info/10","text-info"],viewed:["bg-info/10","text-info"],partial:["bg-warning/15","text-warning-foreground","dark:text-warning"],paid:["bg-success/10","text-success"],overdue:["bg-destructive/10","text-destructive"],draft:["bg-muted","text-muted-foreground"],void:["bg-muted","text-muted-foreground"]};el.classList.add(...(map[status]||map.draft));}
function setSelect(sel,value,emit=false){if(!sel)return;sel.dataset.value=value;const val=sel.querySelector("[data-select-value]"),opts=[...sel.querySelectorAll("[data-select-option]")],opt=opts.find(o=>(o.dataset.value||o.textContent.trim())===value);opts.forEach(o=>o.setAttribute("aria-selected",String(o===opt)));if(val&&opt)val.textContent=opt.dataset.label||opt.textContent.trim();if(emit)sel.dispatchEvent(new CustomEvent("vexlora:select",{detail:{value}}));}
function fieldByLabel(scope,label){const l=[...scope.querySelectorAll("label")].find(x=>x.textContent.trim()===label);return l?.parentElement?.querySelector("input,textarea,[data-select]")||null}
function valueAfterLabel(scope,label,tag="p"){const lab=[...scope.querySelectorAll(tag)].find(x=>x.textContent.trim()===label);return lab?.nextElementSibling||null}
function printButtons(scope){[...scope.querySelectorAll("button")].filter(b=>/Print \/|Print \/ save PDF/.test(b.textContent.trim())).forEach(b=>b.addEventListener("click",()=>window.print()));}

function initInvoiceTable(){const r=route();if(!["/finance/invoices","/finance/invoices/drafts","/finance/invoices/pending","/finance/invoices/overdue","/finance/invoices/partial","/finance/invoices/paid"].includes(r))return;const main=root(),card=[...main.querySelectorAll("table")].map(t=>t.closest(".overflow-hidden.rounded-lg.border.border-border.bg-card")).find(Boolean);const table=card?.querySelector("table"),tbody=table?.tBodies[0];if(!card||!table||!tbody)return;const selected=new Set();const rowId=row=>row.querySelector('button[aria-label^="Select row "]')?.getAttribute("aria-label")?.replace("Select row ","")||"";const allButtons=id=>[...card.querySelectorAll(`button[aria-label="Select row ${id}"]`)];let bulk=null;
 const paintButton=(b,on)=>{b.setAttribute("aria-checked",String(on));b.dataset.state=on?"checked":"unchecked";const ind=b.querySelector("[data-indicator]");if(ind)ind.hidden=!on;};
 const renderBulk=()=>{bulk?.remove();bulk=null;if(!selected.size)return;bulk=document.createElement("div");bulk.dataset.d2FinanceBulk="true";bulk.className="flex flex-col gap-3 border-b border-border bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between";bulk.innerHTML=`<p class="text-sm font-semibold text-primary">${selected.size} selected</p><div class="flex flex-wrap items-center gap-2"><button type="button" class="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold shadow-xs">Send reminder</button><button type="button" data-d2-finance-selection-export class="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold shadow-xs">Export</button></div>`;card.children[0].after(bulk);bulk.querySelector("[data-d2-finance-selection-export]").addEventListener("click",()=>financeDownloadCsv("invoice-selection.csv",invoiceRows(INVOICE_DATA.filter(x=>selected.has(x.id)))));};
 const setId=(id,on)=>{if(!id)return;if(on)selected.add(id);else selected.delete(id);allButtons(id).forEach(b=>paintButton(b,on));[...tbody.rows].forEach(row=>{if(rowId(row)===id)row.dataset.state=on?"selected":""});renderBulk();};
 card.querySelectorAll('button[aria-label^="Select row "]').forEach(b=>b.addEventListener("click",()=>setTimeout(()=>{const id=b.getAttribute("aria-label").replace("Select row ","");setId(id,!selected.has(id));syncAll();},0)));
 const selectAll=table.querySelector('thead button[aria-label="Select all rows on current page"]');function visibleRows(){return [...tbody.rows].filter(row=>!row.hidden&&rowId(row))}function syncAll(){if(!selectAll)return;const ids=visibleRows().map(rowId),count=ids.filter(id=>selected.has(id)).length,all=ids.length>0&&count===ids.length;selectAll.setAttribute("aria-checked",all?"true":count?"mixed":"false");selectAll.dataset.state=all?"checked":count?"indeterminate":"unchecked";}
 selectAll?.addEventListener("click",()=>setTimeout(()=>{const ids=visibleRows().map(rowId),turnOn=!ids.every(id=>selected.has(id));ids.forEach(id=>setId(id,turnOn));syncAll();},0));
 tbody.querySelectorAll('button[aria-label="Expand row"],button[aria-label="Collapse row"]').forEach(btn=>btn.addEventListener("click",()=>{const tr=btn.closest("tr"),id=rowId(tr),inv=invoiceById(id),existing=tr.nextElementSibling?.dataset?.d2FinanceExpanded==="true"?tr.nextElementSibling:null;if(existing){existing.remove();btn.setAttribute("aria-label","Expand row");return;}const ex=document.createElement("tr");ex.dataset.d2FinanceExpanded="true";ex.className="hover:bg-transparent";const td=document.createElement("td");td.colSpan=tr.cells.length;td.className="bg-muted/30 p-5";td.innerHTML=`<div class="grid gap-4 sm:grid-cols-4"><div><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Source</p><p class="mt-1 font-semibold">${inv.sourceModule}</p><p class="text-compact text-muted-foreground">${inv.sourceReference}</p></div><div><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paid</p><p class="mt-1 font-semibold tabular-nums">${inv.currency} ${inv.amountPaid.toLocaleString()}</p></div><div><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Balance</p><p class="mt-1 font-semibold tabular-nums">${inv.currency} ${inv.balanceDue.toLocaleString()}</p></div><div><p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line items</p><p class="mt-1 text-sm">${inv.items.length} item${inv.items.length===1?"":"s"}</p></div></div>`;ex.append(td);tr.after(ex);btn.setAttribute("aria-label","Collapse row");}));
 main.dataset.d2FinanceTable="ready";
}

const createDefaults={customer:"",customerReference:"",email:"",billingAddress:"",legalEntity:"Northwind Digital Inc.",issueDate:"2026-08-20",dueDate:"2026-09-04",currency:"USD",sourceModule:"Manual",sourceReference:"",invoiceType:"One-time",purchaseOrder:"",collectionMethod:"Send invoice",paymentTerms:"Net 15",recurringCadence:"Not recurring",items:[{description:"",sku:"",quantity:1,rate:0,discountPct:0,taxRate:5}],invoiceDiscountPct:0,additionalFees:0,notes:"",footer:"Thank you for your business."};
const editDefaults={customer:"Northstar Labs",customerReference:"ACCT-NS-104",email:"ap@northstarlabs.io",billingAddress:"500 Market Street, San Francisco, CA, USA",legalEntity:"Northwind Digital Inc.",issueDate:"2026-08-18",dueDate:"2026-09-02",currency:"USD",sourceModule:"CRM",sourceReference:"DEAL-2048 / QUO-1872",invoiceType:"One-time",purchaseOrder:"PO-NS-8814",collectionMethod:"Send invoice",paymentTerms:"Net 15",recurringCadence:"Not recurring",items:[{description:"Enterprise implementation package",sku:"ENT-IMP",quantity:1,rate:18000,discountPct:5,taxRate:5},{description:"Administrator enablement",sku:"TRAIN-ADV",quantity:2,rate:3000,discountPct:5,taxRate:5}],invoiceDiscountPct:0,additionalFees:0,notes:"Please reference the invoice number and PO on remittance advice.",footer:"Payment questions: billing@example.com"};
function initInvoiceEditor(){const r=route();if(!["/finance/invoices/create","/finance/invoices/edit"].includes(r))return;const main=root(),form=main?.querySelector("form");if(!form)return;const mode=r.endsWith("/edit")?"edit":"create",defaults=mode==="edit"?editDefaults:createDefaults;const lineSection=[...form.querySelectorAll("section")].find(s=>s.querySelector("h3")?.textContent.trim()==="Line items"),host=lineSection?.querySelector(".grid.gap-3"),firstCard=host?.querySelector(".rounded-xl.border.border-border.p-4"),template=firstCard?.cloneNode(true),add=byText(lineSection,"button","Add line item"),summaryTitle=[...form.querySelectorAll("h3")].find(h=>h.textContent.includes("Invoice summary")),summaryCard=summaryTitle?.closest(".rounded-lg.border"),summaryRows=summaryCard?[...summaryCard.querySelectorAll(".flex.items-center.justify-between")]:[];if(!host||!template)return;
 let itemScope=0;
 function itemCards(){return [...host.querySelectorAll(".rounded-xl.border.border-border.p-4")]}function assignCard(card,item,index){
 if(!card.dataset.itemScope){
  card.dataset.itemScope=String(++itemScope);const ids=new Map();
  card.querySelectorAll('[id]').forEach(el=>{const old=el.id;el.id=old+'-invoice-item-'+itemScope;ids.set(old,el.id);});
  card.querySelectorAll('[for],[aria-describedby],[aria-labelledby],[aria-controls]').forEach(el=>{
   for(const attr of ['for','aria-describedby','aria-labelledby','aria-controls'])if(el.hasAttribute(attr))el.setAttribute(attr,el.getAttribute(attr).split(/\s+/).map(id=>ids.get(id)||id).join(' '));
  });
 }
 const inputs=[...card.querySelectorAll("input")],labels=[...card.querySelectorAll("label")].map(l=>l.textContent.trim());const map={Description:"description","SKU / code":"sku",Qty:"quantity",Rate:"rate","Line discount %":"discountPct","Tax %":"taxRate"};labels.forEach((lab,i)=>{const l=[...card.querySelectorAll("label")].find(x=>x.textContent.trim()===lab),input=l?.parentElement?.querySelector("input");const key=map[lab];if(!input||!key)return;input.dataset.d2ItemField=key;input.name=`items.${index}.${key}`;input.value=String(item[key]??"");});const rem=card.querySelector('button[aria-label^="Remove line item"]');if(rem){rem.setAttribute("aria-label",`Remove line item ${index+1}`);rem.disabled=false;rem.addEventListener("click",()=>{if(itemCards().length<=1)return;card.remove();renumber();calc();});}inputs.forEach(i=>i.addEventListener("input",calc));}
 function renumber(){itemCards().forEach((c,i)=>{const values=readItem(c);assignNamesOnly(c,i);const rem=c.querySelector('button[aria-label^="Remove line item"]');if(rem){rem.setAttribute("aria-label",`Remove line item ${i+1}`);rem.disabled=itemCards().length===1;}})}function assignNamesOnly(card,index){card.querySelectorAll("input[data-d2-item-field]").forEach(i=>i.name=`items.${index}.${i.dataset.d2ItemField}`)}
 function readItem(card){const v=k=>card.querySelector(`[data-d2-item-field="${k}"]`)?.value||"";return{description:v("description"),sku:v("sku"),quantity:Number(v("quantity")||1),rate:Number(v("rate")||0),discountPct:Number(v("discountPct")||0),taxRate:Number(v("taxRate")||0)}}
 function rebuild(items){itemCards().forEach(c=>c.remove());items.forEach((item,index)=>{const c=template.cloneNode(true);assignCard(c,item,index);host.append(c)});renumber()}
 const scalar={Customer:"customer","Customer ID / account":"customerReference","Billing email":"email","Legal entity":"legalEntity","Issue date":"issueDate","Due date":"dueDate","Billing address":"billingAddress","Source reference":"sourceReference","PO / contract":"purchaseOrder","Invoice discount %":"invoiceDiscountPct","Fees / shipping":"additionalFees","Customer notes":"notes","Invoice footer":"footer"};
 function hydrate(d){Object.entries(scalar).forEach(([label,key])=>{const f=fieldByLabel(form,label);if(f&&!(f instanceof HTMLElement&&f.dataset.select!==undefined))f.value=String(d[key]??"");});[["Currency","currency"],["Source module","sourceModule"],["Invoice type","invoiceType"],["Collection method","collectionMethod"],["Payment terms","paymentTerms"],["Recurring cadence","recurringCadence"]].forEach(([label,key])=>setSelect(fieldByLabel(form,label),d[key]));rebuild(d.items);clearErrors();removeSuccess();calc();}
 function numbers(){const cards=itemCards(),items=cards.map(readItem),gross=items.reduce((s,x)=>s+x.quantity*x.rate,0),lineDiscount=items.reduce((s,x)=>{const g=x.quantity*x.rate;return s+g*x.discountPct/100},0),net=gross-lineDiscount,invDiscPct=Number(fieldByLabel(form,"Invoice discount %")?.value||0),invDisc=net*invDiscPct/100,tax=items.reduce((s,x)=>{const g=x.quantity*x.rate,n=g-g*x.discountPct/100;return s+n*x.taxRate/100},0),fees=Number(fieldByLabel(form,"Fees / shipping")?.value||0),total=Math.max(0,net-invDisc+tax+fees);return{gross,lineDiscount,invDiscPct,invDisc,tax,fees,total}}
 function calc(){const cur=fieldByLabel(form,"Currency")?.dataset.value||"USD",n=numbers(),vals=[n.gross,-n.lineDiscount,-n.invDisc,n.tax,n.fees,n.total],labels=["Gross subtotal","Line discounts",`Invoice discount (${n.invDiscPct}%)`,"Tax","Fees / shipping","Invoice total"];summaryRows.forEach((row,i)=>{const sp=row.querySelectorAll("span");if(sp[0])sp[0].textContent=labels[i];if(sp[1])sp[1].textContent=money(vals[i],cur,true)});main.dataset.d2FinanceTotal=String(n.total)}
 function clearErrors(){form.querySelectorAll("[data-d2-finance-error]").forEach(x=>x.remove());form.querySelectorAll('[aria-invalid="true"]').forEach(x=>x.removeAttribute("aria-invalid"));}
 function err(field,msg){if(!field)return;field.setAttribute("aria-invalid","true");const p=document.createElement("p");p.dataset.d2FinanceError="true";p.className="text-sm font-medium text-destructive";p.textContent=msg;(field.closest(".grid.gap-2")||field.parentElement).append(p)}
 function validate(){clearErrors();let ok=true;const req=(label,min,msg)=>{const f=fieldByLabel(form,label),v=f?.value.trim()||"";if(v.length<min){err(f,msg);ok=false}};req("Customer",2,"Customer is required.");const email=fieldByLabel(form,"Billing email"),ev=email?.value.trim()||"";if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(ev)){err(email,"Enter a valid billing email.");ok=false}req("Billing address",5,"Billing address is required.");req("Legal entity",2,"Legal entity is required.");const issue=fieldByLabel(form,"Issue date"),due=fieldByLabel(form,"Due date");if(!issue?.value){err(issue,"Issue date is required.");ok=false}if(!due?.value){err(due,"Due date is required.");ok=false}else if(issue?.value&&due.value<issue.value){err(due,"Due date must be on or after the issue date.");ok=false}const type=fieldByLabel(form,"Invoice type")?.dataset.value,cad=fieldByLabel(form,"Recurring cadence");if(type==="Recurring"&&cad?.dataset.value==="Not recurring"){err(cad?.querySelector("[data-select-trigger]"),"Choose a cadence for recurring invoices.");ok=false}itemCards().forEach(c=>{const x=readItem(c);if(x.description.trim().length<2){err(c.querySelector('[data-d2-item-field="description"]'),"Description is required.");ok=false}if(!(x.quantity>0)){err(c.querySelector('[data-d2-item-field="quantity"]'),"Quantity must be greater than zero.");ok=false}if(x.rate<0){err(c.querySelector('[data-d2-item-field="rate"]'),"Rate cannot be negative.");ok=false}if(x.discountPct<0||x.discountPct>100){err(c.querySelector('[data-d2-item-field="discountPct"]'),"Discount must be 0–100%.");ok=false}if(x.taxRate<0||x.taxRate>30){err(c.querySelector('[data-d2-item-field="taxRate"]'),"Tax must be 0–30%.");ok=false}});return ok}
 function removeSuccess(){main.querySelector("[data-d2-finance-success]")?.remove()}function success(){removeSuccess();const a=document.createElement("div");a.dataset.d2FinanceSuccess="true";a.setAttribute("role","alert");a.className="rounded-lg border border-success/30 bg-success/10 p-4 text-success";a.innerHTML='<p class="font-semibold">Invoice validated</p><p class="mt-1 text-sm">The billing record is validated and totals are calculated locally. Connect the repository/API adapter to persist, finalize, email or collect payment.</p>';form.before(a)}
 add?.addEventListener("click",()=>{if(itemCards().length>=25)return;const c=template.cloneNode(true);assignCard(c,{description:"",sku:"",quantity:1,rate:0,discountPct:0,taxRate:5},itemCards().length);host.append(c);renumber();calc()});
 form.addEventListener("input",e=>{if(e.target.matches("input,textarea"))calc()});form.querySelectorAll("[data-select]").forEach(s=>s.addEventListener("vexlora:select",calc));byText(form,"button","Reset")?.addEventListener("click",()=>setTimeout(()=>hydrate(defaults),0));form.addEventListener("submit",e=>{e.preventDefault();removeSuccess();if(validate()){success();main.dataset.d2FinanceValidated="true"}else main.dataset.d2FinanceValidated="false"});hydrate(defaults);main.dataset.d2FinanceEditor="ready";
}

function renderItems(container,invoice,preview=false){if(!container)return;const header=container.firstElementChild,template=header?.nextElementSibling?.cloneNode(true);if(!template)return;[...container.children].slice(1).forEach(x=>x.remove());invoice.items.forEach(item=>{const row=template.cloneNode(true),sp=row.querySelectorAll("span"),gross=item.quantity*item.rate,net=gross-gross*((item.discountPct||0)/100),vals=preview?[item.sku||"—",item.description,item.quantity,`${invoice.currency} ${item.rate.toLocaleString()}`,`${invoice.currency} ${net.toLocaleString()}`]:[item.sku||"—",item.description,item.quantity,`${invoice.currency} ${item.rate.toLocaleString()}`,`${item.discountPct||0}%`,`${invoice.currency} ${net.toLocaleString()}`];sp.forEach((x,i)=>{if(vals[i]!==undefined)x.textContent=String(vals[i])});container.append(row)});}
function hydrateDetails(){if(route()!=="/finance/invoices/details")return;const main=root(),x=requestedInvoice();if(!main)return;main.querySelector("h1").textContent=x.number;const customer=[...main.querySelectorAll("h3")].find(h=>h.textContent.trim()==="Summit Digital")||main.querySelector("h3");if(customer){customer.textContent=x.customer;const email=customer.nextElementSibling;if(email)email.textContent=x.email;const card=customer.closest(".rounded-lg.border"),badges=card?[...card.querySelectorAll("span.inline-flex")]:[];if(badges[0])badges[0].textContent=x.sourceModule;if(badges[1]){badges[1].textContent=x.status;setBadgeTone(badges[1],x.status)}}[["Issue date",x.issueDate],["Due date",x.dueDate],["Owner",x.owner],["Source",x.sourceModule],["Source reference",x.sourceReference],["Billing model",x.billingModel],["Terms",x.paymentTerms],["PO / buyer ref",x.purchaseOrder||"—"],["Billing entity",x.legalEntity]].forEach(([l,v])=>{const el=valueAfterLabel(main,l);if(el)el.textContent=v});const sku=[...main.querySelectorAll("span")].find(s=>s.textContent.trim()==="SKU");renderItems(sku?.parentElement?.parentElement,x,false);const totalTitle=[...main.querySelectorAll("h3")].find(h=>h.textContent.trim()==="Invoice total"),totalCard=totalTitle?.closest(".rounded-lg.border");if(totalTitle?.nextElementSibling)totalTitle.nextElementSibling.textContent=`${x.currency} · ${x.billingModel}`;[["Subtotal",x.subtotal],["Discount",-x.discount],["Tax",x.tax],["Fees",x.fees],["Total",x.total]].forEach(([l,v])=>{const lab=[...(totalCard||main).querySelectorAll("span")].find(s=>s.textContent.trim()===l);if(lab?.nextElementSibling)lab.nextElementSibling.textContent=`${x.currency} ${Number(v).toLocaleString()}`});const coll=[...main.querySelectorAll("h3")].find(h=>h.textContent.includes("Collection status"))?.closest(".rounded-lg.border");const desc=coll?.querySelector("h3")?.nextElementSibling;if(desc)desc.textContent=`${x.collectionMethod} · ${x.paymentMethod}`;[["Amount paid",x.amountPaid],["Balance due",x.balanceDue]].forEach(([l,v])=>{const lab=[...(coll||main).querySelectorAll("span")].find(s=>s.textContent.trim()===l);if(lab?.nextElementSibling)lab.nextElementSibling.textContent=`${x.currency} ${Number(v).toLocaleString()}`});main.querySelectorAll('a[href*="/edit/index.html"],a[href*="/preview/index.html"]').forEach(a=>{a.href=a.href.replace(/([?&]invoice=)[^&]+/,'$1'+x.id);if(!/[?&]invoice=/.test(a.href))a.href+=(a.href.includes('?')?'&':'?')+'invoice='+x.id});printButtons(main);main.dataset.d2FinanceInvoice=x.id;}
function hydratePreview(){if(route()!=="/finance/invoices/preview")return;const main=root(),x=requestedInvoice();if(!main)return;const ps=[...main.querySelectorAll("p")];const invoiceNo=ps.find(p=>p.textContent.trim()==="INV-9044")||ps.find(p=>/^INV-/.test(p.textContent.trim()));if(invoiceNo)invoiceNo.textContent=x.number;const status=invoiceNo?.nextElementSibling;if(status){status.textContent=x.status;setBadgeTone(status,x.status)}const entity=ps.find(p=>p.textContent.trim()==="Northwind Digital Inc.");if(entity)entity.textContent=x.legalEntity;[["Bill to",x.customer],["Issued",x.issueDate],["Due",x.dueDate],["Source",x.sourceModule],["Reference",x.sourceReference],["Terms",x.paymentTerms]].forEach(([l,v])=>{const lab=ps.find(p=>p.textContent.trim()===l);const next=lab?.nextElementSibling;if(next)next.textContent=v;if(l==="Bill to"&&next?.nextElementSibling)next.nextElementSibling.textContent=x.email});const sku=[...main.querySelectorAll("span")].find(s=>s.textContent.trim()==="SKU");renderItems(sku?.parentElement?.parentElement,x,true);[["Subtotal",x.subtotal],["Discount",-x.discount],["Tax",x.tax],["Fees",x.fees],["Total",x.total]].forEach(([l,v])=>{const lab=[...main.querySelectorAll("span")].find(s=>s.textContent.trim()===l);if(lab?.nextElementSibling)lab.nextElementSibling.textContent=`${x.currency} ${Number(v).toLocaleString()}`});const pm=ps.find(p=>p.textContent.trim()==="Payment method");if(pm?.nextElementSibling)pm.nextElementSibling.textContent=x.collectionMethod;if(pm?.nextElementSibling?.nextElementSibling)pm.nextElementSibling.nextElementSibling.textContent=x.paymentMethod;const bal=ps.find(p=>p.textContent.trim()==="Balance due");if(bal?.nextElementSibling)bal.nextElementSibling.textContent=`${x.currency} ${x.balanceDue.toLocaleString()}`;printButtons(main);main.dataset.d2FinanceInvoice=x.id;}
function initOverview(){if(route()!=="/finance/invoices/overview")return;const main=root(),b=byText(main,"button","Export CSV");b?.addEventListener("click",()=>{financeDownloadCsv("vexlora-invoices.csv",invoiceRows(INVOICE_DATA));main.dataset.d2FinanceOverviewExport="true"});}
const toneClass={success:"bg-success/10 text-success",primary:"bg-primary/10 text-primary",warning:"bg-warning/15 text-warning-foreground dark:text-warning",info:"bg-info/10 text-info",destructive:"bg-destructive/10 text-destructive"};const badgeClass=toneClass;
function replaceTone(el,map,tone){if(!el)return;Object.values(map).flatMap(x=>x.split(" ")).forEach(c=>el.classList.remove(c));String(map[tone]||map.primary).split(" ").forEach(c=>el.classList.add(c));}
function initReports(){if(route()!=="/finance/reports")return;const main=root(),aside=main?.querySelector('aside[aria-label="Finance Reports navigation"]'),section=aside?.nextElementSibling;if(!aside||!section)return;const reports=FINANCE_REPORTS.reports,rail=[...aside.querySelectorAll("nav > button")],header=section.children[0],metrics=section.children[1],lower=section.children[2],trend=lower?.children[0],breakCard=lower?.children[1],trendContent=trend?.querySelector(".space-y-4"),breakContent=breakCard?.querySelector(".divide-y"),trendTemplate=trendContent?.firstElementChild?.cloneNode(true),breakTemplate=breakContent?.firstElementChild?.cloneNode(true);let selected=reports[0];function render(rep){selected=rep;rail.forEach((b,i)=>{const active=reports[i]===rep;b.setAttribute("aria-current",active?"page":"false");b.classList.toggle("bg-primary/10",active);b.classList.toggle("text-primary",active)});const h=header.querySelector("h2"),d=header.querySelector("p");if(h)h.textContent=rep.title;if(d)d.textContent=rep.description;[...metrics.children].forEach((card,i)=>{const m=rep.metrics[i],ps=card.querySelectorAll("p");if(!m)return;if(ps[0])ps[0].textContent=m.label;if(ps[1])ps[1].textContent=m.value;if(ps[2])ps[2].textContent=m.detail;replaceTone(card.querySelector(".flex.size-9"),toneClass,m.tone||"primary")});const tt=trend?.querySelector("h3");if(tt)tt.textContent=rep.seriesLabel;if(trendContent&&trendTemplate){trendContent.replaceChildren();const max=Math.max(...rep.series.map(x=>x.value),1);rep.series.forEach(point=>{const row=trendTemplate.cloneNode(true),sp=row.querySelectorAll("span");if(sp[0])sp[0].textContent=point.label;if(sp[1])sp[1].textContent=point.display;const pct=Math.max(6,Math.round(point.value/max*100)),prog=row.querySelector("[data-progress]"),bar=row.querySelector("[data-progress-indicator]");if(prog){prog.dataset.value=String(pct);prog.setAttribute("aria-valuenow",String(pct))}if(bar)bar.style.transform=`translateX(${pct-100}%)`;trendContent.append(row)})}const bt=breakCard?.querySelector("h3");if(bt)bt.textContent=rep.breakdownLabel;if(breakContent&&breakTemplate){breakContent.replaceChildren();rep.breakdown.forEach(item=>{const row=breakTemplate.cloneNode(true),left=row.firstElementChild,right=row.lastElementChild,lp=left?.querySelectorAll("p"),rp=right?.querySelectorAll("p"),badge=right?.querySelector("span.inline-flex");if(lp?.[0])lp[0].textContent=item.label;if(lp?.[1])lp[1].textContent=item.detail;if(rp?.[0])rp[0].textContent=item.value;if(badge){badge.textContent=item.status;replaceTone(badge,badgeClass,item.tone)}breakContent.append(row)})}main.dataset.d2FinanceReport=rep.id}rail.forEach((b,i)=>b.addEventListener("click",()=>render(reports[i])));byText(main,"button","Export CSV")?.addEventListener("click",()=>{financeDownloadCsv(`${FINANCE_REPORTS.exportPrefix}-${selected.id}.csv`,[["Report",selected.title],["Description",selected.description],[],["Metric","Value","Detail"],...selected.metrics.map(m=>[m.label,m.value,m.detail]),[],[selected.breakdownLabel,"Value","Detail","Status"],...selected.breakdown.map(x=>[x.label,x.value,x.detail,x.status])]);main.dataset.d2FinanceReportExport=selected.id});render(selected);}
export function initD2FinanceInteractions(){initInvoiceTable();initInvoiceEditor();hydrateDetails();hydratePreview();initOverview();initReports();document.documentElement.dataset.d2FinanceReady="true";}
