import { Customer, LoyaltyTier, LoyaltyTierConfig, Product, Sale } from '../types';

export const LOYALTY_TIERS: Record<'bronze' | 'silver' | 'gold' | 'platinum', LoyaltyTierConfig> = {
  bronze: {
    tier: 'bronze',
    nameBn: 'ব্রোঞ্জ সদস্য (Bronze)',
    minSpendBDT: 0,
    maxSpendBDT: 10000,
    pointsPerHundredBDT: 1.0, // 1 point per 100 BDT
    discountPct: 0,
    perks: [
      'প্রতি ১০০ টাকার ক্রয়ে ১ পয়েন্ট অর্জন',
      'ডিজিটাল হোয়াটসঅ্যাপ ক্যাশ মেমো',
      'স্টোর ডিসকাউন্ট অফার আপডেট',
    ],
    badgeColor: 'border-amber-700/40 bg-amber-50 text-amber-800',
    badgeTextColor: 'text-amber-800',
    bgGradient: 'from-amber-600 via-amber-700 to-amber-900',
    iconName: '🥉',
  },
  silver: {
    tier: 'silver',
    nameBn: 'সিলভার সদস্য (Silver)',
    minSpendBDT: 10001,
    maxSpendBDT: 25000,
    pointsPerHundredBDT: 1.5, // 1.5 points per 100 BDT
    discountPct: 2, // 2% instant tier discount
    perks: [
      'প্রতি ১০০ টাকার ক্রয়ে ১.৫ পয়েন্ট অর্জন',
      'সর্বমোট বিলে ২% অতিরিক্ত ক্যাশ ডিসকাউন্ট',
      'জন্মদিনে বিশেষ সারপ্রাইজ ভাউচার',
      'অগ্রাধিকার কাস্টমার সাপোর্ট',
    ],
    badgeColor: 'border-slate-400 bg-slate-100 text-slate-800',
    badgeTextColor: 'text-slate-800',
    bgGradient: 'from-slate-400 via-slate-600 to-slate-800',
    iconName: '🥈',
  },
  gold: {
    tier: 'gold',
    nameBn: 'গোল্ড সদস্য (Gold)',
    minSpendBDT: 25001,
    maxSpendBDT: 50000,
    pointsPerHundredBDT: 2.0, // 2.0 points per 100 BDT
    discountPct: 3, // 3% instant tier discount
    perks: [
      'প্রতি ১০০ টাকার ক্রয়ে ২.০ পয়েন্ট অর্জন',
      'সর্বমোট বিলে ৩% সার্বক্ষণিক ক্যাশ ছাড়',
      'ফ্রি হোম ডেলিভারি (সকল অর্ডারে)',
      'প্রায়োরিটি কাউন্টার সার্ভিস (কোনো লাইন ছাড়া)',
    ],
    badgeColor: 'border-amber-500 bg-amber-100 text-amber-900',
    badgeTextColor: 'text-amber-900',
    bgGradient: 'from-yellow-500 via-amber-600 to-amber-800',
    iconName: '🥇',
  },
  platinum: {
    tier: 'platinum',
    nameBn: 'প্ল্যাটিনাম ভিআইপি (Platinum VIP)',
    minSpendBDT: 50001,
    maxSpendBDT: 9999999,
    pointsPerHundredBDT: 3.0, // 3.0 points per 100 BDT
    discountPct: 5, // 5% instant tier discount
    perks: [
      'প্রতি ১০০ টাকার ক্রয়ে ৩.০ পয়েন্ট অর্জন',
      'সর্বমোট বিলে ৫% ফ্ল্যাট আজীবন ছাড়',
      'ডেডিকেটেড ভিআইপি রিলেশনশিপ ম্যানেজার',
      'ফ্রি এক্সপ্রেস হোম ডেলিভারি ও প্রায়োরিটি রিটার্ন',
    ],
    badgeColor: 'border-purple-500 bg-purple-100 text-purple-900',
    badgeTextColor: 'text-purple-900',
    bgGradient: 'from-indigo-700 via-purple-700 to-pink-700',
    iconName: '💎',
  },
};

