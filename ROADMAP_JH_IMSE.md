# 🚀 JH IMSE - Enterprise Multi-Tenant ERP, Cloud POS & Multi-Company Subscription Platform
**JH Soft Corporation** | Corporate Helpline: `+8801940999830` | Official Platform Suite
**Production Target:** Hostinger Business Web Hosting • MySQL 8.0+ • Node.js / React Full-Stack

---

## 📌 Implementation Master Roadmap & Phase Status

| Phase | Milestone Name | Status | Key Deliverables |
|---|---|---|---|
| **Phase 1** | Core POS, Dual Barcode & 58/80mm Thermal Printer | ✅ **Completed** | POS Counter, Quick Cash, Sound FX, Barcode Generator, Thermal Slip |
| **Phase 2** | Invoicing, Quotations, Challan, Credit Notes & Dual Warehouse | ✅ **Completed** | A4 Tax Invoice, Quotations to Invoice 1-Click, Challan, Credit Note, Stock Transfer |
| **Phase 3** | CRM, Digital Due Ledger (বাকি খাতা) & Bengali SMS Alerts | ✅ **Completed** | Customer Ledger, Debit/Credit Timeline, Bengali SMS, Loyalty Tiers, Payment Receipts |
| **Phase 4** | Kanakku-Grade Super Admin Dashboard & Multi-Company Subscription Hub | ✅ **Completed** | SaaS Executive Hub, Impersonation Mode, License Key Generator, Quotas, Billing, Domains, Broadcast Engine |
| **Phase 5** | HRM, Staff Attendance, Roles & Sales Commission | ✅ **Completed** | Staff Profiles, Daily Attendance, Role-based Access (RBAC), Payroll & Commission, Salary Slips |
| **Phase 6** | Financial Overview, Expense Tracker & Accounts (হিসাব খাতা / ক্যাশ বুক) | ✅ **Completed** | Cash Book, Daily/Monthly P&L, Shop Expenses, Vendor/Supplier Ledger, Purchase Orders |
| **Phase 7** | Multi-Store E-Commerce Site Builder, Courier API & Subscription Verification | ✅ **Completed** | Storefront, Live Cart, Courier API (Steadfast/RedX/Pathao), Auto Trial, TrxID Manual Approval |
| **Phase 8** | Offline-First PWA, Mobile POS, Super Admin A-to-Z Fleet & Cloud Architecture | ✅ **Completed** | Service Worker Offline Cache, Mobile Touch POS, Super Admin ERP-Grade Sidebar, Store & Terminal A-Z Control, MySQL 8.0, SMS/SMTP Test Hub |
| **Phase 10** | Automated Double-Entry Accounting, COA & Financial Audit Statements | ✅ **Completed** | General Journal, 5-Tier Chart of Accounts, Trial Balance, Balance Sheet, Cash Flow, Bank Reconciliation |
| **Phase 11** | Multi-Branch Logistics, Central CDC & Inter-Branch Transfer (GIT) | ✅ **Completed** | Central CDC, Store Requisitions (RO), Transfer Challan Gatepass, Goods in Transit (GIT), GRN & Damage Audits, Branch P&L |
| **Phase 12** | AI Autonomous Demand Forecasting & Smart Auto-PO | ✅ **Completed** | Sales Velocity ($V$), Dynamic ROP, Safety Stock ($SS$), Auto-PO Hub, Gemini AI Supply Chain Analyst, Dead-Stock Liquidation |
| **Phase 13** | Global Payments & Multi-Currency Forex Engine | ✅ **Completed** | Multi-Currency (USD/EUR/GBP/AED/SAR/BDT), Stripe 3DS 2.0 Elements, PayPal, NBR Mushak 6.3 Customs, Forex Gain/Loss JV |
| **Phase 14-15+** | WhatsApp Cloud API Bot & Sunmi Hardware POS | 📚 **Documented** | [View All Documentation in `/docs/INDEX.md`](./docs/INDEX.md) |

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
  - Top 4 KPI Stat Cards: Total Registered Companies, Active Companies, Suspended, ARR.
  - MRR Target Progress Bar: ৳ ৪,৫৮,৯৭০ (টার্গেট ৳ ১০,০০,০০০, ৪৬% অর্জিত).
  - 3 High-Level Insight Cards: Most Ordered Plan, Top Company, Most Users & Storage.
- **Earnings & Income Visual Chart:**
  - Monthly vs. Yearly toggle with Jan-Dec revenue bar graph and hover tooltips.
  - Subscription Plan Distribution (Enterprise 45%, Professional 35%, Starter 15%, Trial 5%).
- **Multi-Tenant Company Management Hub (`SuperAdmin.tsx`):**
  - Search & multi-parameter filter (by Category, Plan Tier, and Status).
  - Impersonate / 1-Click Store Login ("স্টোরে লগইন") with persistent top banner in client dashboard.
  - Plan upgrade/downgrade and subscription status switcher.
- **Resource Quota Management (`EditQuotaModal.tsx`):**
  - Custom allocation of Max Branches, Max Users, Max Products, Monthly Invoices, and Storage GB.
- **Enterprise License Key Generator (`TenantLicenseModal.tsx`):**
  - Cryptographic license key generation (`JHIMSE-XXX-2026-XXXX`).
  - Printable Corporate Software License Certificate with JH Soft Corporation branding.
- **New Tenant Onboarding Modal (`CreateTenantModal.tsx`):**
  - Trade License No., BIN/VAT, subdomains, owner credentials, and warehouse auto-creation.
- **Custom Domains & SSL Verification:**
  - CNAME verification (`cname.jh-imse.shop`), SSL status indicator (256-bit Secured).
- **SaaS Billing & Transactions Registry:**
  - Payment tracking via bKash, Nagad, Bank Transfer, and Card with invoice numbers and TrxIDs.
