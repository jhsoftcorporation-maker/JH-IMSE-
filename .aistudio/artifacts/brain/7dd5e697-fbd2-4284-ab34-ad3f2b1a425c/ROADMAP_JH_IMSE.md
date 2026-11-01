# 🚀 JH IMSE - Enterprise Multi-Tenant ERP, Cloud POS & Multi-Company Subscription Platform
**JH Soft Corporation** | Corporate Helpline: `+8801940999830` | Official Platform Suite

---

## 📌 Implementation Master Roadmap & Phase Status

| Phase | Milestone Name | Status | Key Deliverables |
|---|---|---|---|
| **Phase 1** | Core POS, Dual Barcode & 58/80mm Thermal Printer | ✅ **Completed** | POS Counter, Quick Cash, Sound FX, Barcode Generator, Thermal Slip |
| **Phase 2** | Invoicing, Quotations, Challan, Credit Notes & Dual Warehouse | ✅ **Completed** | A4 Tax Invoice, Quotations to Invoice 1-Click, Challan, Credit Note, Stock Transfer |
| **Phase 3** | CRM, Digital Due Ledger (বাকি খাতা) & Bengali SMS Alerts | ✅ **Completed** | Customer Ledger, Debit/Credit Timeline, Bengali SMS, Loyalty Tiers, Payment Receipts |
| **Phase 4** | Kanakku-Grade Super Admin Dashboard & Multi-Company Subscription Hub | ✅ **Completed** | SaaS Executive Hub, Impersonation Mode, License Key Generator, Quotas, Billing, Domains, Broadcast Engine |
| **Phase 5** | HRM, Staff Attendance, Roles & Sales Commission | ⏳ Planned | Staff Profiles, Daily Attendance, Role-based Access (RBAC), Payroll & Commission |
| **Phase 6** | Financial Overview, Expense Tracker & Accounts (হিসাব খাতা) | ⏳ Planned | Cash Flow, Daily/Monthly P&L, Shop Rent/Utility Expenses, Supplier Ledger |
| **Phase 7** | Multi-Store E-Commerce Site Builder & Delivery Engine | ⏳ Planned | Storefront Subdomains, Cart, bKash Gateway, Merchant Order Tracking |
| **Phase 8** | Offline-First PWA, Mobile POS & Cloud Architecture | ⏳ Planned | Service Worker Offline Cache, Background Sync, Multi-Region DB |

---

### ✅ Phase 1: Core POS, Dual Barcode & 58/80mm Thermal Printer (সম্পন্ন)
- **POS Screen (`POSScreen.tsx`):**
  - Instant barcode scan with keyboard Enter support & search by SKU/name/generic.
  - Cash, bKash, Nagad, Card, and Due (বাকি) payment splits.
  - Quick cash presets (৳৫০, ৳১০০, ৳৫০০, ৳১০০০) and change calculation (ফেরত টাকা).
  - Audio feedback for successful scanning and sale completion.
- **Barcode Generator (`BarcodeGeneratorModal.tsx`):**
  - Generates Code128 barcodes and 2D QR codes with product SKU, price, and batch info.
  - Printable sticker sheets (A4 24-up and continuous roll 50x30mm).
- **Thermal Slip Printer (`ThermalReceipt.tsx`):**
  - 58mm & 80mm thermal receipt printing with company logo, Bengali typography, and barcode.

---

### ✅ Phase 2: Invoicing, Quotations, Challan, Credit Notes & Dual Warehouse (সম্পন্ন)
- **Corporate A4 Tax Invoice (`A4InvoiceModal.tsx`):**
  - Bill To, Ship To, Tax/VAT breakdown, Words in Taka (কথায় টাকা), and authorized seals.
- **Quotations / প্রাক্কলন বিল (`QuotationModal.tsx`):**
  - Quotation generation with validity dates and 1-click conversion to sales invoice.
- **Delivery Challans / ডেলিভারি চালান (`DeliveryChallanModal.tsx`):**
  - Transport partner mapping (Sundarban, SA Paribahan, RedX, Steadfast, In-house Rider), carton count, and dispatch status.
- **Credit Notes / বিক্রয় ফেরত (`CreditNoteModal.tsx`):**
  - Returns processing with condition assessment (good for restock, damaged for write-off).
- **Dual Warehouse & Stock Transfer (`StockTransferModal.tsx`):**
  - Inter-branch depot transfer and batch/expiry tracking for pharmaceuticals and perishables.

---

