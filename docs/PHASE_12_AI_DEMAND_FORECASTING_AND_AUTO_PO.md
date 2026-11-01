# Phase 12: AI Autonomous Demand Forecasting & Smart Auto-PO
**কৃত্রিম বুদ্ধিমত্তা চালিত ইনভেন্টরি ফোরকাস্টিং, সেফটি স্টক ও স্বয়ংক্রিয় পারচেজ অর্ডার**

---

## ১. সারসংক্ষেপ ও দূরদৃষ্টি (AI Architecture Overview)
একটি সুপারমার্কেট বা ফার্মেসিতে হাজার হাজার SKU থাকে। ক্যাশিয়ার বা স্টোর ম্যানেজারের পক্ষে প্রতিটি পণ্যের দৈনিক বিক্রির গতিপথ (Sales Velocity), সরবরাহকারীর লিড-টাইম (Supplier Lead Time) এবং মেয়াদোত্তীর্ণের তারিখ ম্যানুয়ালি ট্র্যাক করা অসম্ভব।

Phase 12-এ **Google Gemini API** এবং স্ট্যাটিস্টিক্যাল টাইম-সিরিজ মডেলের সমন্বয়ে সম্পূর্ণ স্বয়ংক্রিয় প্রগনোসিস সিস্টেম যুক্ত হবে।

---

## ২. গাণিতিক মডেল ও অ্যালগরিদম (Forecasting Formulas)

### ১. সেলস ভেলোসিটি (Sales Velocity - $V$):
$$V = \frac{\sum_{t=1}^{N} \text{Quantity Sold}_t}{N \text{ days}}$$

### ২. রান-আউট ডেট বা স্টক শেষ হওয়ার আনুমানিক দিন (Days of Inventory Remaining - $DIR$):
$$DIR = \frac{\text{Current Stock Quantity}}{V}$$

### ৩. ডায়নামিক রি-অর্ডার পয়েন্ট (Dynamic Reorder Point - $ROP$):
$$ROP = (\text{Average Daily Usage} \times \text{Lead Time Days}) + \text{Safety Stock}$$
যেখানে সেফটি স্টক ($SS$):
$$SS = Z \times \sigma_L \times \sqrt{\text{Lead Time}}$$
*(সাধারণত ৯৫% সার্ভিস লেভেলের জন্য $Z = 1.65$)*

---

## ৩. Gemini AI জেনারেটেড স্বয়ংক্রিয় পারচেজ অর্ডার (Auto-PO Workflow)

```
[প্রতি মধ্যরাতে ক্রোন জব (Nightly Cron Job)]
                    │
                    ▼
[বিক্রি ট্রেন্ড ও বর্তমান স্টক অ্যানালাইসিস]
                    │
                    ▼
[যেসব প্রোডাক্ট ROP-এর নিচে নেমে গেছে চিহ্নিতকরণ]
                    │
                    ▼
[সাপ্লায়ার অনুযায়ী স্বয়ংক্রিয় গ্রুপিং (Group by Primary Supplier)]
                    │
                    ▼
[ড্রাফট পারচেজ অর্ডার জেনারেশন (PO-2026-AUTO-xxx)]
                    │
                    ▼
[মালিক/ম্যানেজারের ড্যাশবোর্ডে ১-ক্লিক অনুমোদন ও WhatsApp/Email প্রেরণ]
```

---

## ৪. জেমিনি ইন্টিগ্রেশন প্রম্পট টেমপ্লেট (Gemini Model Prompt)

```typescript
const prompt = `
You are an expert Enterprise Supply Chain AI for ${tenant.name}.
Analyze the following inventory and sales logs for the past 30 days:
Products: ${JSON.stringify(lowStockProducts)}
Suppliers: ${JSON.stringify(suppliers)}

Tasks:
1. Identify items with critical stockout risk within 72 hours.
2. Calculate recommended reorder quantities using 14-day economic order quantity (EOQ).
3. Generate a structured JSON response containing recommended purchase orders grouped by supplier ID.
`;
```

---

## ৫. মূল ফলাফল ও সুবিধা (Key Benefits)
1. **জিরো স্টক-আউট:** জনপ্রিয় পণ্য কখনোই ড্রপ বা শেষ হবে না।
2. **জিরো ডেড-স্টক:** অবিক্রিত পণ্যে অযথা মূলধন আটকে থাকবে না।
3. **ক্যাটাগরিভিত্তিক ট্রেন্ড অ্যালার্ট:** ঋতুভিত্তিক যেমন শীতে অ্যান্টিহিস্টামিন/কফ সিরাপ, গরমে স্যালাইন ও ড্রিংকসের পূর্বাভাস।

---

## ৬. বাস্তবায়ন স্ট্যাটাস (Implementation Status: ✅ সম্পন্ন ও লাইভ)

| ফিচার | বাস্তবায়ন ফাইল | স্ট্যাটাস |
| :--- | :--- | :---: |
| **ম্যাথমেটিক্যাল সেলস ভেলোসিটি ($V$) ও $DIR$** | `/src/utils/aiForecastEngine.ts` | ✅ সম্পন্ন |
| **ডায়নামিক রি-অর্ডার পয়েন্ট ($ROP$) ও সেফটি স্টক ($SS$)** | `/src/utils/aiForecastEngine.ts` | ✅ সম্পন্ন |
| **স্টকআউট রাডার ও সেলস ভেলোসিটি গ্রিড** | `/src/components/ai/AIDemandForecastManager.tsx` | ✅ সম্পন্ন |
| **সাপ্লায়ারভিত্তিক অটোনোমাস অটো-পিও হাব** | `/src/components/ai/AutoPOApprovalModal.tsx` | ✅ সম্পন্ন |
| **অফিসিয়াল পারচেজ অর্ডার প্রিন্ট ভাউচার** | `/src/components/ai/PrintAutoPOModal.tsx` | ✅ সম্পন্ন |
| **ডেড-স্টক লিকুইডেশন ও ক্যাপিটাল রিকভারি** | `/src/components/ai/DeadStockPromoModal.tsx` | ✅ সম্পন্ন |
| **মৌসুমি ডিমান্ড ট্রেন্ড (Seasonal Surge)** | `/src/components/ai/AIDemandForecastManager.tsx` | ✅ সম্পন্ন |
| **গুগল জেমিনি এআই সাপ্লাই চেইন অ্যানালিস্ট (`@google/genai`)** | `/src/utils/aiForecastEngine.ts` | ✅ সম্পন্ন |
| **MySQL ডাটাবেস স্কিমা (Phase 12 টেবিল)** | `/hostinger-mysql-schema.sql` | ✅ সম্পন্ন |