- **Global Broadcast Engine:**
  - Real-time broadcast notices (Info, Warning, Maintenance, Critical) with target audience filters.

---

### ✅ Phase 5: HRM, Staff Attendance, Roles & Sales Commission (সম্পন্ন)
- **Staff Directory (`StaffDirectory.tsx` & `AddStaffModal.tsx`):**
  - Employee photo, designation, phone, NID/Passport, emergency contact, basic salary, joining date.
- **Daily Attendance Clock-In/Clock-Out Tracker (`AttendanceTracker.tsx`):**
  - Present, Absent, Late, Half-day, and Leave tracking with 1-click bulk mark and date filters.
- **Role-Based Access Control / RBAC Matrix (`RolePermissionMatrix.tsx`):**
  - Granular permission matrix across POS, Inventory, Sales, CRM, HRM, and Reports.
- **Payroll & Commission Calculator (`PayrollAndCommission.tsx`):**
  - Basic salary, house rent, medical, overtime, absent deductions, and sales target commission.
- **Salary Pay Slip Modal (`SalarySlipModal.tsx`):**
  - Printable corporate salary slip voucher with signature stamps.

---

### ✅ Phase 6: Financial Overview, Expense Tracker & Accounts (হিসাব খাতা / ক্যাশ বুক) (সম্পন্ন)
- **Executive Financial KPI Overview:**
  - Total Sales Revenue (মোট বিক্রয় আয়)
  - Cost of Goods Sold / COGS (মালের ক্রয়মূল্য)
  - Gross Profit & Gross Margin % (মোট লাভ ও মার্জিন)
  - Operational Expenses (মোট দোকান ও আনুষঙ্গিক খরচ)
  - Net Profit (প্রকৃত নিট মুনাফা)
  - Accounts Payable (মহাজন / সাপ্লায়ারদের মোট দেনা বকেয়া)
- **Cash Book & Daily P&L (`AccountingManager.tsx`):**
  - Real-time Cash-In (বিক্রয় ও আদায়) vs Cash-Out (খরচ ও দেনা শোধ) timeline log.
  - Printable Cash Book statement.
- **Expense Tracker & Debit Vouchers (`AddExpenseModal.tsx` & `ExpenseVoucherPrintModal.tsx`):**
  - Category-wise tracking (ভাড়া, বিদ্যুৎ/ইউটিলিটি, স্টাফ খাবার, পরিবহন, প্যাকেজিং, মার্কেটিং, মেরামত, ট্যাক্স ও লাইসেন্স ফি)।
  - Printable Debit Expense Voucher with corporate stamps.
- **Vendor & Supplier Ledger / Accounts Payable (`AddSupplierModal.tsx` & `SupplierLedgerModal.tsx`):**
  - Supplier Directory with total purchases, total paid, and due balance.
  - Full Debit/Credit khotian statement with running balance.
- **Supplier Payment Voucher (`PaySupplierModal.tsx`):**
  - Record payments to suppliers via Bank Cheque, Cash, bKash, or Nagad.
- **Supplier Purchases & Stock Inward (`AddPurchaseModal.tsx`):**
  - Enter supplier purchase bills, batch numbers, expiry dates, automatically restocking inventory.

---

### 🌐 Production Technical Architecture for Hostinger & Production Launch

#### ১. হোস্টিংগার বিজনেস ওয়েব হোস্টিং ও মাইএসকিউএল ডেটাবেজ আর্কিটেকচার (Hostinger MySQL Architecture)
- **হোস্টিং প্ল্যাটফর্ম:** Hostinger Business Web Hosting (Node.js / React / Next.js সাপোর্ট সহ)।
- **ডেটাবেজ:** MySQL 8.0+ (InnoDB Engine, `utf8mb4_unicode_ci` বাংলা সাপোর্ট)।
- **স্কিমা ফাইল:** `hostinger-mysql-schema.sql` (రూট ডিরেক্টরিতে তৈরি করা হয়েছে, phpMyAdmin এ ১-ক্লিকে Import করা যাবে)।
- **টেবিলসমূহ:** `tenants`, `users`, `otp_verifications`, `gateway_settings`, `warehouses`, `products`, `customers`, `customer_transactions`, `sales`, `sale_items`, `expenses`, `suppliers`, `supplier_transactions`, `supplier_purchase_orders`, `supplier_payments`, `employees`, `attendance_records`, `salary_slips`।

#### ২. নিজস্ব অথেন্টিকেশন ও ওটিপি সিস্টেম (In-House Custom Auth & RBAC)
- **লগইন মাধ্যম:**
  - ১. ইমেইল + পাসওয়ার্ড (Bcrypt Salt 12 Hash)
  - ২. ফোন নম্বর + এসএমএস ওটিপি (Phone + 6-digit OTP Login)
- **পাসওয়ার্ড রিসেট / ফরগেট পাসওয়ার্ড:**
  - মোবাইলে ওটিপি ভেরিফিকেশন অথবা ইমেইলে সিকিউর ওয়ান-টাইম পাসওয়ার্ড রিসেট লিংক।
- **রোল-বেসড এক্সেস কন্ট্রোল (RBAC):**
  - সুপার এডমিন, স্টোর মালিক, ব্রাঞ্চ ম্যানেজার, ক্যাশিয়ার, এবং অডিটর। ব্যাকএন্ডে API রুটগুলোতে রোল ফিল্টারিং।

#### ৩. এসএমএস এবং ইমেইল গেটওয়ে ইন্টিগ্রেশন (SMS & Email SMTP Gateways)
- **এসএমএস গেটওয়ে:** বাংলাদেশের অনুমোদিত গেটওয়ে (Greenweb, MiMSMS, Onnorokom SMS) API Key এবং মাস্কিং সেন্ডার আইডি (`JHSOFT`) যুক্ত করার অপশন।
- **ইমেইল গেটওয়ে:** হোস্টিংগারের নিজস্ব বিজনেস ওয়েবমেইল SMTP (`smtp.hostinger.com`, Port 465 SSL) অথবা Resend/SendGrid।

