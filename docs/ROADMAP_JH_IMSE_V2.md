# JH IMSE — Version 2.0 Master Architecture & Implementation Roadmap
**Next-Generation Multi-Tenant SaaS ERP, 95% Mobile Experience Parity & Complete Enterprise Operations Suite**

---

## 📌 ১. পটভূমি ও রূপরেখা (Executive Summary & Vision)

পূর্ববর্তী সিঙ্গেল-পারপাস স্ট্যান্ডঅ্যালোন সিস্টেম (`demoimse.jhsoft.online` / Stocky IMSE) থেকে সংগৃহীত **২০টি হাই-রেজ্যুলেশন মোবাইল ও মেনু আর্কিটেকচার স্ক্রিনশট** পুঙ্খানুপুঙ্খভাবে বিশ্লেষণ করে এই **JH IMSE Version 2.0 (V2)** রোডম্যাপ প্রণয়ন করা হলো।

### মূল লক্ষ্য ও দূরদৃষ্টি:
1. **SaaS Multi-Tenancy Engine:** একক অ্যাপ্লিকেশনের মধ্য দিয়ে প্রতিটি দোকানের নিজস্ব ব্র্যান্ডিং, ডেটা আইসোলেশন, কাস্টম ডোমেইন ও সাবস্ক্রিপশন কোটা নিশ্চিত রেখে এন্টারপ্রাইজ সক্ষমতা প্রদান।
2. **৯৫% মোবাইল এক্সপেরিয়েন্স সমকক্ষতা (95% Mobile Native Parity):**
   - মোবাইল ৫-ট্যাব বটম নেভিগেশন বার (`Dashboard`, `Sales`, `Products`, `Reports`, `Settings`).
   - গ্রেডিয়েন্ট হেডার কার্ড (দোকানের নাম, ওয়্যারহাউস ফিল্টার, ডেট রেঞ্জ সিলেক্টর)।
   - কুইক অ্যাক্সেস গ্রিড আইকন অ্যাপ লঞ্চার (POS, Sales, Sales Return, Purchases, Purchases Return, Products, Quotations, Transfer, Customers, ইত্যাদি)।
   - স্লাইড-আউট মোবাইল ড্রয়ারে সম্পূর্ণ নেস্টেড একর্ডিয়ন সাবমেনু (Screenshots 3-19 হুবহু সমকক্ষ)।
   - ডায়নামিক থিম ও লেআউট ইঞ্জিন (Sidebar 1 / Sidebar 2, ৯টি প্রাইমারি কালার সোয়াচ প্যালেট `#663399`, ডার্ক মোড ও RTL সাপোর্ট)।
   - মোবাইল পিওএস ক্যাশ রেজিস্টার (ওপেন/ক্লোজড শিফট কন্ট্রোল, বারকোড স্ক্যান মোড, কার্ট ড্রয়ার)।
3. **অনুপস্থিত এন্টারপ্রাইজ মডিউলসমূহ অন্তর্ভুক্তি:**
   - সার্ভিস ও রিপেয়ার মেইনটেন্যান্স (Job Cards, Checklists, AMC)।
   - ফিক্সড অ্যাসেট ও অবচয় ক্যালকুলেশন (Asset Register, SLM/WDV Depreciation)।
   - প্রজেক্ট, টাস্ক, লিগ্যাল কন্ট্রাক্ট ও ক্লায়েন্ট বুকিং ইঞ্জিন।
   - মাল্টি-টায়ার সেলস এজেন্ট কমিশন (Rules, Programs, Receipts, Reports)।
   - সেলস ও পারচেজ রিটার্নস (RMA Workflows, Reversals, Return Ratio)।
   - ড্যামেজ লগ ও ফিজিক্যাল স্টক টেকিং (Count Stock Cycle Audit)।
   - ক্লায়েন্ট পোর্টাল ও রেজিস্টার্ড গ্রাহক অনুমোদন ব্যবস্থা।
   - এক্সটার্নাল এন্টারপ্রাইজ সিঙ্ক (QuickBooks Online, WooCommerce API, Webhooks Hub)।
   - ৩ডি অ্যানালিটিক্স ড্যাশবোর্ড, ক্যাশ রেজিস্টার শিফট রিপোর্ট, নেগেটিভ স্টক ও সিকিউরিটি লগ।

---

## 🗺️ পূর্ববর্তী ফেজ বনাম V2 ফেজ ম্যাপিং (Evolution Blueprint)