### ✅ Phase 3: CRM & Digital Due Ledger (বাকি খাতা), Customer Statements & SMS Alerts (সম্পন্ন)
- **Customer CRM Hub (`CustomerManager` in `TenantDashboard.tsx`):**
  - Customer categorization: Retail, Wholesale, Corporate, Walk-in.
  - Loyalty tiers: Bronze, Silver, Gold, VIP Platinum.
  - Top spending customer rankings.
- **Digital Due Ledger (`CustomerLedgerModal.tsx`):**
  - Full debit/credit transaction history with running balance.
- **Receive Due Payment (`ReceivePaymentModal.tsx` & `PaymentReceiptModal.tsx`):**
  - Due collection with instant payment receipt generation.
- **Bengali SMS Payment Reminders (`SmsReminderModal.tsx`):**
  - Customizable Bengali SMS templates with 1-click delivery simulation.

---

### ✅ Phase 4: Kanakku-Grade Super Admin Dashboard & Multi-Company Subscription Hub (সম্পন্ন)
- **Executive SaaS Metrics & Hero Overview:**
  - Executive Welcome Banner ("শুভ সকাল, সুপার এডমিন | আজ ১৪টি নতুন কোম্পানি সাবস্ক্রাইব করেছে").
  - Top 4 KPI Stat Cards: Total Registered Companies (৯৮৭ টি, +১৪%), Active Companies (৮৫৪ টি, +৮.৩৬%), Suspended / Grace Period (২৮ টি), Annual Run-Rate ARR (৳ ৫৫,০৭,৬৪০).
  - MRR Target Progress Bar: ৳ ৪,৫৮,৯৭০ (টার্গেট ৳ ১০,০০,০০০, ৪৬% অর্জিত).
  - 3 High-Level Insight Cards: Most Ordered Plan (Enterprise, ২০১ Orders, ৳ ৫,৯৯৯/mo), Top Company (ঢাকা ফ্যাশন, ১২টি ব্রাঞ্চ), Most Users & Storage (Apex Electronics, ৫০ জন ইউজার).
- **Earnings & Income Visual Chart:**
  - Monthly vs. Yearly toggle with Jan-Dec revenue bar graph and hover tooltips.
  - Subscription Plan Distribution (Enterprise 45%, Professional 35%, Starter 15%, Trial 5%).
- **Multi-Tenant Company Management Hub (`SuperAdmin.tsx`):**
  - Search & multi-parameter filter (by Category, Plan Tier, and Status).
  - Impersonate / 1-Click Store Login ("স্টোরে লগইন") with persistent top banner in client dashboard.
  - Plan upgrade/downgrade and subscription status switcher (Active, Grace Period, Suspended, Expired).
- **Resource Quota Management (`EditQuotaModal.tsx`):**
  - Custom allocation of Max Branches, Max Users, Max Products, Monthly Invoices, and Storage GB.
- **Enterprise License Key Generator (`TenantLicenseModal.tsx`):**
  - Cryptographic license key generation (`JHIMSE-XXX-2026-XXXX`).
  - Printable Corporate Software License Certificate with JH Soft Corporation branding.
- **New Tenant Onboarding Modal (`CreateTenantModal.tsx`):**
  - Trade License No., BIN/VAT, subdomains, owner credentials, and warehouse auto-creation.
- **Custom Domains & SSL Verification:**
  - CNAME verification (`cname.jh-imse.shop`), SSL status indicator (256-bit Secured), and approval workflow.
- **SaaS Billing & Transactions Registry:**
  - Payment tracking via bKash, Nagad, Bank Transfer, and Card with invoice numbers and TrxIDs.
- **Global Broadcast Engine:**
  - Real-time broadcast notices (Info, Warning, Maintenance, Critical) with target audience filters.

---

### ✅ Phase 5: HRM, Staff Attendance, Roles & Sales Commission (Completed)
- **Employee Directory & Staff Profiles (`StaffDirectory.tsx`, `AddStaffModal.tsx`):**
  - পূর্ণাঙ্গ প্রোফাইল: নাম, ছবি/অ্যাভাটার, পদবী (Designation), ফোন, এনআইডি/স্মার্টকার্ড (NID), জরুরি যোগাযোগ (Emergency Contact), ঠিকানা, বর্তমান স্ট্যাটাস (Active/On Leave/Inactive)।
  - শাখা/ওয়্যারহাউস বিন্যাস (Branch & Warehouse Assignment)।
  - কার্ড ভিউ ও তালিকা ভিউ টগল, দ্রুত অনুসন্ধান ও পদবী অনুযায়ী ফিল্টারিং।