#### ৪. কাস্টমার ডোমেইন ও হোস্টিং ফ্লেক্সিবিলিটি (Custom Domain & Hosting Mapping)
- **কাস্টমার নিজস্ব ডোমেইন:** কাস্টমার তার যেকোনো ডোমেইনে DNS রেকর্ড (A Record বা CNAME `cname.jh-imse.shop`) পয়েন্ট করে সরাসরি আমাদের হোস্টিংগারের অ্যাপে কানেক্ট করতে পারবে।
- **আমাদের হোস্টিং ও ডোমেইন:** কাস্টমার চাইলে আমাদের সাব-ডোমেইনে (`client.jh-imse.shop`) চলতে পারবে অথবা আমরা তাদের জন্য আলাদা ডোমেন কিনে হোস্ট করে দিতে পারব।
- **হোস্টিংগার কনফিগারেশন:** হোস্টিংগার বিজনেস হোস্টিংয়ে ৫টি আলাদা সাইট/ওয়েব অ্যাপ হোস্ট করার সুবিধা রয়েছে, যার মধ্যে অলরেডি ২টি লাইভ রয়েছে এবং এই প্রজেক্টটি ৩য় ফ্ল্যাগশিপ এন্টারপ্রাইজ প্রজেক্ট হিসেবে হোস্ট হবে।

---

### ✅ Phase 7: Multi-Store E-Commerce Site Builder, Courier Delivery Engine & Subscription Payment System (সম্পন্ন)
- **মাল্টি-স্টোর ই-কমার্স সাইট বিল্ডার ও লাইভ শপফ্রন্ট (`StorefrontView.tsx`):**
  - ডাইনামিক ক্যাটাগরি ফিল্টার, কার্ট সিস্টেম, এবং পণ্য অনুসন্ধান।
  - ঢাকা শহরের ভেতরে (৳৬০) ও ঢাকার বাইরে (৳১৩০) অটোমেটেড কুরিয়ার ডেলিভারি চার্জ হিসাব।
  - বিকাশ, নগদ, রকেট TrxID এবং ক্যাশ অন ডেলিভারি (COD) চেকআউট।
  - কাস্টমারদের জন্য লাইভ অর্ডার ট্র্যাকিং ইঞ্জিন (`WEB-XXXX` নম্বর দিয়ে ৬-ধাপের স্ট্যাটাস ট্র্যাকিং)।
  - প্রিন্ট উপযোগী কাস্টমার অনলাইন অর্ডার ভাউচার।
- **কুরিয়ার ডেলিভারি ইঞ্জিন ও ট্র্যাকিং (`CourierBookingModal.tsx` & `ECommerceManager.tsx`):**
  - **Steadfast Courier API**, **RedX**, **Pathao Parcel**, এবং **In-House ডেলিভারি বয়** ইন্টিগ্রেশন।
  - অটোমেটেড কনসাইনমেন্ট আইডি ও ট্র্যাকিং কোড জেনারেশন (`STDF-XXXX`, `REDX-XXXX`, `PTH-XXXX`)।
  - ১-ক্লিকে প্রিন্ট উপযোগী A6 থার্মাল শিপিং লেবেল ও পার্সেল বারকোড স্লিপ।
  - অর্ডার লাইফসাইকেল ট্র্যাকিং: নতুন অর্ডার ➔ কনফার্ম ➔ প্যাকিং ➔ কুরিয়ারে হস্তান্তর (Shipped) ➔ ডেলিভারি সম্পন্ন।
- **ফ্রি ট্রায়াল রেজিস্ট্রেশন ও তাৎক্ষণিক অটো-অ্যাপ্রুভাল (`FreeTrialRegisterModal.tsx`):**
  - নাম, ফোন, জিমেইল ওটিপি ভেরিফিকেশন, জাতীয় পরিচয়পত্র (NID) নম্বর, দোকানের নাম এবং মডিউল নির্বাচন।
  - ফ্রি ট্রায়ালে কোনো এডমিন অনুমোদনের প্রয়োজন নেই — রেজিস্ট্রেশন সম্পন্ন হওয়ামাত্রই সফটওয়্যার সচল এবং দোকানদার সাথে সাথে ড্যাশবোর্ডে প্রবেশ করতে পারবেন।
- **পেইড সাবস্ক্রিপশন ম্যানুয়াল পেমেন্ট ভেরিফিকেশন ও এডমিন অনুমোদন (`SubscriptionCheckoutModal.tsx` & `SuperAdmin.tsx`):**
  - **সুপার এডমিন অফিসিয়াল পেমেন্ট সেটিংস:** এডমিন বিকাশ, নগদ, রকেট ও ব্যাংক একাউন্ট নম্বর এবং পেমেন্ট সংক্রান্ত বিশেষ নির্দেশিকা সেট করতে পারবেন।
  - **পেমেন্ট সাবমিশন:** প্যাকেজ কেনার সময় দোকানদার অফিসিয়াল একাউন্টে টাকা পাঠিয়ে প্রেরক নম্বর, ট্রানজেকশন আইডি (TrxID), টাকার পরিমাণ ও মানি রিসিট স্ক্রিনশট আপলোড করবেন।
  - **এডমিন ভেরিফিকেশন হাব:** সুপার এডমিন TrxID ও ব্যাংক স্টেটমেন্ট মিলিয়ে দেখে ১-ক্লিকে "অনুমোদন ও প্যাকেজ সক্রিয়" করতে পারবেন (স্বয়ংক্রিয়ভাবে প্যাকেজ আপগ্রেড হবে, মেয়াদ ৩০ বা ৩৬৫ দিন বাড়বে এবং নতুন লাইসেন্স কি ইস্যু হবে) অথবা কারণ উল্লেখ করে "বাতিল" করতে পারবেন।