```
[Phase 1-9: Core Foundation] -> Completed
   ├── Multi-Tenant POS, Invoices, CRM, Super Admin, HRM, Storefront, Hostinger MySQL
   │
[Phase 10-15: Enterprise Infrastructure] -> Completed
   ├── Phase 10: Double-Entry Accounting, Trial Balance & Bank Reconciliation
   ├── Phase 11: Central Warehouse & Multi-Branch Logistics
   ├── Phase 12: AI Demand Forecasting & Autonomous Auto-PO
   ├── Phase 13: Global Commerce, Forex & Multi-Currency
   ├── Phase 14: Omnichannel WhatsApp Cloud API & VIP Loyalty Rewards
   └── Phase 15: Sunmi & iMin Native POS Hardware Suite
         │
         ▼
══════════════════════════════════════════════════════════════════════════════════
 🚀 JH IMSE VERSION 2.0 (V2) EXTENDED ROADMAP (Phase 16 to Phase 25)
══════════════════════════════════════════════════════════════════════════════════
   ├── [Phase 16]: Mobile-First Adaptive Shell, Theme Studio & Dynamic Appearance `[COMPLETED]`
   ├── [Phase 17]: Product Hierarchy, Brands, Sub-Categories & Label/Barcode Sheets `[COMPLETED]`
   ├── [Phase 18]: Returns Management (RMA), Damages & Physical Stock Count Audit `[COMPLETED]`
   ├── [Phase 19]: Multi-Tier Sales Agent Commission Program & Rule Engine `[COMPLETED]`
   ├── [Phase 20]: Service, Repair Jobs & Maintenance Management (AMC / Warranty) `[COMPLETED]`
   ├── [Phase 21]: Fixed Asset Management, Maintenance & Depreciation (SLM/WDV) `[COMPLETED]`
   ├── [Phase 22]: Projects, Tasks Kanban, Contracts & Appointment Bookings `[COMPLETED]`
   ├── [Phase 23]: People Management, Client Self-Service Portal & Invited Customers
   ├── [Phase 24]: 3D Dashboard, Cash Register Shift Reports & Analytical Intelligence
   └── [Phase 25]: QuickBooks Online Sync, WooCommerce API, Webhooks & Security Hub
```

---

## 📋 ফেজভিত্তিক বিস্তারিত পরিকল্পনা (Detailed Phase Breakdown)

---

### Phase 16: Mobile-First Adaptive Shell, Theme Studio & Dynamic Appearance `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 1, Screenshot 2, Screenshot 18, Screenshot 20

- **উদ্দেশ্য:** যেকোনো স্মার্টফোনে ব্রাউজ বা ইনস্টল করা PWA-তে ৯৫% নেটিভ অ্যাপ ফিল এবং স্ক্রিনশটে প্রদর্শিত থিম কাস্টমাইজেশন প্রদান করা।
- **প্রধান ফিচারসমূহ:**
  1. **মোবাইল বটম নেভিগেশন বার (Bottom Nav):**
     - ৫টি ফিক্সড অ্যাকশন ট্যাব: `Dashboard` 📊, `Sales` 🛒, `Products` 📦, `Reports` 📈, `Settings` ⚙️ (ফ্লোটিং অ্যাকসেন্ট বাটন সহ)।
  2. **মোবাইল ড্যাশবোর্ড হেডার ও কুইক লঞ্চার গ্রিড:**
     - পার্পল গ্রেডিয়েন্ট ওয়েলকাম কার্ড ("Welcome back! Here's what's happening today").
     - ওয়্যারহাউস ড্রপডাউন ফিল্টার ও কুইক ডেট রেঞ্জ পিকার।
     - রাউন্ডেড কুইক এক্সেস আইকন গ্রিড:
       - POS (Calculator Icon)
       - Sales & Sales Return
       - Purchases & Purchases Return
       - All Products & Quotations
       - Stock Transfer & Customers
  3. **মোবাইল স্লাইড-আউট নেভিগেশন ড্রয়ার (Nested Tree Accordion):**
     - মাল্টি-লেভেল ড্রপডাউন (Dashboard, Store, People, User Management, Products, Adjustment, Purchases, Sales, Quotations, Transfer, Damages, HRM, Accounting, Subscriptions, Service, Assets, Projects, Contracts, Tasks, Bookings, Commissions, WooCommerce, Knowledge Base, Settings, Reports)।
  4. **ডায়নামিক অ্যাপিয়ারেন্স ও থিম স্টুডিও (Dynamic Appearance Modal):**
     - **Sidebar Layout Toggle:** Sidebar 1 (কম্প্যাক্ট মিনি) বনাম Sidebar 2 (ফুল এক্সপ্যান্ডেড)।
     - **Primary Color Palette:** ৯টি কালার সোয়াচ (Royal Purple `#663399`, Royal Blue, Emerald Green, Hot Pink, Amber Orange, Flame Red, Cyan Blue, Midnight Dark, এবং কাস্টম হেক্স কোড পিকার)।
     - **Dark Mode Switch:** তাৎক্ষণিক ডার্ক ও লাইট মোড টগল।
     - **RTL (Right to Left) Switch:** আরবি বা হিব্রু মোডের জন্য লেআউট ফ্লিপ।
  5. **মোবাইল পিওএস ক্যাশ রেজিস্টার কন্ট্রোল:**
     - রেজিস্টার স্ট্যাটাস ব্যাজ (`CLOSED` / `OPEN`)।
     - ওপেনিং ক্যাশ ব্যালেন্স এন্ট্রি ও ক্লোজিং ক্যাশ শিফট কাউন্টার।
     - ওয়াক-ইন গ্রাহক সিলেক্টর, ওয়্যারহাউস, ক্যাটাগরি ও ব্র্যান্ড ফিল্টার পিলস।
     - মোবাইল বারকোড ক্যামেরা ও দ্রুত কার্ট ড্রয়ার উইথ ট্যাক্স, ডিসকাউন্ট ও শিপিং ইনপুট।

---

### Phase 17: Product Hierarchy, Brands, Sub-Categories & Label/Barcode Sheets `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 8