- **Daily Attendance Clock-In/Clock-Out Tracker (`AttendanceTracker.tsx`):**
  - ক্যালেন্ডার ডেট পিকার দিয়ে যেকোনো দিনের ডিজিটাল উপস্থিতি পর্যবেক্ষণ।
  - ক্লক-ইন (Clock In) ও ক্লক-আউট (Clock Out) টাইমস্ট্যাম্প লগ।
  - হাজিরার ৫টি বাস্তব স্ট্যাটাস: উপস্থিত (Present), দেরি (Late), অর্ধদিবস (Half-Day), ছুটি (On Leave), এবং অনুপস্থিত (Absent)।
  - কাজের সময় ও ওভারটাইম ঘণ্টা গণনা।
  - এক ক্লিকে সকল কর্মচারীকে উপস্থিত মার্ক করার সুবিধা (`Mark All Present`)।
  - উপস্থিতির হার (%) ও দৈনিক অ্যানালিটিক্স কার্ড।
- **Role-Based Access Control / RBAC (`RolePermissionMatrix.tsx`):**
  - পূর্বনির্ধারিত সিস্টেম রোল: Store Owner / Super Admin, Outlet Manager, POS Cashier, Accountant & Tax Auditor, Inventory Auditor, Field Sales Representative।
  - নতুন কাস্টম রোল (Custom Role) তৈরি ও মুছে ফেলার অপশন।
  - ৫টি প্রধান মডিউলে গ্র্যানুলার পারমিশন টগল (POS Billing & Discount, Inventory & Stock Transfer, CRM & Customer Due, Quotations & Delivery Challans, Financials & HRM Settings)।
- **Sales Targets, Commission & Payroll Engine (`PayrollAndCommission.tsx`):**
  - ক্যাশিয়ার ও সেলস টিমের ব্যক্তিগত মাসিক সেলস টার্গেট বনাম অর্জিত সেলসের লাইভ প্রগ্রেস বার ও লিডারবোর্ড।
  - স্বয়ংক্রিয় কমিশন ইঞ্জিন (যেমন: ১.৫%, ২.০% বা ৩.৫% কমিশন ক্যালকুলেশন)।
  - মাসিক পে-রোল ও বেতন ক্যালকুলেটর (মূল বেতন, বাড়িভাড়া, যাতায়াত ও চিকিৎসা ভাতা, ওভারটাইম বোনাস, অনুপস্থিতি জরিমানা, প্রভিডেন্ট ফান্ড ও অগ্রিম বেতন কর্তন)।
  - পরিশোধের মাধ্যম (নগদ / বিকাশ / ব্যাংক) এবং ১-ক্লিকে পেইড স্ট্যাটাস মার্কিং।
- **Official Printable Salary Pay Slip (`SalarySlipModal.tsx`):**
  - কানাক্কু-গ্রেড অফিসিয়াল পে-রোল ভাউচার (`বেতন স্লিপ`)।
  - প্রতিষ্ঠানের নাম, ট্রেড লাইসেন্স, ভ্যাট/ট্যাক্স নম্বর সহ হেডার।
  - উপার্জন বনাম কর্তনের তুলনামূলক ছক ও কথায় প্রদেয় নিট টাকার হিসাব।
  - প্রস্তুতকারক (HR), হিসাব কর্মকর্তা, অনুমোদিত পরিচালক ও কর্মচারীর স্বাক্ষর ব্লক।
  - এক ক্লিকে প্রিন্ট ও PDF ডাউনলোডের ব্যবস্থা।

---

### ⏳ Phase 6: Financial Overview, Expense Tracker & Accounts (হিসাব খাতা)
- **Cash Flow Statement & Daily/Monthly P&L (Profit & Loss).**
- **Category-wise Expense Tracker:**
  - Shop rent, Electricity/utility bills, Staff meal, Transport, Packaging, Marketing.
- **Vendor / Supplier Ledgers:**
  - Supplier purchase orders, accounts payable, and purchase debit notes.

---

### ⏳ Phase 7: Multi-Store E-Commerce Site Builder & Delivery Engine
- **Tenant E-Commerce Storefront:**
  - Personalized online shops (`store.jh-imse.shop` or custom domain).
- **Shopping Cart & Checkout:**
  - Cash on Delivery, bKash checkout, and courier delivery fee calculation.
- **Merchant Order Processing:**
  - Status management (Pending, Accepted, Packing, Shipped, Delivered, Cancelled).

---

### ⏳ Phase 8: Offline-First PWA, Mobile POS & Cloud Architecture
- **PWA Service Worker:**
  - Offline billing capability when internet connection drops.
  - Local IndexedDB storage and automatic cloud synchronization on reconnection.
- **Mobile POS Experience:**
  - Touch-optimized handheld layout for smartphone and tablet cashiers.