- **নিজস্ব অথেন্টিকেশন সিস্টেম (`AuthModal.tsx`):**
  - ইমেইল + পাসওয়ার্ড লগইন, ফোন নম্বর + ওটিপি লগইন, এবং ওটিপি দিয়ে ফরগেট পাসওয়ার্ড রিকভারি।
- **এন্টারপ্রাইজ গ্লোবাল নেভিগেশন ও পোর্টাল হেডার (`App.tsx`):**
  - পরিচ্ছন্ন গ্লোবাল হেডার যেখানে মেইন সাইট, স্টোর ERP, POS ক্যাশ, ই-কমার্স এবং সুপার এডমিন এর মধ্যে নিরবচ্ছিন্নভাবে সুইচ করা যায়।

---

### ✅ Phase 8: Offline-First PWA, Mobile POS, Super Admin A-to-Z Fleet & Cloud Architecture (সম্পন্ন)
- **অফলাইন-ফার্স্ট PWA ও সার্ভিস ওয়ার্কার আর্কিটেকচার (`/public/sw.js`, `/public/manifest.json`):**
  - ক্যাশ কাউন্টারে ইন্টারনেট বা ওয়াইফাই বিচ্ছিন্ন হলেও পুরো অ্যাপ অফলাইনে সচল থাকে।
  - অফলাইন সেলস কিউ (`localStorage` / `IndexedDB` ভিত্তিক `jh_offline_sales_queue`) যেখানে ইন্টারনেট সংযোগ বিচ্ছিন্ন অবস্থায় অফলাইন বিক্রয় জমা হয় এবং সংযোগ পাওয়ার সাথে সাথে ব্যাকগ্রাউন্ড সিঙ্ক সম্পন্ন হয়।
  - স্ট্যান্ডঅ্যালোন PWA সাপোর্ট, অ্যান্ড্রয়েড/আইওএস অ্যাপের মত হোমস্ক্রিন ইন্সটলেশন।
- **হ্যান্ডহেল্ড টাচ ও মোবাইল POS মোড (`POSScreen.tsx`):**
  - মোবাইল ও ট্যাবলেট স্ক্রিনের জন্য রেসপনসিভ টাচ পিওএস ইন্টারফেস।
  - সিন্থেসাইজড ওয়েব অডিও বারকোড স্ক্যানার বিপ সাউন্ড ও ভিজ্যুয়াল ফ্ল্যাশ নোটিফিকেশন।
  - হোল্ড/পার্ক কার্ট পলিসি ও মাল্টি-কার্ট ব্যবস্থাপনা।
  - সুপার এডমিন কর্তৃক সেন্ট্রাল টার্মিনাল লকডাউন স্ক্রিন ও সিকিউরিটি ওভারলে।
- **সুপার এডমিন প্যানেল রি-ডিজাইন ও ERP-গ্রেড সাইডবার নেভিগেশন (`SuperAdmin.tsx`):**
  - সিঙ্গেল-লাইন বা হরিজন্টাল ট্যাবের বদলে টেন্যান্ট ড্যাশবোর্ডের মতো প্রিমিয়াম এন্টারপ্রাইজ ভার্টিক্যাল সাইডবার (গ্রুপ অনুযায়ী সাজানো: ওভারভিউ ও অ্যানালিটিক্স, স্টোর ও POS ফ্লিট কন্ট্রোল, সাবস্ক্রিপশন ও বিলিং, হোল ওয়েবসাইট ও ক্লাউড কন্ট্রোল)।
  - মোবাইল নেভিগেশন বার কলাপ্স/এক্সপ্যান্ড সুবিধা এবং পরিষ্কার ব্র্যান্ডিং।
- **প্রতিটি দোকান ও POS সিস্টেমের A-to-Z সেন্ট্রাল কন্ট্রোল:**
  - **১-ক্লিক POS কাউন্টার লঞ্চ:** সুপার এডমিন সরাসরি যেকোনো দোকানের লাইভ পিওএসে প্রবেশ করতে পারবেন।
  - **১-ক্লিক ই-কমার্স স্টোরফ্রন্ট প্রিভিউ:** যেকোনো ক্লায়েন্টের লাইভ অনলাইন শপ দেখার অপশন।
  - **১-ক্লিক ইম্পারসোনেশন মোড:** যেকোনো দোকানের এডমিন/মালিক হিসেবে লগইন করে পুরো সিস্টেম হ্যান্ডেল করার ক্ষমতা।
  - **রিমোট POS টার্মিনাল লক/আনলক:** নির্দিষ্ট দোকানের বা পুরো সিস্টেমের (Fleet Lockdown) ক্যাশ কাউন্টার তাৎক্ষণিক লক বা আনলক করার কন্ট্রোল।
  - **দোকানভিত্তিক POS পলিসি কনফিগারেশন:** বাকি বিক্রয় (Due Sale) অনুমোদন/নিষিদ্ধ, ক্যাশিয়ার সর্বোচ্চ ছাড়ের শতকরা হার (Max Discount %), নেগেটিভ স্টক বিক্রয় পলিসি, থার্মাল স্লিপ অটো-প্রিন্ট, সাউন্ড এফএক্স, এবং কাস্টমার মোবাইল নম্বর বাধ্যতামূলক করার নীতি।
  - **লাইভ স্টোর ডেটা ও স্টক ইনস্পেক্টর:** রিয়েল-টাইম প্রোডাক্ট সংখ্যা, মোট ক্রয়মূল্য ও বিক্রয়মূল্যে স্টক ভ্যালুয়েশন, মোট অর্জিত রেভিনিউ এবং কাস্টমার মোট বকেয়ার পরিমাণ এক ক্লিকে দেখার সুবিধা।
  - **মডিউল পারমিশন টগল:** POS, ই-কমার্স, CRM, HRM, AI প্রেডিকশন, মাল্টি-ওয়্যারহাউস, ড্রাগ ব্যাচ বা IMEI ওয়ারেন্টি মডিউল তাৎক্ষণিক অন/অফ করার সুইচ।