- **উদ্দেশ্য:** ইনভেন্টরির প্রতিটি পণ্যকে আন্তর্জাতিক স্ট্যান্ডার্ডে ব্র্যান্ড, সাব-ক্যাটাগরি, ইউনিট এবং বারকোড লেবেল শিটের আওতায় আনা।
- **প্রধান ফিচারসমূহ:**
  1. **ব্র্যান্ড ও সাব-ক্যাটাগরি রিলেশনশিপ:**
     - প্রোডাক্ট ক্যাটাগরির অধীনে একাধিক সাব-ক্যাটাগরি ম্যাপিং।
     - ব্র্যান্ড মাস্টার তালিকা (Logo, Website, Origin Country)।
  2. **ইউনিট পরিমাপ ও কনভার্সন (UOM):**
     - বেস ইউনিট বনাম সেলস/পারচেজ ইউনিট (যেমন: ১ কার্টুন = ১২ পিস, ১ কেজি = ১০০০ গ্রাম)।
  3. **প্রারম্ভিক স্টক (Opening Stock Setup):**
     - নতুন দোকান বা আর্থিক বছরের শুরুতে প্রাথমিক স্টক, লট ও ক্রয়মূল্য এককালীন সেট করা।
  4. **বারকোড লেবেল ও স্টিকার প্রিন্টিং শিট (Print Labels):**
     - A4 স্টিকার শিট (২৪ লেবেল, ৩০ লেবেল) এবং ৫০x৩০মিমি রোল পেপারে বারকোড (Code 128, EAN-13, QR)।
     - পণ্যের নাম, ভ্যারিয়েন্ট, ব্র্যান্ড, এমআরপি এবং মেয়াদোত্তীর্ণ তারিখ কাস্টমাইজেশন।
  5. **বাল্ক আপডেট এক্সেল ইঞ্জিন (Import Update Only):**
     - নতুন পণ্য যোগ না করে শুধুমাত্র বিদ্যমান পণ্যের দাম ও স্টক বাল্ক আপডেট করার এক্সেল/সিএসভি আপলোডার।

---