/**
 * Determine customer loyalty tier based on total spending
 */
export function calculateCustomerTier(totalSpent: number): 'bronze' | 'silver' | 'gold' | 'platinum' {
  if (totalSpent > 50000) return 'platinum';
  if (totalSpent > 25000) return 'gold';
  if (totalSpent > 10000) return 'silver';
  return 'bronze';
}

/**
 * Calculate loyalty points earned for an invoice amount based on tier
 */
export function calculateEarnedPoints(amount: number, tier: LoyaltyTier = 'bronze'): number {
  const normalizedTier = tier === 'vip' ? 'platinum' : tier;
  const config = LOYALTY_TIERS[normalizedTier as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.bronze;
  const points = Math.floor((amount / 100) * config.pointsPerHundredBDT);
  return Math.max(0, points);
}

/**
 * Point conversion rate: 1 Point = 1 BDT
 */
export const POINTS_TO_BDT_RATE = 1.0;

/**
 * Get tier progression info (next tier target & progress percentage)
 */
export function getTierProgress(totalSpent: number): {
  currentTier: LoyaltyTierConfig;
  nextTier?: LoyaltyTierConfig;
  amountNeeded: number;
  progressPercent: number;
} {
  const currentKey = calculateCustomerTier(totalSpent);
  const currentTier = LOYALTY_TIERS[currentKey];

  if (currentKey === 'platinum') {
    return {
      currentTier,
      amountNeeded: 0,
      progressPercent: 100,
    };
  }

  const nextKey: 'silver' | 'gold' | 'platinum' = 
    currentKey === 'bronze' ? 'silver' : currentKey === 'silver' ? 'gold' : 'platinum';
  const nextTier = LOYALTY_TIERS[nextKey];
  const targetSpend = nextTier.minSpendBDT;
  const needed = Math.max(0, targetSpend - totalSpent);

  const prevMin = currentTier.minSpendBDT;
  const span = targetSpend - prevMin;
  const spentInTier = Math.max(0, totalSpent - prevMin);
  const progressPercent = Math.min(100, Math.round((spentInTier / span) * 100));

  return {
    currentTier,
    nextTier,
    amountNeeded: needed,
    progressPercent,
  };
}

/**
 * Generate formatted WhatsApp message text for POS Invoice
 */
export function generateWhatsAppInvoiceTemplate(
  sale: Sale,
  tenantName: string,
  customerName: string,
  earnedPoints: number,
  tier: LoyaltyTier = 'bronze',
  currentTotalPoints: number = 0
): string {
  const normalizedTier = tier === 'vip' ? 'platinum' : tier;
  const tierConfig = LOYALTY_TIERS[normalizedTier as keyof typeof LOYALTY_TIERS] || LOYALTY_TIERS.bronze;

  const itemsList = sale.items
    .map(i => `• ${i.productName} × ${i.quantity} = ৳${i.subtotal}`)
    .join('\n');

  return `🌟 *${tenantName}* - অফিসিয়াল ক্যাশ মেমো
━━━━━━━━━━━━━━━━━━━━
সম্মানিত *${customerName}* সাহেব,
আমাদের শপে কেনাকাটা করার জন্য আন্তরিক ধন্যবাদ!

🧾 *ইনভয়েস নম্বর:* #${sale.invoiceNumber}
📅 *তারিখ:* ${sale.createdAt}
💳 *পেমেন্ট মাধ্যম:* ${sale.paymentMethod.toUpperCase()}

🛍️ *কেনাকাটার বিবরণ:*
${itemsList}

────────────────────
💵 *উপমোট:* ৳${sale.subtotal.toLocaleString()}
🏷️ *ডিসকাউন্ট:* ৳${sale.discount.toLocaleString()}
${sale.tax > 0 ? `🏛️ *ভ্যাট/ট্যাক্স:* ৳${sale.tax.toLocaleString()}\n` : ''}💰 *সর্বমোট বিল:* *৳${sale.totalAmount.toLocaleString()}*
✅ *পরিশোধ:* ৳${sale.paidAmount.toLocaleString()}
${sale.dueAmount > 0 ? `⚠️ *বকেয়া:* *৳${sale.dueAmount.toLocaleString()}*\n` : ''}
━━━━━━━━━━━━━━━━━━━━
🎖️ *লয়্যালটি রিওয়ার্ড স্ট্যাটাস:*
• সদস্য টিয়ার: *${tierConfig.iconName} ${tierConfig.nameBn}*
• এই কেনাকাটায় অর্জিত: *+${earnedPoints} পয়েন্ট*
• মোট ব্যালেন্স: *${currentTotalPoints + earnedPoints} পয়েন্ট (৳${currentTotalPoints + earnedPoints} সমমূল্য)*

📥 *ডিজিটাল পিডিএফ ইনভয়েস ডাউনলোড করুন:*
👉 https://jh-imse.shop/invoice/${sale.invoiceNumber}

যেকোনো সহায়তায় আমাদের সাথে যোগাযোগ করুন। আবার আসার আমন্ত্রণ রইল! ❤️`;
}

/**
 * Generate formatted WhatsApp message for friendly due recovery
 */
export function generateWhatsAppDueReminderTemplate(
  customer: Customer,
  tenantName: string,
  tenantPhone: string
): string {
  const payUrl = `https://jh-imse.shop/pay/INV-${customer.id.replace('cust-', '')}-${Date.now().toString().slice(-4)}`;

  return `🔔 *বকেয়া পরিশোধের সৌজন্যমূলক স্মারক*
━━━━━━━━━━━━━━━━━━━━
দোকান: *${tenantName}*
হেল্পলাইন: ${tenantPhone}

সম্মানিত *${customer.name}* সাহেব,
আসসালামু আলাইকুম। আশা করি ভালো আছেন।

আপনার অবগতির জন্য জানানো যাচ্ছে যে, *${tenantName}*-এ আপনার পূর্বের বকেয়া হিসাব জের রয়েছে:

💰 *বর্তমান বকেয়া জের:* *৳${customer.dueAmount.toLocaleString()}*
🛒 *সর্বমোট কেনাকাটা:* ৳${customer.totalSpent.toLocaleString()}
🎖️ *সদস্যপদ স্তর:* ${customer.loyaltyTier ? customer.loyaltyTier.toUpperCase() : 'BRONZE'}

আপনার সুবিধাজনক সময়ে কাউন্টারে এসে অথবা ঘরে বসে ১-ক্লিকে বিকাশে পরিশোধ করতে নিচের লিংকে ক্লিক করুন:

👉 *বিকাশ/নগদ ১-ক্লিক পে-লিংক:*
${payUrl}

আপনার সার্বিক সহযোগিতা আমাদের অগ্রযাত্রার শক্তি। ধন্যবাদ! 🙏`;
}

/**
 * Automated WhatsApp Two-Way Bot reply engine
 */
export function processWhatsAppBotMessage(
  userQuery: string,
  customer: Customer | null,
  tenantName: string,
  topProducts: Product[]
): {
  replyText: string;
  quickReplies?: string[];
  actionLink?: { title: string; url: string };
} {
  const query = userQuery.trim().toLowerCase();

  // 1. Menu / Start / Help
  if (query.includes('মেনু') || query.includes('menu') || query.includes('help') || query.includes('হ্যালো') || query.includes('hi') || query.includes('hello')) {
    const custName = customer?.name || 'গ্রাহক';
    const points = customer?.loyaltyPoints || 120;
    const tier = customer?.loyaltyTier || 'bronze';
    const tierConfig = LOYALTY_TIERS[tier === 'vip' ? 'platinum' : tier] || LOYALTY_TIERS.bronze;

    return {
      replyText: `👋 আসসালামু আলাইকুম *${custName}*!
*${tenantName}* স্মার্ট অ্যাসিস্ট্যান্টে আপনাকে স্বাগতম।

আপনার মেম্বারশিপ: *${tierConfig.iconName} ${tierConfig.nameBn}*
লয়্যালটি পয়েন্ট ব্যালেন্স: *${points} পয়েন্ট*

কীভাবে সাহায্য করতে পারি? নিচের মেনু থেকে নির্বাচন করুন:`,
      quickReplies: ['১. পয়েন্ট ও সুবিধা', '২. বকেয়া হিসাব', '৩. সাম্প্রতিক রসিদ', '৪. সেরা পণ্য ক্যাটালগ', '৫. এজেন্টের সাথে কথা'],
    };
  }

  // 2. Loyalty points inquiry
  if (query.includes('পয়েন্ট') || query.includes('পয়েন্ট') || query.includes('point') || query.includes('১')) {
    const points = customer?.loyaltyPoints || 150;
    const tier = customer?.loyaltyTier || 'gold';
    const tierConfig = LOYALTY_TIERS[tier === 'vip' ? 'platinum' : tier] || LOYALTY_TIERS.gold;
    const progress = getTierProgress(customer?.totalSpent || 26000);

    return {
      replyText: `🎖️ *আপনার লয়্যালটি ও রিওয়ার্ড তথ্য*
━━━━━━━━━━━━━━━━━━━━
সদস্য নাম: *${customer?.name || 'সম্মানিত সদস্য'}*
বর্তমান স্তর: *${tierConfig.iconName} ${tierConfig.nameBn}*
মোট পয়েন্ট: *${points} পয়েন্ট*
নগদ সমমূল্য: *৳${points * POINTS_TO_BDT_RATE}*

🌟 *আপনার স্তরের বিশেষ সুবিধা:*
${tierConfig.perks.map(p => `• ${p}`).join('\n')}

${progress.nextTier ? `📈 পরবর্তী স্তর *${progress.nextTier.nameBn}*-এ উন্নীত হতে আর মাত্র *৳${progress.amountNeeded.toLocaleString()}* কেনাকাটা করুন!` : '🏆 অভিনন্দন! আপনি সর্বোচ্চ প্ল্যাটিনাম ভিআইপি স্তরে আছেন!'}

💡 *টিপস:* কাউন্টারে যেকোনো ক্রয়ে আপনি ১ পয়েন্ট = ৳১ হিসেবে রিডিম করতে পারবেন।`,
      quickReplies: ['মেনু দেখুন', 'বকেয়া হিসাব', 'ক্যাটালগ দেখুন'],
    };
  }

  // 3. Due balance inquiry
  if (query.includes('বকেয়া') || query.includes('বকেয়া') || query.includes('due') || query.includes('বাকী') || query.includes('২')) {
    const due = customer?.dueAmount || 0;
    if (due <= 0) {
      return {
        replyText: `🎉 *আলহামদুলিল্লাহ! আপনার কোনো বকেয়া নেই।*
*${tenantName}*-এর সাথে আপনার হিসাব সম্পূর্ণ পরিষ্কার। আমাদের নিয়মিত গ্রাহক হওয়ার জন্য ধন্যবাদ!`,
        quickReplies: ['মেনু দেখুন', 'পয়েন্ট চেক', 'ক্যাটালগ দেখুন'],
      };
    }

    const payUrl = `https://jh-imse.shop/pay/INV-${customer?.id?.replace('cust-', '') || '9921'}-${Date.now().toString().slice(-4)}`;
    return {
      replyText: `📋 *আপনার বকেয়া হিসাব বিবরণী*
━━━━━━━━━━━━━━━━━━━━
গ্রাহক: *${customer?.name || 'সম্মানিত গ্রাহক'}*
দোকান: *${tenantName}*

💰 *বর্তমান বকেয়ার পরিমাণ:* *৳${due.toLocaleString()}*

নিচের লিংকে ক্লিক করে বিকাশ, নগদ বা যেকোনো ডেবিট কার্ডের মাধ্যমে ১-ক্লিকে বকেয়া পরিশোধ করতে পারবেন:`,
      actionLink: {
        title: '📲 ১-ক্লিকে বিকাশ/নগদে পরিশোধ করুন',
        url: payUrl,
      },
      quickReplies: ['মেনু দেখুন', 'পয়েন্ট চেক করুন'],
    };
  }

  // 4. Receipt download
  if (query.includes('রসিদ') || query.includes('মেমো') || query.includes('receipt') || query.includes('invoice') || query.includes('৩')) {
    const lastTrx = customer?.transactions?.[0];
    const invoiceNo = lastTrx?.referenceNo || 'INV-2026-1025';
    return {
      replyText: `🧾 *আপনার সাম্প্রতিক ক্যাশ মেমো:*
ইনভয়েস নম্বর: #${invoiceNo}
তারিখ: ${lastTrx?.date || '2026-10-24'}

নিচের বোতামে ক্লিক করে আসল ডিজিটাল ক্যাশ মেমো PDF ডাউনলোড বা প্রিন্ট করুন:`,
      actionLink: {
        title: '📥 ইনভয়েস PDF ডাউনলোড করুন',
        url: `https://jh-imse.shop/invoice/${invoiceNo}`,
      },
      quickReplies: ['মেনু দেখুন', 'পয়েন্ট ব্যালেন্স'],
    };
  }

  // 5. Catalog inquiry
  if (query.includes('ক্যাটালগ') || query.includes('পণ্য') || query.includes('দাম') || query.includes('catalog') || query.includes('৪')) {
    const list = topProducts.slice(0, 4).map((p, idx) => 
      `${idx + 1}. *${p.name}* (${p.category})\n   💰 মূল্য: ৳${p.sellingPrice} | স্টক: ${p.stock > 0 ? '✅ ইন-স্টক' : '❌ শেষ'}`
    ).join('\n\n');

    return {
      replyText: `🛍️ *${tenantName} জনপ্রিয় পণ্য ক্যাটালগ*
━━━━━━━━━━━━━━━━━━━━
${list}

📱 সরাসরি অর্ডার করতে পণ্যের নাম লিখে মেসেজ পাঠান অথবা আমাদের অনলাইন স্টোর ভিজিট করুন:`,
      actionLink: {
        title: '🌐 সম্পূর্ণ অনলাইন শপ ভিজিট করুন',
        url: 'https://jh-imse.shop/store',
      },
      quickReplies: ['১ নম্বর অর্ডার করি', 'মেনু দেখুন', 'এজেন্ট কল'],
    };
  }

  // 6. Agent connect
  if (query.includes('এজেন্ট') || query.includes('agent') || query.includes('কথা') || query.includes('৫')) {
    return {
      replyText: `👨‍💼 আপনার অনুরোধটি গ্রহণ করা হয়েছে!
*${tenantName}*-এর কাস্টমার সাপোর্ট প্রতিনিধি শীঘ্রই আপনার এই হোয়াটসঅ্যাপ নম্বরে যোগাযোগ করবেন।

জরুরি প্রয়োজনে সরাসরি কল করুন: +880 1700-112233`,
      quickReplies: ['মেনু দেখুন'],
    };
  }

  // Default fallback
  return {
    replyText: `ধন্যবাদ আপনার মেসেজের জন্য! আমি *${tenantName}* স্বয়ংক্রিয় অ্যাসিস্ট্যান্ট।
আপনার বার্তাটি বুঝতে পারিনি। অনুগ্রহ করে নিচের অপশন থেকে বেছে নিন অথবা *মেনু* লিখে পাঠান।`,
    quickReplies: ['মেনু দেখুন', 'পয়েন্ট চেক', 'বকেয়া হিসাব', 'ক্যাটালগ'],
  };
}