- **হোল ওয়েবসাইট ও ক্লাউড কন্ট্রোল:**
  - **ওয়েবসাইট CMS ও সেটিংস:** প্ল্যাটফর্ম বাংলা/ইংরেজি টাইটেল, সাবটাইটেল, কর্পোরেট হেল্পলাইন (`+8801940999830`), অফিস ঠিকানা, ডিফল্ট ট্রায়াল দিন ও কারেন্সি সেটিংস।
  - **হোস্টিংগার Business MySQL 8.0 হাব:** লাইভ পিং/কানেকশন টেস্ট সিমুলেটর, ১-ক্লিকে `hostinger-mysql-schema.sql` ডাউনলোড, phpMyAdmin ৫-ধাপের গাইড এবং ১৮টি কোর টেবিল ইনস্পেক্টর।
  - **বাংলাদেশী SMS ও SMTP গেটওয়ে হাব:** Greenweb, MiMSMS, Onnorokom, Alpha Net কনফিগারেশন + লাইভ টেস্ট SMS সেন্ডার এবং Hostinger Webmail SMTP (`smtp.hostinger.com:465`) কনফিগারেশন + লাইভ টেস্ট ইমেইল সেন্ডার।
  - **কুরিয়ার ডেলিভারি API হাব:** Steadfast, RedX, Pathao API কী ও কনফিগারেশন।
- **আপগ্রেডেড মাল্টি-স্টোর ই-কমার্স স্টোরফ্রন্ট (`StorefrontView.tsx`):**
  - **মাল্টি-স্টোর সুইচার:** কাস্টমাররা এক ক্লিক যেকোনো ক্লায়েন্ট স্টোরের অনলাইন শপে প্রবেশ করতে পারবেন।
  - **প্রোমো অ্যানাউন্সমেন্ট মারকুই:** লাইভ কুপন কোড (`JH10`, `EID50`, `FREESHIP`) সহ ইন্টারঅ্যাক্টিভ প্রোমো ব্যানার ও হেল্পলাইন।
  - **সর্টিং ও ফিল্টারিং:** জনপ্রিয়তা, দাম (কম থেকে বেশি/বেশি থেকে কম), সর্বোচ্চ রেটিং ও শুধু ইন-স্টক ফিল্টার।
  - **প্রোডাক্ট কার্ড ও কুইক অ্যাকশন:** স্টার রেটিং (⭐ ৪.৯), ইন-স্টক ব্যাজ, এবং **"⚡ এখনই কিনুন" (1-Click Instant Checkout)** বোতাম।
  - **ফ্রি ডেলিভারি প্রোগ্রেস মিটার:** কার্ট ড্রয়ারে ৳১০০০ টাকার কেনাকাটায় ফ্রি ডেলিভারির লাইভ মিটার।
  - **সম্পূর্ণ বাংলাদেশী চেকআউট:** ৮টি বিভাগ (Division) ড্রপডাউন, জেলা, থানা/উপজেলা, পছন্দের কুরিয়ার (Steadfast, RedX, Pathao, ইন-হাউস), এবং বিকাশ/নগদ মার্চেন্ট পেমেন্ট কিউআর কোড ও TrxID ভেরিফিকেশন।
  - **কাস্টমার রিভিউ ও সোশ্যাল প্রুফ:** ভেরিফাইড ক্রেতাদের রিভিউ তালিকা ও নতুন রিভিউ সাবমিট করার ইন্টারেক্টিভ ফর্ম।
  - **৫-ধাপের কাস্টমার লাইভ অর্ডার ট্র্যাকিং:** অর্ডার গ্রহণ ➔ প্যাকিং ➔ কুরিয়ারে হস্তান্তর (ট্র্যাকিং আইডি সহ) ➔ কাস্টমার ডেলিভারি সম্পন্ন।

---

### ✅ Phase 9: Hostinger MySQL Production Live Deployment & In-House Custom Launch (সম্পন্ন)
- **হোস্টিংগার বিজনেস MySQL 8.0 প্রোডাকশন স্কিমা (`hostinger-mysql-schema.sql`):**
  - ১৮টি স্বয়ংসম্পূর্ণ কোর রিলেশনাল টেবিল (InnoDB Engine, `utf8mb4_unicode_ci` বাংলা সাপোর্ট)।
  - টেবিলসমূহ: `tenants`, `users`, `otp_verifications`, `gateway_settings`, `warehouses`, `products`, `customers`, `customer_transactions`, `sales`, `sale_items`, `expenses`, `suppliers`, `supplier_transactions`, `supplier_purchase_orders`, `supplier_payments`, `employees`, `attendance_records`, `salary_slips`, `online_orders`, `online_order_items`, `subscription_payment_requests`, `custom_domain_requests`, `broadcast_notices`, `global_platform_settings`।
  - phpMyAdmin-এ ১-ক্লিকে ইমপোর্ট করার উপযোগী পিওর এসকিউএল স্ক্রিপ্ট, ফরেন কি রিলেশন ও ইনডেক্সিং সহ।
- **নিজস্ব অথেন্টিকেশন (In-House Authentication) ও ওটিপি ইঞ্জিন (`AuthModal.tsx`):**
  - থার্ড-পার্টি ফায়ারবেসের উপর কোনো নির্ভরতা নেই — সম্পূর্ণ সেলফ-হোস্টেড বিসিপ্র্ট/আর্গন২ পাসওয়ার্ড হ্যাশিং ও ৬-ডিজিটের এসএমএস ওটিপি লগইন।
  - ওটিপি ভিত্তিক পাসওয়ার্ড রিকভারি / ফরগেট পাসওয়ার্ড ফ্লো।
  - রোল-বেসড এক্সেস কন্ট্রোল (Super Admin, Owner, Manager, Cashier, Accountant, Auditor)।