### Phase 18: Returns Management (RMA), Damages & Physical Stock Count Audit `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 3, Screenshot 6, Screenshot 8, Screenshot 13, Screenshot 18
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/returns/ReturnsAndAuditHub.tsx`):**
  1. **সেলস রিটার্ন ইঞ্জিন (Sales Return & Credit Notes / RMA):**
     - ইনভয়েস সার্চ ও রিটার্ন কোয়ান্টিটি ফিল্টারিং।
     - পণ্যের কোয়ালিটি যাচাই (ভালো পণ্য স্টকে রিস্টক, নষ্ট পণ্য ড্যামেজে স্থানান্তর)।
     - ক্যাশ রিফান্ড, বকেয়া সমন্বয় অথবা কাস্টমার স্টোর ক্রেডিটে রিফান্ড জমা।
     - প্রিন্ট অপ্টিমাইজড RMA ক্রেডিট নোট ভাউচার।
  2. **পারচেজ রিটার্ন ইঞ্জিন (Purchases Return & Debit Notes):**
     - সাপ্লায়ার নির্বাচন ও ত্রুটিযুক্ত পণ্যের ডেবিট চালান তৈরি।
     - ভেন্ডর বকেয়া থেকে কর্তন বা ক্যাশ রিফান্ড।
     - গেটপাস ও ড্রাইভার স্বাক্ষর সহ ডেবিট নোট প্রিন্ট।
  3. **ড্যামেজ ও অপচয় ট্র্যাকিং (Damages & Spoilage Register):**
     - মেয়াদোত্তীর্ণ, পরিবহনে ভাঙা বা কীটনাশক ক্ষয়ক্ষতির অফিসিয়াল ড্যামেজ ভাউচার (`DMG-2026-XXX`)।
     - মোট আর্থিক ক্ষতি মূল্যায়ন (Loss Valuation in BDT) এবং ইনভেন্টরি থেকে অপসারন।
     - ডিসপোজাল প্রটোকল (সম্পূর্ণ ধ্বংস, কোয়ারেন্টাইন বা স্ক্র্যাপ)।
  4. **ফিজিক্যাল স্টক কাউন্ট / অডিট (Count Stock Cycle Audit):**
     - ওয়্যারহাউস বা ক্যাটাগরি ভিত্তিক সাইকেল কাউন্ট সেশন (`AUD-2026-XXX`)।
     - সিস্টেম স্টক বনাম বাস্তব গণনা তুলনা এবং লাইভ ঘাটতি/অতিরিক্ত শনাক্তকরণ।
     - বারকোড স্ক্যানার দিয়ে সরাসরি +১ কাউন্ট স্বয়ংক্রিয় যোগ।
     - ১-ক্লিকে ইনভেন্টরি স্বয়ংক্রিয় স্টক সমন্বয় (Auto-Reconcile Stock Adjustment)।

---

### Phase 19: Multi-Tier Sales Agent Commission Program & Rule Engine
> **স্ক্রিনশট রেফারেন্স:** Screenshot 4
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/commissions/CommissionManager.tsx`):**
  1. **কমিশন প্রোগ্রাম ও সেলস এজেন্ট প্রোফাইল (`Sales Agents` & `Programs`):**
     - ফিল্ড সেলস এজেন্ট ও রিপ্রেজেনটেটিভদের পূর্ণাঙ্গ প্রোফাইল, মোবাইল, টেরিটরি ও মাসিক সেলস টার্গেট প্রোগ্রেস বার।
     - ৪ ধরনের মাল্টি-টায়ার কমিশন ক্যালকুলেশন মেকানিজম (`percentage_of_sales`, `percentage_of_profit`, `tiered_volume`, `flat_per_unit`)।
     - মাইলস্টোন বোনাস থ্রেশহোল্ড (যেমন: ৳৫,০০,০০০ অর্জনে অতিরিক্ত ৳১০,০০০ ফ্ল্যাট বোনাস)।
  2. **কমিশন রুলস ইঞ্জিন (Commission Rules Engine):**
     - স্বয়ংক্রিয় কন্ডিশন চেকার (`min_sales_amount`, `brand_specific`, `new_customer_bonus`)।
     - ইনসেন্টিভ রিওয়ার্ড ট্র্যাকার (`rate_boost_pct`, `fixed_bonus_bdt`)।
  3. **কমিশন রসিদ ও সেটেলমেন্ট (Commission Receipts & Payouts):**
     - কমিশন পেমেন্ট পে-আউট ভাউচার জেনারেটর (`REC-2026-XXX`)।
     - উৎস কর কর্তন (TDS Withholding Tax 5% - 10%) স্বয়ংক্রিয় কর্তন এবং নেট প্রদেয় নির্ধারণ।
     - bKash, Nagad, Bank ও Cash ট্রানজেকশন আইডি সহ সেটেলমেন্ট ও প্রিন্ট অপ্টিমাইজড ভাউচার রসিদ।
  4. **কমিশন অ্যানালিটিক্স ও পারফরম্যান্স লিডারবোর্ড (Reports & Leaderboard):**
     - ROI রেশিও অ্যানালিটিক্স (`বিক্রয় জেনারেট / কমিশন পরিশোধ`) এবং টেরিটরি-ভিত্তিক পারফরম্যান্স।
     - টপ পারফর্মার লিডারবোর্ড ব্যাজ (Rank #1, #2, #3, Star Performer)।

---

### Phase 20: Service, Repair Jobs & Maintenance Management (AMC / Warranty) `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 5, Screenshot 9, Screenshot 16, Screenshot 17
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/services/ServiceMaintenanceManager.tsx`):**
  1. **সার্ভিস ও রিপেয়ার জব টিকিট কার্ড (`ServiceJobTicket` / `JOB-2026-XXX`):**
     - ডিভাইস ইনটেক ও স্পেসিফিকেশন (ডিভাইসের ধরণ, ব্র্যান্ড, মডেল, IMEI/Serial, প্যাটার্ন/পিন সিকিউরিটি লক, আনুমানিক ডেলিভারি সময়)।
     - গ্রাহক অ্যাকসেসরিজ চেকলিস্ট (চার্জার, অরিজিনাল বক্স, সিম ট্রে, মেমোরি কার্ড, ইত্যাদি)।
     - ৭-ধাপের ওয়ার্কবেঞ্চ প্রসেস পাইপলাইন (`received` ➜ `in_diagnosis` ➜ `waiting_for_parts` ➜ `in_repair` ➜ `ready_for_qa` ➜ `completed` ➜ `delivered`)।
     - ইনভেন্টরি স্পেয়ার পার্টস কনজাম্পশন (অটো স্টক ডিডাকশন) ও টেকনিশিয়ান সার্ভিস চার্জ যোগ।
     - ডুয়াল প্রিন্ট স্লিপ মোডাল: ৮০মিমি থার্মাল পিওএস রসিদ এবং অফিসিয়াল এ৪ সার্ভিস ইনভয়েস উইথ কিউআর কোড।
  2. **প্রি ও পোস্ট রিপেয়ার QA চেকলিস্ট রিপোর্ট (`InspectionChecklist`):**
     - ৬ ক্যাটাগরির ১২+ টেকনিক্যাল হার্ডওয়্যার চেকপয়েন্ট (Display & Touch, Power & Battery, Audio, Cameras, Connectivity, Ports/Sensors)।
     - ৩-অবস্থা বাটন (Pass / Fail / N/A), স্বয়ংক্রিয় পার্সেন্টেজ স্কোর গণনা এবং ইন্সপেক্টর অফিসিয়াল সিল-স্বাক্ষর।
     - প্রিন্ট অপ্টিমাইজড QA সার্টিফিকেশন পত্র।
  3. **বার্ষিক রক্ষণাবেক্ষণ চুক্তি (AMC - Customer Maintenance Contracts):**
     - ৪-টায়ার মেইনটেন্যান্স কন্ট্রাক্ট ইঞ্জিন (`Standard`, `Silver`, `Gold`, `Enterprise 24/7`)।
     - ফ্রিকোয়েন্সি শিডিউলার (Monthly, Quarterly, Bi-Annual, Annual) এবং কভার্ড যন্ত্রপাতির বিস্তারিত রেজিস্ট্রি।
     - রুটিন ভিজিট ট্র্যাকিং, রিপ্লেসড পার্টস লগ, কাস্টমার ৫-স্টার রেটিং ও স্বয়ংক্রিয় এসএমএস সার্ভিস রিমাইন্ডার টগল।
  4. **ওয়ারেন্টি ও গ্যারান্টি ট্র্যাকিং ইঞ্জিন (`WarrantyRecord` & `WarrantyClaim`):**
     - ইনস্ট্যান্ট IMEI / সিরিয়াল নম্বর লুকআপ ইঞ্জিন এবং লাইভ ওয়ারেন্টি কাউন্টডাউন ও স্ট্যাটাস ব্যাজ (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `VOIDED`)।
     - সরবরাহকারী ভেন্ডর RMA ক্লেইম সাবমিশন (`FREE_REPAIR`, `REPLACEMENT`, `PAID_SERVICE`, `REJECTED_VOID`)।


---

### Phase 21: Fixed Asset Management, Maintenance & Depreciation (SLM/WDV) `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 17
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/assets/FixedAssetManager.tsx`):**
  1. **স্থায়ী সম্পদ খতিয়ান ও রেজিস্টার (`FixedAsset` / `AST-2026-XXX`):**
     - ৯টি ক্যাটাগরির অ্যাসেট শ্রেণীবিভাগ (Office Appliances, POS Hardware, IT & Computers, Furniture & Fixtures, Heavy Machinery, Vehicles, Medical Equipment, Leasehold Improvements, Other)।
     - অ্যাসেট কোড, সিরিয়াল/বারকোড নম্বর, ক্রয়মূল্য, ভগ্নাংশ (Salvage) মূল্য, অবস্থান, দায়িত্বপ্রাপ্ত কাস্টোডিয়ান এবং ওয়ারেন্টির মেয়াদ।
     - লাইভ নেট বুক ভ্যালু (Net Carrying Value / NBV) এবং অবচয় অগ্রগতি প্রোগ্রেস বার।
  2. **দ্বৈত অবচয় ইঞ্জিন (Dual Depreciation Engine: SLM / WDV):**
     - **সরলরৈখিক পদ্ধতি (SLM):** `(ক্রয়মূল্য - স্ক্র্যাপ মূল্য) / আয়ুষ্কাল` সমান বার্ষিক ও মাসিক হার নির্ণয়।
     - **ক্রমহ্রাসমান পদ্ধতি (WDV):** বর্তমান বুক ভ্যালু ও বিধিবদ্ধ অবচয় হারের ভিত্তিতে চক্রবৃদ্ধি হ্রাস।
     - **বহুবর্ষীয় অবচয় শিডিউল:** বছরভিত্তিক প্রারম্ভিক বুক ভ্যালু, অবচয়ের পরিমাণ, পুঞ্জীভূত অবচয় ও সমাপনী বুক ভ্যালু তালিকা।
     - **স্বয়ংক্রিয় ডাবল-এন্ট্রি জাবেদা পোস্টিং:** একাউন্টিং লেজারে ডেবিট (অবচয় খরচ ৬২১০) ও ক্রেডিট (পুঞ্জীভূত অবচয় ১৫৯০) অটো পোস্টিং।
  3. **রক্ষণাবেক্ষণ ও মেরামত ট্র্যাকার (`AssetMaintenanceRecord`):**
     - সার্ভিস প্রোভাইডার, কাজের ধরন (`preventive`, `corrective_repair`, `upgrade`, `inspection`), ইনভয়েস বিল নং, খরচ (৳), প্রতিস্থাপিত পার্টস এবং পরবর্তী শিডিউল তারিখ লগ।
  4. **সম্পদ নিষ্পত্তি, স্ক্র্যাপ বিক্রয় ও লাভ/ক্ষতি (`AssetDisposal`):**
     - সম্পদ বাতিল বা বিক্রয় কালে প্রাপ্ত মূল্য বনাম তৎকালীন বুক ভ্যালুর ভিত্তিতে স্বয়ংক্রিয় লাভ/ক্ষতি (Gain/Loss on Sale) নির্ণয়।
     - জেনারেল জার্নাল ভাউচার সমন্বয় (ক্যাশ ডেবিট, পুঞ্জীভূত অবচয় ডেবিট, লাভ/ক্ষতি ডেবিট/ক্রেডিট ও সম্পদ ক্রেডিট)।
     - অফিসিয়াল সম্পদ নিষ্পত্তি সার্টিফিকেট পত্র।
  5. **বারকোড ও QR ট্যাগ জেনারেটর (`AssetTagPrintModal`):**
     - সম্পদে সেঁটে দেওয়ার মতো থার্মাল/লেজার ৬০x৪০মিমি বারকোড ও কিউআর লেবেল প্রিন্টার ইন্টিগ্রেশন।


---

### Phase 22: Projects, Tasks Kanban, Contracts & Appointment Bookings `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 4, Screenshot 17
- **স্ট্যাটাস:** ✅ **সম্পন্ন ও কোডবেসে লাইভ**
- **উপাদানসমূহ (`/src/components/projects/ProjectsAndBookingsHub.tsx`):**
  1. **প্রজেক্ট ট্র্যাকিং ও মাইলস্টোন (`Project` / `PRJ-2026-XXX`):**
     - প্রজেক্ট বাজেট, প্রকৃত খরচ (Actual Cost), ক্লায়েন্ট বিলিং ভ্যালু এবং নিট গ্রস প্রফিট মার্জিন শতাংশ ট্র্যাকিং।
     - ক্লায়েন্ট ও কাস্টমার লিঙ্কিং (নাম, ফোন, প্রতিষ্ঠান), দায়িত্বপ্রাপ্ত প্রজেক্ট ম্যানেজার ও ডেলিভারি ডেডলাইন।
     - ধাপে ধাপে মাইলস্টোন ডেলিভারেবল চেকলিস্ট, বিলিং অ্যামাউন্ট এবং প্রোগ্রেস বার (০% - ১০০%)।
  2. **টাস্ক কানবান বোর্ড (`ProjectTask` / `TSK-XXX`):**
     - ৪-কলাম ইন্টারঅ্যাক্টিভ কানবান বোর্ড (`To Do`, `In Progress`, `In Review`, `Completed`)।
     - প্রায়োরিটি ট্যাগিং (`Urgent`, `High`, `Medium`, `Low`), আনুমানিক ও ব্যয়িত কর্মঘণ্টা।
     - সাব-টাস্ক চেকলিস্ট উইথ লাইভ পার্সেন্টেজ ও চেকমার্ক টগল এবং এক কলাম থেকে অন্য কলামে মুভ অ্যাকশন।
  3. **বাণিজ্যিক চুক্তিপত্র ইঞ্জিন (`CommercialContract` / `CNT-2026-XXX`):**
     - ৫টি ক্যাটাগরি (`Corporate Supply`, `Service SLA`, `Vendor Distribution`, `Franchise License`, `NDA / MOU`)।
     - বি২বি ক্লায়েন্ট বা সাপ্লায়ার অ্যাসোসিয়েশন, চুক্তি মূল্য, পেমেন্ট টার্মস (`Milestone`, `Monthly Retainer`, `Net 30`, ইত্যাদি)।
     - কাস্টমাইজেবল লিগ্যাল ক্লজ বিল্ডার, অটো-রিনিউয়াল নোটিশ ট্র্যাকিং ও অফিসিয়াল প্রিন্ট প্রিভিউ উইথ সিল-স্বাক্ষর।
  4. **অ্যাপয়েন্টমেন্ট ও বুকিং শিডিউলার (`AppointmentBooking` / `BKG-2026-XXX`):**
     - কাস্টমার বুকিং, সার্ভিস টাইপ (`Consultation`, `Installation`, `Maintenance Visit`, `On-site Inspection`), ডেট ও টাইম স্লট।
     - বিশেষজ্ঞ টেকনিশিয়ান/স্টাফ অ্যাসাইনমেন্ট, বুকিং ফি ও পেমেন্ট স্ট্যাটাস (`Paid`, `Pending`, `Refunded`)।
     - ১-ক্লিক এসএমএস রিমাইন্ডার পাঠানোর অ্যাকশন।

---

### Phase 23: People Management, Client Self-Service Portal & Invited Customers `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 11, Screenshot 19
> **বাস্তবায়িত ফাইল:** `/src/components/people/PeopleAndClientPortalHub.tsx`, `/src/types/index.ts`, `/src/data/mockData.ts`

- **উদ্দেশ্য:** ওয়াক-ইন গ্রাহক বনাম লগইন করা রেজিস্টার্ড গ্রাহকদের আলাদা করা এবং সম্পূর্ণ ফাংশনাল ক্লায়েন্ট সেলফ-সার্ভিস পোর্টাল প্রদান।
- **বাস্তবায়িত প্রধান ফিচারসমূহ:**
  1. **কাস্টমার সেগমেন্টেশন ও ডিরেক্টরি (Segmentation & Directory):**
     - **Customers without Login:** কাউন্টারের নিয়মিত ওয়াক-ইন গ্রাহক (মোবাইল নম্বর ও অফলাইন খাতা বেসড)।
     - **Customers with Login:** অনলাইন সেলফ-সার্ভিস অ্যাকাউন্ট সক্রিয় ক্লায়েন্ট (Username, Password, Status toggling)।
     - ক্রেডিট লিমিট অতিক্রমকারী (Over Credit Limit), ভিআইপি লয়্যালটি মেম্বার এবং হোলসেলার ফিল্টারিং।
     - এডমিন প্যানেল থেকে যেকোনো সাধারণ গ্রাহককে ১-ক্লিকেই পোর্টাল একাউন্ট তৈরি ও ক্রেডেনশিয়াল জেনারেট করে দেওয়ার সুবিধা।
  2. **বি২বি ইনভাইটেশন কোড ইঞ্জিন (B2B Invitation Codes Engine):**
     - হোলসেলার ও ডিস্ট্রিবিউটরদের জন্য বিশেষ কোড তৈরির ফর্ম (কোড নম্বর, মেয়াদ, শতাংশভিত্তিক ডিসকাউন্ট, ডিফল্ট ক্রেডিট লিমিট ও রিডেম্পশন লিমিট)।
     - ইনভাইট লিংক কপি এবং রিডেম্পশন প্রগ্রেস বার।
  3. **আবেদন ও অনুমোদন কিউ (Pending Applications & Trade License Queue):**
     - বি২বি পাইকারি গ্রাহকদের রেজিস্ট্রেশন আবেদন রিভিউ (ট্রেড লাইসেন্স ও BIN/VAT যাচাইকরণ)।
     - ১-ক্লিক অনুমোদন: আবেদন এপ্রুভ করার সাথে সাথে স্বয়ংক্রিয়ভাবে একটি ভেরিফাইড Customer তৈরি হয় এবং পোর্টাল লগইন সক্রিয় হয়।
     - রিজেকশন কারণ উল্লেখ করে বাতিল বা নতুন ম্যানুয়াল এন্ট্রি করার অপশন।
  4. **ক্লায়েন্ট সেলফ-সার্ভিস পোর্টাল সিমুলেটর (Live Client Portal Preview):**
     - যেকোনো লগইন করা গ্রাহকের দৃষ্টিকোণ থেকে পোর্টাল প্রিভিউ (কাস্টমার ড্রপডাউন সিলেক্টর)।
     - ওভারভিউ KPI কার্ডস (মোট কেনাকাটা, চলতি বকেয়া, ক্রেডিট লিমিট, অর্জিত রিওয়ার্ড পয়েন্ট)।
     - **My Invoices & Receipts:** পূর্বের সমস্ত ইনভয়েস তালিকা ও A4 রিসিট সরাসরি প্রিন্ট/ডাউনলোড করার ব্যবস্থা।
     - **Digital Due Payment:** অনলাইন পেমেন্ট দাবি সাবমিশন (bKash / Nagad / Bank / Rocket-এ টাকা পাঠিয়ে TxID ও স্ক্রিনশট রেফারেন্স সাবমিট করা)।
     - এডমিন অনুমোদনের সাথে সাথে স্বয়ংক্রিয়ভাবে কাস্টমার লেজার আপডেট ও পেমেন্ট রিসিট ভাউচার তৈরি।
     - **Live Service & Repair Tracking:** গ্রাহকের ডিভাইসের বর্তমান সার্ভিস স্ট্যাটাস (Intake, In Progress, Ready for Delivery) লাইভ ট্র্যাক করা।
     - বাণিজ্যিক চুক্তিপত্র (Contracts) ও বুকিং ট্র্যাকিং।

---

### Phase 24: 3D Dashboard, Cash Register Shift Reports & Analytical Intelligence `[COMPLETED & VERIFIED]`
> **স্ক্রিনশট রেফারেন্স:** Screenshot 9, Screenshot 15, Screenshot 16
> **বাস্তবায়ন স্ট্যাটাস:** ✅ সম্পূর্ণ বাস্তবায়িত ও কম্পাইল ভেরিফাইড (All 5 Sub-Modules Live & Functional)

- **উদ্দেশ্য:** এক্সিকিউティブ ডিসিশন মেকিংয়ের জন্য দৃশ্যমান ৩ডি অ্যানালিটিক্স, ক্যাশ কাউন্টার অডিট এবং গভীর গোয়েন্দা রিপোর্ট।
- **বাস্তবায়িত প্রধান ফিচারসমূহ:**
  1. **৩ডি স্পেশাল সেলস ড্যাশবোর্ড (3D Interactive Spatial Sales Dashboard):**
     - মাল্টি-আউটলেট তুলনামূলক ৩ডি ভিউ, পারসপেক্টিভ ও আইসোমেট্রিক কন্ট্রোলস, ৩৬০° রোটেশন স্লাইডার ও লাইটিং শ্যাডো ইফেক্ট।
     - ক্যাটাগরি ভলিউম কিউবস এবং সময়ভিত্তিক (আজ, এই সপ্তাহ, এই মাস, ত্রৈমাসিক) গতিশীল গ্রাফিক্যাল বিশ্লেষণ।
  2. **ক্যাশ রেজিস্টার শিফট রিপোর্ট ও জেড-রিপোর্ট (Cash Register Shift & Z-Report Reconciliation):**
     - ক্যাশিয়ার শিফট ওপেন/ক্লোজ ট্র্যাকিং, ক্যাশ ড্রপস ও ইন/আউট অ্যাডজাস্টমেন্ট।
     - ফিজিক্যাল ব্যাংক নোট কাউন্টার (৳১০০০, ৳৫০০, ৳২০০, ৳১০০, ৳৫০, কয়েন) সহ রিয়েল-টাইম গণনা।
     - সিস্টেম ক্যাশ বনাম ফিজিক্যাল কাউন্টের ভ্যারিয়েন্স ($\Delta$) গণনা এবং ১-ক্লিক প্রিন্ট উপযোগী অফিসিয়াল Z-Report সামারি।
  3. **ইনভেন্টরি গোয়েন্দা রাডার (Inventory Intelligence Radar):**
     - **Negative Stock Radar:** স্টক শূন্যের নিচে নেমে যাওয়া পণ্যের তাৎক্ষণিক অ্যালার্ট এবং সরাসরি ১-ক্লিকে ফিজিক্যাল অডিট স্টক কারেকশন।
     - **Stock Aging Analysis:** ০-৩০ দিন, ৩১-৬০ দিন, ৬১-৯০ দিন, ৯১-১৮০ দিন ও ১৮০+ দিন পুরনো স্টকের আটকা পড়া মূলধন (Trapped Capital) বিশ্লেষণ।
     - **Batch & Expiry Register:** কোন ব্যাচ কত তারিখে মেয়াদোত্তীর্ণ হবে তার আগাম লাল/হলুদ সতর্কবার্তা ও ফিল্টারিং।
  4. **গ্রাহক ও সরবরাহকারী র্যাঙ্কিং ম্যাট্রিক্স (Customer & Supplier Ranking Matrix):**
     - টপ ৫ হাইয়েস্ট ভ্যালু কাস্টমার লিডারবোর্ড।
     - ইনঅ্যাক্টিভ ও চার্ন-রিস্ক কাস্টমার শনাক্তকরণ (৩০+ দিন যাবত কেনাকাটা নেই) এবং রি-এনগেজমেন্টের জন্য ১-ক্লিক SMS প্ররোচনা।
     - শীর্ষ সাপ্লায়ার স্কোরকার্ড ও অন-টাইম ফুলফিলমেন্ট রেটিং।
  5. **সিকিউরিটি ও এক্টিভিটি অডিট ট্রেল (Security Audit & Error Logs):**
     - ইউজার ডিভাইস লগইন অডিট ট্রেল (আইপি অ্যাড্রেস, ব্রাউজার, ওএস, অবস্থান ও সেশন স্ট্যাটাস)।
     - সিস্টেম এক্সেপশন ও ইরর লগ ভিউয়ার (ইনভয়েস ক্র্যাশ, পেমেন্ট টাইমআউট) উইথ রিজোলিউশন স্ট্যাটাস ওয়ার্কফ্লো ও ডেভেলপার নোটস।

---

### Phase 25: QuickBooks Online Sync, WooCommerce API, Webhooks & Security Hub
> **স্ক্রিনশট রেফারেন্স:** Screenshot 10, Screenshot 12, Screenshot 17

- **উদ্দেশ্য:** বিশ্বখ্যাত সফটওয়্যার ও থার্ড-পার্টি সিস্টেমের সাথে রিয়েল-টাইম ডাটা আদান-প্রদান এবং সিস্টেম হেলথ।
- **প্রধান ফিচারসমূহ:**
  1. **কুইকবুকস ক্লাউড সিঙ্ক (Quickbooks Sync):**
     - JH IMSE-এর ইনভয়েস, পেমেন্ট ও চার্ট অফ অ্যাকাউন্টস QuickBooks Online-এ দ্বিমুখী সিঙ্ক।
  2. **উ-কমার্স ইন্টিগ্রেশন (WooCommerce Settings):**
     - ওয়ার্ডপ্রেস/উ-কমার্স স্টোরের সাথে প্রোডাক্ট ক্যাটালগ ও স্টক রিয়েল-টাইমে পুশ/পুল।
  3. **আউটবাউন্ড ওয়েবহুকস ইঞ্জিন (Webhooks Hub):**
     - নতুন অর্ডার, বিক্রয় বা পেমেন্ট সম্পন্ন হলে থার্ড-পার্টি অ্যাপে HMAC-SHA256 সিকিউরড পে-লোড প্রেরণ।
  4. **লগইন ডিভাইস কন্ট্রোল (Login Device Management):**
     - কোন কোন মোবাইল ও কম্পিউটার থেকে কর্মীরা লগইন আছেন তা প্রদর্শন এবং দূর থেকে সেশন রিভোক/লগআউট করা।
  5. **সিস্টেম হেলথ ও ব্যাকআপ ইঞ্জিন (System Health & Cloud Backup):**
     - ডাটাবেজ হেলথ, মেমোরি ব্যবহার এবং ১-ক্লিকে ফুল ডাটাবেজ ব্যাকআপ ও রিস্টোর।

---

## 🏗️ বাস্তবায়ন ক্রম ও অগ্রাধিকার ম্যাট্রিক্স (Execution Matrix)

| ফেজ | মডিউলের নাম | স্ক্রিনশট রেফারেন্স | জটিলতা | স্ট্যাটাস |
|:---|:---|:---|:---:|:---:|
| **Phase 16** | Mobile-First Adaptive Shell & Dynamic Theme Studio | 1, 2, 18, 20 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 17** | Brands, Sub-Categories, Opening Stock & Label Sheets | 8 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 18** | Returns Management (RMA), Damages & Count Stock | 3, 6, 8, 13 | High | ✅ সম্পন্ন (Verified) |
| **Phase 19** | Multi-Tier Sales Agent Commission Rules & Receipts | 4 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 20** | Service & Repair Jobs, Checklists & AMC Warranty | 5, 9, 16, 17 | High | ✅ সম্পন্ন (Verified) |
| **Phase 21** | Fixed Asset Register & Depreciation (SLM/WDV) | 17 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 22** | Projects, Tasks Kanban, Contracts & Bookings | 4, 17 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 23** | People Segmentation, Client Portal & Invite Codes | 11, 19 | Medium | ✅ সম্পন্ন (Verified) |
| **Phase 24** | 3D Dashboard, Cash Register Reports & Security Logs | 9, 15, 16 | High | ✅ সম্পন্ন (Verified) |
| **Phase 25** | QuickBooks, WooCommerce API, Webhooks & Health Hub | 10, 12, 17 | High | 🌐 পরবর্তী লক্ষ্য (Priority 10) |

---

> *এই মাস্টার রোডম্যাপ ডকুমেন্টটি JH IMSE Version 2.0-এর ভবিষ্যৎ প্রতিটি ফেজের ভিত্তি হিসেবে সংরক্ষিত থাকবে।*
