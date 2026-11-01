# Phase 11: Multi-Branch Logistics & Central Warehouse Architecture
**সেন্ট্রাল ওয়্যারহাউস, আন্তঃশাখা পণ্য স্থানান্তর (Inter-Branch Transfer) ও ট্রানজিট ট্র্যাকিং**

---

## ১. সারসংক্ষেপ ও ব্যবসায়িক প্রয়োজনীয়তা
একটি আন্তর্জাতিক মানের রিটেইল চেইন বা এন্টারপ্রাইজে সাধারণত একটি **সেন্ট্রাল গুদাম (Central Distribution Center - CDC)** থাকে যা সরাসরি মিল/কারখানা বা ইম্পোর্টারদের থেকে বড় লটে পণ্য সংগ্রহ করে। এরপর চাহিদা অনুযায়ী বিভিন্ন ব্রাঞ্চে বা আউটলেটে মাল সরবরাহ করা হয়।

Phase 11-এর মূল লক্ষ্য হলো শাখাগুলোর মধ্যে এবং কেন্দ্রীয় গুদামের মধ্যে পণ্যের নিখুঁত ট্র্যাকিং নিশ্চিত করা।

---

## ২. ওয়ার্কফ্লো ও স্টেপ-বাই-স্টেপ প্রক্রিয়া (Workflow Lifecycle)

```
[ব্রাঞ্চ আউটলেট (Branch Outlet)]
         │
         │  1. চাহিদা পত্র তৈরি (Store Requisition Order - RO)
         ▼
[সেন্ট্রাল ওয়্যারহাউস (Central CDC)]
         │
         │  2. অনুমোদন ও স্টক বরাদ্দ (Pick, Pack & Weigh)
         ▼
[ট্রান্সফার গেটপাস চালান (Transfer Challan)]
         │
         │  3. ডিসপ্যাচ ও ট্রানজিট স্ট্যাটাস (Goods In Transit - GIT)
         ▼
[ব্রাঞ্চ রিসিভিং ও কিউআর স্ক্যান (Barcode Gate-In)]
         │
         │  4. রিসিভ নিশ্চিতকরণ ও ঘাটতি/ড্যামেজ রিপোর্ট (GRN)
         ▼
[স্বয়ংক্রিয় ইনভেন্টরি ও জাবেদা সমন্বয় (Inventory & JV Auto-Update)]
```

---

## ৩. ডেটাবেস স্কিমা ও রিলেশনশিপ (MySQL 8.0 Proposed Schema)

```sql
-- 1. স্টক চাহিদাপত্র টেবিল (Store Requisition Order)
CREATE TABLE IF NOT EXISTS branch_requisitions (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    requisition_no VARCHAR(50) UNIQUE NOT NULL, -- e.g. "RO-DHK-0042"
    from_branch_id VARCHAR(36) NOT NULL,
    to_warehouse_id VARCHAR(36) NOT NULL,
    requested_by VARCHAR(36) NOT NULL,
    status ENUM('draft', 'submitted', 'approved', 'partially_fulfilled', 'completed', 'rejected') DEFAULT 'submitted',
    urgency ENUM('normal', 'urgent', 'critical') DEFAULT 'normal',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. চাহিদাপত্রের আইটেমসমূহ
CREATE TABLE IF NOT EXISTS branch_requisition_items (
    id VARCHAR(36) PRIMARY KEY,
    requisition_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    requested_qty DECIMAL(10, 2) NOT NULL,
    approved_qty DECIMAL(10, 2) DEFAULT 0.00,
    unit_cost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (requisition_id) REFERENCES branch_requisitions(id) ON DELETE CASCADE
);

-- 3. স্টক স্থানান্তর চালান (Inter-Branch Transfer Challan)
CREATE TABLE IF NOT EXISTS stock_transfer_challans (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    transfer_no VARCHAR(50) UNIQUE NOT NULL, -- e.g. "TR-2026-0089"
    requisition_id VARCHAR(36),
    source_warehouse_id VARCHAR(36) NOT NULL,
    destination_branch_id VARCHAR(36) NOT NULL,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    vehicle_no VARCHAR(50),
    total_items INT DEFAULT 0,
    total_cost_value DECIMAL(12, 2) NOT NULL,
    status ENUM('dispatched', 'in_transit', 'received', 'discrepancy') DEFAULT 'dispatched',
    dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    received_at TIMESTAMP NULL,
    received_by VARCHAR(36) NULL
);
```

---

## ৪. অ্যাকাউন্টিং জাবেদা ইন্টিগ্রেশন (Accounting Entries)

### ১. গুদাম থেকে মাল বের হয়ে ট্রানজিটে যাওয়ার সময়:
```text
Dr. 1055 পণ্য ট্রানজিটে (Goods in Transit - Asset)     ৳ ৫০,০০০
    Cr. 1050 পণ্য স্টক - সেন্ট্রাল গুদাম (Inventory CDC)     ৳ ৫০,০০০
```

### ২. শাখা আউটলেটে মাল সফলভাবে রিসিভ হওয়ার পর:
```text
Dr. 1050 পণ্য স্টক - ধানমন্ডি শাখা (Inventory Dhanmondi) ৳ ৫০,০০০
    Cr. 1055 পণ্য ট্রানজিটে (Goods in Transit)               ৳ ৫০,০০০
```

### ৩. ট্রানজিটে নষ্ট বা ঘাটতি হলে (Damage / Loss in Transit):
```text
Dr. 6070 পণ্য পরিবহন ড্যামেজ ক্ষতি (Loss in Transit Expense) ৳ ২,০০০
Dr. 1050 পণ্য স্টক - ধানমন্ডি শাখা (Inventory Dhanmondi)    ৳ ৪৮,০০০
    Cr. 1055 পণ্য ট্রানজিটে (Goods in Transit)                  ৳ ৫০,০০০
```

---

## ৫. বাস্তবায়ন চেকলিস্ট (Status: ✅ ১০০% সম্পন্ন ও কোডবেসে লাইভ)
- [x] মাল্টি-ওয়্যারহাউস ড্রপডাউন, সেন্ট্রাল ডিপো ও পারমিশন কন্ট্রোল
- [x] চাহিদাপত্র তৈরি (RO), অনুমোদন ওয়ার্কফ্লো ও প্রিন্ট ভিউ
- [x] সেন্ট্রাল ট্রান্সফার চালান, সিকিউরিটি গেটপাস ও বারকোড স্ক্যান ভ্যালিডেশন
- [x] পণ্য ট্রানজিট ট্র্যাকিং (Goods in Transit - GIT) এবং লাইভ স্টক বিয়োজন
- [x] গুডস রিসিভ নোট (GRN), পরিবহন ড্যামেজ/ঘাটতি ক্ষতি নিরূপণ এবং অটোমেটিক স্টক ইন
- [x] ফেজ ১০ স্বয়ংক্রিয় দ্বি-তরফা অ্যাকাউন্টিং জাবেদা ইন্টিগ্রেশন (Dr. 1055, Cr. 1050 / Dr. 1050, Dr. 6070, Cr. 1055)
- [x] শাখাভিত্তিক পারফরম্যান্স, লাভজনকতা ও P&L অ্যানালিটিক্স