- **এসএমএস ও ইমেইল গেটওয়ে কনফিগারেশন (`.env.example` & SuperAdmin Hub):**
  - বাংলাদেশী এসএমএস গেটওয়ে (Greenweb, MiMSMS, Onnorokom) মাস্কিং আইডি (`JHSOFT`) এবং স্বয়ংক্রিয় টেস্ট এসএমএস প্রেরণ ইঞ্জিন।
  - হোস্টিংগার বিজনেস ওয়েবমেইল SMTP (`smtp.hostinger.com:465 SSL`) ইন্টিগ্রেশন ও লাইভ টেস্ট ইমেইল ভেরিফায়ার।
- **কাস্টম ডোমেইন ও হোস্টিংগার CNAME রেজোলিউশন:**
  - `cname.jh-imse.shop` টার্গেটে ক্লায়েন্টদের নিজস্ব ডোমেইন ম্যাপিং ও অটো-এসএসএল ডোমেইন ভেরিফিকেশন ইঞ্জিন।

---

## 🌐 আন্তর্জাতিক মানের SaaS ERP/POS প্ল্যাটফর্মের সাথে JH IMSE-এর তুলনামূলক বিশ্লেষণ
*(Benchmarks: Shopify, Odoo Enterprise, Toast POS, Square POS, Zoho Inventory/Books)*

| আন্তর্জাতিক ফিচার ক্যাটাগরি | বৈশ্বিক লিডার (Odoo/Shopify/Toast/Zoho) | JH IMSE বর্তমান অবস্থা | পরবর্তী আপগ্রেডের প্রয়োজনীয়তা |
|---|---|---|---|
| **মাল্টি-টেন্যান্ট SaaS আর্কিটেকচার** | সেন্ট্রাল কন্ট্রোল ও কোটা ম্যানেজমেন্ট | ✅ **সম্পূর্ণ বিদ্যমান** (সুপার এডমিন হাব, ১-ক্লিক পিওএস ও ই-কমার্স লঞ্চ, কোটা বরাদ্দ) | ডেটাবেজ লেভেলে মাল্টি-ডিবি পার-টেন্যান্ট অপশন |
| **পয়েন্ট অব সেল (POS) বিলিং** | বারকোড, টাচ পিওএস, ড্রয়ার ও রিসিপ্ট | ✅ **সম্পূর্ণ বিদ্যমান** (থার্মাল ৫৮/৮০মিমি, A4 ট্যাক্স ইনভয়েস, সাউন্ড বিপ, অফলাইন PWA, ডুয়াল প্রাইসিং) | কিচেন ডিসপ্লে সিস্টেম (KDS) রেস্টুরেন্টের জন্য |
| **বকেয়া ও বাকি খাতা (Khata CRM)** | সাধারণত আন্তর্জাতিক অ্যাপে দুর্বল বা প্লাগইন নির্ভর | 🏆 **JH IMSE এগিয়ে** (বাংলাদেশী বাস্তবতায় পরিপূর্ণ ডিজিটাল বাকি খাতা, ৫০+ লেনদেন হিস্ট্রি, বাংলা এসএমএস রিমাইন্ডার) | স্বয়ংক্রিয় শিডিউলড হোয়াটসঅ্যাপ মেসেজ পাঠানো |
| **ডাবল-এন্ট্রি অ্যাকাউন্টিং (Double-Entry)** | অটোমেটেড ডেবিট-ক্রেডিট জার্নাল, ট্রায়াল ব্যালেন্স, ব্যালেন্স শীট | ⚠️ **আংশিক বিদ্যমান** (ক্যাশ বুক, আয়-ব্যয়, ভেন্ডর লেজার ও P&L বিদ্যমান, কিন্তু চার্ট অব অ্যাকাউন্টস জার্নাল নেই) | **Phase 10-এ ইমপ্লিমেন্ট করা হবে** |
| **কুরিয়ার ও শিপিং অটোমেশন** | FedEx, UPS, DHL রিয়েল-টাইম শিপিং | ✅ **সম্পূর্ণ বিদ্যমান** (Steadfast, RedX, Pathao API, এ৬ থার্মাল লেবেল ও কনসাইনমেন্ট ট্র্যাকিং) | ডেলিভারি ফেইল্ড বা রিটার্ন পার্সেল অটো-স্টক রিস্টোর |
| **মাল্টি-ব্রাঞ্চ ইন্টার-স্টোর ট্রান্সফার** | গুদাম থেকে দোকানে বারকোড ডিসপ্যাচ ও রিসিভ | ⚠️ **বেসিক বিদ্যমান** (শাখা ওয়্যারহাউস পরিবর্তন করা যায়) | **Phase 11-এ গেটপাস ও বারকোড রিসিভিং যোগ হবে** |
| **এআই প্রিডিকশন ও অটো-পারচেজ** | স্টক ট্রেন্ড বিশ্লেষণ ও অটোমেটেড রি-অর্ডার | ⚠️ **বেসিক বিদ্যমান** (লো-স্টক অ্যালার্ট ও প্রফিট গ্রাফ) | **Phase 12-এ এআই ভিত্তিক সেলস ফরকাস্টিং যোগ হবে** |
| **মাল্টি-কারেন্সি ও আন্তর্জাতিক পেমেন্ট** | Stripe, PayPal, Razorpay, Multi-Currency | ⚠️ **বাংলাদেশী পেমেন্ট সম্পূর্ণ** (বিকাশ, নগদ, রকেট, ব্যাংক), গ্লোবাল কারেন্সি লিমিটেড | **Phase 13-এ USD, EUR, INR ও Stripe যোগ হবে** |
| **কাস্টমার লয়্যালটি ও মার্কেটিং বট** | পয়েন্ট আর্নিং, রিডিমেশন ও রিওয়ার্ডস | ⚠️ **টায়ার বিদ্যমান** (Bronze, Silver, Gold), কিন্তু পয়েন্ট রিডিম নেই | **Phase 14-এ পয়েন্ট ওয়ালেট সিস্টেম যোগ হবে** |
| **ডেডিকেটেড মোবাইল পিওএস অ্যাপ** | Sunmi/iMin হ্যান্ডহেল্ড টার্মিনাল বিল্ট-ইন প্রিন্টার অ্যাপ | ✅ **PWA বিদ্যমান**, তবে নেটিভ অ্যান্ড্রয়েড APK হলে বিল্ট-ইন থার্মাল প্রিন্টার ব্লুটুথ ছাড়াই চলে | **Phase 15-এ Capacitor/Android APK যোগ হবে** |

