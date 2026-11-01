# Phase 10: Automated Double-Entry Accounting & Audit Specification
**দ্বি-তরফা দাখিলা হিসাববিজ্ঞান, হিসাবের চার্ট (COA) ও আর্থিক নিরীক্ষা বিবরণী**

---

## ১. সারসংক্ষেপ ও অ্যাকাউন্টিং দর্শন (Overview)
Phase 10-এ প্ল্যাটফর্মে বিশ্বমানের **দ্বি-তরফা দাখিলা অ্যাকাউন্টিং সিস্টেম (Double-Entry Bookkeeping)** যুক্ত করা হয়েছে।
এর মাধ্যমে প্রতিটি আর্থিক লেনদেনের দুটি সমপরিমাণ বিপরীতমুখী প্রভাব নিশ্চিত হয়:
$$\sum \text{Debit} = \sum \text{Credit}$$

---

## ২. হিসাবের চার্ট ও ৫-স্তর বিশিষ্ট ক্যাটাগরি (Chart of Accounts Structure)

| কোড রেঞ্জ | প্রধান ক্যাটাগরি | অ্যাকাউন্টের ধরন (Classification) | স্বাভাবিক জের (Normal Balance) | উদাহরণ |
| :--- | :--- | :--- | :--- | :--- |
| **1000 - 1999** | **সম্পদ (Assets)** | Current Asset, Fixed Asset, Other Assets | **Debit (Dr.)** | 1010 ক্যাশ ইন হ্যান্ড, 1020 সিটি ব্যাংক, 1030 দেনাদার বাকি, 1050 পণ্য স্টক |
| **2000 - 2999** | **দায় (Liabilities)** | Current Liability, Long Term Liability | **Credit (Cr.)** | 2010 পাওনাদার মহাজন, 2030 প্রদেয় বেতন, 2050 সরকারি ভ্যাট, 2510 ব্যাংক ঋণ |
| **3000 - 3999** | **মালিকানাস্বত্ব (Equity)**| Capital, Drawings, Retained Earnings | **Credit (Cr.)** | 3010 মালিকের মূলধন, 3020 ব্যক্তিগত উত্তোলন (Dr.), 3030 পুঞ্জীভূত মুনাফা |
| **4000 - 4999** | **রাজস্ব / আয় (Revenue)**| Operating Revenue, Non-Operating Revenue | **Credit (Cr.)** | 4010 বিক্রয় রাজস্ব, 4020 ডেলিভারি চার্জ আয়, 4050 প্রাপ্ত বাট্টা |
| **5000 - 6999** | **ব্যয় ও খরচ (Expenses)** | COGS, Operating & Administrative Expenses | **Debit (Dr.)** | 5010 বিক্রিত পণ্যের ব্যয় (COGS), 6010 দোকান ভাড়া, 6020 বিদ্যুৎ বিল, 6030 স্টাফ বেতন |

---

## ৩. সাধারণ জাবেদা ভাউচার মেকানিজম (General Journal & JV Mechanics)

### প্রতিটি জাবেদা এন্ট্রির ডেটা স্ট্রাকচার:
```typescript
export interface JournalEntry {
  id: string;
  tenantId: string;
  entryNumber: string; // e.g. "JV-2026-001"
  date: string; // YYYY-MM-DD
  description: string;
  referenceType: 'sale' | 'purchase' | 'supplier_payment' | 'due_collection' | 'expense' | 'bank_transfer' | 'manual_jv' | 'payroll' | 'opening_balance';
  referenceId?: string;
  lines: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: 'posted' | 'draft' | 'void';
  createdBy: string;
  createdAt: string;
}
```

### স্ট্যান্ডার্ড অটো-জাবেদা উদাহরণ:

#### ক) কাউন্টার বিক্রয় (Counter Cash & Due Sale):
```text
Dr. 1010 ক্যাশ ইন হ্যান্ড (নগদ আদায়)        ৳ ১,০০০
Dr. 1030 দেনাদার হিসাব (গ্রাহকের বাকি)      ৳   ৫০০
    Cr. 4010 বিক্রয় রাজস্ব (মোট সেলস)               ৳ ১,৫০০
```

#### খ) বাকিতে পণ্য ক্রয় (Credit Purchase from Supplier):
```text
Dr. 1050 পণ্য স্টক ইনভেন্টরি (Merchandise Inventory)  ৳ ৫০,০০০
    Cr. 2010 পাওনাদার মহাজন (Accounts Payable)              ৳ ৫০,০০০
```

#### গ) মহাজনকে ব্যাংক চেকের মাধ্যমে বিল পরিশোধ (Supplier Payment):
```text
Dr. 2010 পাওনাদার মহাজন (দেনা হ্রাস)                 ৳ ৩০,০০০
    Cr. 1020 সিটি ব্যাংক চলতি হিসাব (ব্যাংক ব্যালেন্স হ্রাস)    ৳ ৩০,০০০
```

---

## ৪. আর্থিক বিবরণী ও অডিট সূত্র (Financial Audit Formulas)

### ১. রেওয়ামিল (Trial Balance)
সকল লেজার অ্যাকাউন্টের ব্যালেন্সের গাণিতিক শুদ্ধতা পরীক্ষা করে:
$$\text{Total Debits} = \text{Total Credits}$$

### ২. উদ্বৃত্তপত্র (Balance Sheet)
IFRS / IAS মান অনুযায়ী ব্যবসায়িক অস্তিত্বের আর্থিক অবস্থান প্রমাণ করে:
$$\text{Total Assets} = \text{Total Liabilities} + \text{Total Equity}$$
যেখানে:
$$\text{Total Equity} = \text{Owner's Capital} + \text{Retained Earnings} + (\text{Total Revenue} - \text{Total Expenses}) - \text{Drawings}$$

### ৩. ব্যাংক সমন্বয় বিবরণী (Bank Reconciliation)
সফটওয়্যারের ব্যাংক ব্যালেন্স ও ব্যাংক স্টেটমেন্টের সমতা তৈরি করে:
$$\text{Adjusted Bank Balance} = \text{Ledger Balance} + \text{Outstanding Cheques} - \text{Deposits in Transit} - \text{Bank Fees}$$

---

## ৫. কোডবেস রেফারেন্স
- **UI কম্পোনেন্ট:**
  - `/src/components/accounting/AccountingManager.tsx`
  - `/src/components/accounting/GeneralJournalView.tsx`
  - `/src/components/accounting/ChartOfAccountsView.tsx`
  - `/src/components/accounting/FinancialAuditStatementsView.tsx`
  - `/src/components/accounting/BankReconciliationView.tsx`
- **টাইপস:** `/src/types/index.ts`
- **মক ডেটা:** `/src/data/mockData.ts`