---

## 🚀 পরবর্তী উন্নয়ন রোডম্যাপ: Phase 10 থেকে Phase 15 (Next Roadmap)

### 🔹 Phase 10: Automated Double-Entry Accounting Journal & Chart of Accounts
- **চার্ট অব অ্যাকাউন্টস (Chart of Accounts):** Assets, Liabilities, Equity, Revenue, এবং Expenses এর ৫-স্তরের স্ট্যান্ডার্ড হায়ারার্কি।
- **স্বয়ংক্রিয় জার্নাল এন্ট্রি (Auto Journal):** প্রতিটি বিক্রয়, ক্রয়, বকেয়া আদায়, খরচ বা ব্যাংক লেনদেনের সাথে সাথে স্বয়ংক্রিয় ডেবিট-ক্রেডিট লেজার তৈরি।
- **ফাইন্যান্সিয়াল অডিট স্টেটমেন্টস:** ১-ক্লিকে ব্যালেন্স শীট (Balance Sheet), ট্রায়াল ব্যালেন্স (Trial Balance) এবং ক্যাশ ফ্লো স্টেটমেন্ট (Cash Flow Statement) এক্সপোর্ট।
- **ব্যাংক রিকনসিলিয়েশন:** ব্যাংক স্টেটমেন্ট আপলোড করে সফটওয়্যারের সাথে স্বয়ংক্রিয় ভেরিফিকেশন।

### 🔹 Phase 11: Multi-Branch Inter-Store Dispatch & Barcode Gate Pass Engine
- **সেন্ট্রাল ডিপো থেকে ব্রাঞ্চে ট্রান্সফার অর্ডার (Transfer Order):** মূল ওয়্যারহাউস থেকে নির্দিষ্ট দোকানে পণ্য পাঠানোর রিকোয়েস্ট ও অনুমোদন ফ্লো।
- **বারকোড ডিসপ্যাচ ও গেটপাস (Gate Pass):** গাড়ির নম্বর, ড্রাইভারের ফোন ও পার্সেল বারকোড স্লিপ তৈরি।
- **শাখা রিসিভিং মোড:** ব্রাঞ্চ ম্যানেজার বারকোড স্ক্যান করে আনলোড করা মাত্র স্বয়ংক্রিয়ভাবে শাখা ইনভেন্টরিতে স্টক যুক্ত হবে এবং সিস্টেম কোনো শর্টেজ থাকলে তা ফ্ল্যাগ করবে।

### 🔹 Phase 12: AI Autonomous Demand Forecasting, Smart Auto-Purchase Reordering & Dead Stock Liquidation
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **এআই ডিমান্ড প্রেডিকশন ও স্টকআউট রাডার (`/src/utils/aiForecastEngine.ts`):** গাণিতিক সেলস ভেলোসিটি ($V = \frac{\sum Q_t}{N}$), স্টক স্থায়িত্ব ($DIR$), এবং সেফটি স্টক ($SS = 1.65 \times \sigma_L \times \sqrt{LT}$) অনুযায়ী সংকটপূর্ণ স্টকআউট শনাক্তকরণ।
- **স্মার্ট অটো-পারচেজ অর্ডার হাব (`AutoPOApprovalModal.tsx`):** ইনসেপ্টা, স্কয়ার ও বেক্সিমকোর মতো সাপ্লায়ার অনুযায়ী স্বয়ংক্রিয় গ্রুপকৃত ড্রাফট PO, ১-ক্লিক অনুমোদন, অফিসিয়াল ভাউচার প্রিন্ট ও WhatsApp অর্ডার ডিসপ্যাচ।
- **ডেড-স্টক ও ক্যাপিটাল রিকভারি (`DeadStockPromoModal.tsx`):** ৬০+ দিন অবিক্রিত পণ্যে ১৫% থেকে ২৫% ছাড় প্রমোশন সক্রিয় করে নগদ টাকা উদ্ধার।
- **গুগল জেমিনি এআই সাপ্লাই চেইন অ্যানালিস্ট:** `@google/genai` (gemini-3.8-flash) চালিত ইন্টারেক্টিভ বাংলা অ্যাডভাইজার ও ব্যবসায়িক পরামর্শ।

### 🔹 Phase 13: Multi-Currency, Global Tax Slabs (VAT/TDS) & International Stripe/PayPal Gateway
- **মাল্টি-কারেন্সি ইঞ্জিন:** এক দোকানে USD, BDT, EUR, AED বা SAR-এ কেনাকাটা এবং লাইভ এক্সচেঞ্জ রেট ক্যালকুলেশন।
- **আন্তর্জাতিক পেমেন্ট গেটওয়ে:** Stripe Credit Card, PayPal, এবং Apple Pay/Google Pay ইন্টিগ্রেশন।
- **কাস্টম ট্যাক্স স্ল্যাব ও চালান:** এনবিআর ভ্যাট চালান (মূসক ৬.৩), টিডিএস এবং আন্তর্জাতিক ট্যাক্স স্ল্যাব কনফিগারেশন।

### 🔹 Phase 14: Customer Loyalty Points Wallet, Gift Cards & Automated WhatsApp/Viber Marketing Bot
- **পয়েন্ট ওয়ালেট ও ক্যাশব্যাক:** প্রতি ১০০ টাকা কেনাকাটায় কাস্টমার ৫ পয়েন্ট পাবেন যা পরবর্তী কেনাকাটায় নগদ টাকার মতো ডিসকাউন্ট হিসেবে ব্যবহার করা যাবে।
- **গিফট কার্ড ও ভাউচার জেনারেটর:** আলফা-নিউমেরিক গিফট ভাউচার কোড যা ই-কমার্স ও POS উভয় জায়গায় রিডিম করা যাবে।
- **অটোমেটেড হোয়াটসঅ্যাপ ও ভাইবার মার্কেটিং:** অফার বা বকেয়া রিমাইন্ডার কাস্টমারের হোয়াটসঅ্যাপ নম্বরে সরাসরি আকর্ষণীয় গ্রাফিক্স ও বাটন সহ পৌঁছানো।

### 🔹 Phase 16: Automated Subscription Billing, Multi-Tier Quotas & SaaS Revenue Engine
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**

### 🔹 Phase 17: Product Hierarchy, Brands, Sub-Categories, Units of Measure & Barcode Sticker Sheet Studio
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **ব্র্যান্ড ও সাব-ক্যাটাগরি হাব (`/src/components/products/ProductHierarchyManager.tsx`):**
  - ব্র্যান্ড মাস্টার (নাম, লোগো, অরিজিন দেশ, ওয়েবসাইট) ও পণ্য কাউন্ট।
  - প্যারেন্ট ক্যাটাগরির সাথে লিঙ্কযুক্ত সাব-ক্যাটাগরি ম্যানেজমেন্ট।
- **ইউনিয়ন অফ মেজার (UOM) ও কনভার্সন ক্যালকুলেটর:**
  - বেস ইউনিট ও সেকেন্ডারি ইউনিট (e.g. `1 Box = 12 Pcs`, `1 Strip = 10 Tablets`, `1 Kg = 1000 gm`)।
  - লাইভ কনভার্সন প্রিভিউয়ার ও টেস্ট ক্যালকুলেটর।
- **প্রারম্ভিক স্টক ভাউচার এন্ট্রি (Opening Stock Vouchers):**
  - নতুন ব্যবসা চালুর সময় পণ্যের প্রারম্ভিক স্টক, ক্রয়মূল্য, মেয়াদ ও ব্যাচ নম্বর সহ ওয়্যারহাউস ভিত্তিক বাল্ক এন্ট্রি।
- **বারকোড ও স্টিকার শিট স্টুডিও (Barcode & Label Sheet Studio):**
  - A4 পেপার শিট (24 ও 30 লেবেল গ্রিড) এবং থার্মাল সিঙ্গেল রোল (50x30mm, 40x25mm)।
  - Code-128, EAN-13 এবং ভেক্টর SVG QR কোড জেনারেটর।
  - ব্রাউজার ফ্রেন্ডলি `@media print` অপ্টিমাইজড প্রিন্ট ইঞ্জিন।
- **Import (Update Only) ইঞ্জিন:**
  - বিদ্যমান পণ্যের ক্রয়মূল্য, বিক্রয়মূল্য ও স্টক দ্রুত আপডেট করার জন্য বাল্ক সিএসভি আপলোডার।
  - ড্রাই-রান ডিফারেন্স প্রিভিউ (ড্রাই রান) ও সরাসরি এক্সিকিউশন।

### 🔹 Phase 18: Returns Management (RMA), Damages & Physical Stock Count Audit
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/returns/ReturnsAndAuditHub.tsx`):**
  - **সেলস রিটার্ন ইঞ্জিন (Sales Return & Credit Notes / RMA):** মূল ইনভয়েস সার্চ, আইটেম নির্বাচন, কোয়ালিটি যাচাই (ভালো পণ্য রিস্টকিং / নষ্ট পণ্য ড্যামেজ লগ) এবং ক্যাশ, বকেয়া সমন্বয় বা ওয়ালেট রিফান্ড।
  - **পারচেজ রিটার্ন ইঞ্জিন (Purchases Return & Debit Notes):** সাপ্লায়ারকে পণ্য ফেরত, ভেন্ডর পেয়্যাবল বকেয়া কর্তন বা রিফান্ড গ্রহণ, এবং প্রিন্ট উপযোগী অফিসিয়াল ডেবিট নোট চালান।
  - **ড্যামেজ ও অপচয় ট্র্যাকিং (Damages & Spoilage Register):** মেয়াদোত্তীর্ণ, ট্রানজিটে ভাঙা বা কীটনাশক ক্ষয়ক্ষতির জন্য সুনির্দিষ্ট ড্যামেজ ভাউচার (`DMG-2026-XXX`), আর্থিক ক্ষতি মূল্যায়ন (Loss in BDT), এবং স্ক্র্যাপ/কোয়ারেন্টাইন নিষ্পত্তি।
  - **ফিজিক্যাল স্টক কাউন্ট / অডিট (Count Stock Cycle Audit):** গোডাউন ভিত্তিক লাইভ সাইকেল কাউন্ট সেশন, বাস্তব গণনা বনাম সফটওয়্যার স্টকের ফারাক (Variance) নিরূপণ, অডিও বিপ সহ দ্রুত বারকোড স্ক্যান কাউন্টার, এবং ১-ক্লিকে ইনভেন্টরি অটো-রিকনসিলিয়েশন।



