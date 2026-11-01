import { FixedAsset, DepreciationScheduleItem, JournalEntry, JournalEntryLine } from '../types';

/**
 * Calculates straight line method (SLM) annual depreciation
 * Formula: (Cost - Salvage Value) / Useful Life
 */
export function calculateSLMAnnualDepreciation(cost: number, salvageValue: number, usefulLifeYears: number): number {
  if (usefulLifeYears <= 0) return 0;
  const depreciableAmount = Math.max(0, cost - salvageValue);
  return Math.round((depreciableAmount / usefulLifeYears) * 100) / 100;
}

/**
 * Calculates written down value (WDV) annual depreciation for a given book value and rate percentage
 * Formula: Book Value * (Rate / 100)
 */
export function calculateWDVAnnualDepreciation(currentBookValue: number, ratePercentage: number): number {
  if (currentBookValue <= 0 || ratePercentage <= 0) return 0;
  return Math.round((currentBookValue * (ratePercentage / 100)) * 100) / 100;
}

/**
 * Generates the multi-year depreciation schedule for an asset based on its method
 */
export function generateDepreciationSchedule(asset: FixedAsset): DepreciationScheduleItem[] {
  const schedule: DepreciationScheduleItem[] = [];
  const startYear = new Date(asset.purchaseDate).getFullYear() || 2024;
  const usefulLife = Math.max(1, asset.usefulLifeYears || 5);
  const cost = asset.originalCost;
  const salvage = asset.salvageValue || 0;

  let currentBookValue = cost;
  let accumulated = 0;

  for (let year = 1; year <= usefulLife; year++) {
    const fiscalYear = `${startYear + year - 1}-${startYear + year}`;
    let depAmount = 0;

    if (asset.depreciationMethod === 'SLM') {
      const annualSLM = calculateSLMAnnualDepreciation(cost, salvage, usefulLife);
      // Ensure we do not depreciate below salvage value
      const remainingDepreciable = Math.max(0, currentBookValue - salvage);
      depAmount = Math.min(annualSLM, remainingDepreciable);
    } else if (asset.depreciationMethod === 'WDV') {
      const rate = asset.depreciationRatePercentage || 20;
      const calculatedWDV = calculateWDVAnnualDepreciation(currentBookValue, rate);
      const remainingDepreciable = Math.max(0, currentBookValue - salvage);
      depAmount = Math.min(calculatedWDV, remainingDepreciable);
    } else {
      depAmount = 0;
    }

    depAmount = Math.round(depAmount);
    accumulated += depAmount;
    const closingBookValue = Math.max(salvage, currentBookValue - depAmount);

    schedule.push({
      year,
      fiscalYear,
      openingBookValue: Math.round(currentBookValue),
      depreciationRate: asset.depreciationRatePercentage,
      depreciationAmount: depAmount,
      accumulatedDepreciation: Math.round(accumulated),
      closingBookValue: Math.round(closingBookValue),
      isPosted: accumulated <= asset.accumulatedDepreciation,
      journalVoucherNo: accumulated <= asset.accumulatedDepreciation ? `JV-DEP-${startYear + year}` : undefined,
    });

    currentBookValue = closingBookValue;
    if (currentBookValue <= salvage) break;
  }

  return schedule;
}

/**
 * Creates a double-entry Journal Voucher payload for annual depreciation posting
 */
export function createDepreciationJournalVoucher(
  asset: FixedAsset,
  tenantId: string,
  depreciationAmount: number,
  fiscalYear: string,
  postedBy: string = 'System Auto-Engine'
): JournalEntry {
  const dateStr = new Date().toISOString().split('T')[0];
  const voucherNo = `JV-DEP-${Date.now().toString().slice(-6)}`;

  const lines: JournalEntryLine[] = [
    {
      id: `jvl-dep-${Date.now()}-1`,
      accountId: 'coa-dep-exp',
      accountCode: '6210',
      accountName: 'অবচয় খরচ (Depreciation Expense)',
      description: `বার্ষিক অবচয় - ${asset.assetCode}: ${asset.name} (${fiscalYear})`,
      debit: depreciationAmount,
      credit: 0,
    },
    {
      id: `jvl-dep-${Date.now()}-2`,
      accountId: 'coa-acc-dep',
      accountCode: '1590',
      accountName: 'পুঞ্জীভূত অবচয় (Accumulated Depreciation - Fixed Assets)',
      description: `পুঞ্জীভূত অবচয় ক্রেডিট - ${asset.assetCode} (${fiscalYear})`,
      debit: 0,
      credit: depreciationAmount,
    }
  ];

  return {
    id: `jv-dep-${Date.now()}`,
    tenantId,
    entryNumber: voucherNo,
    date: dateStr,
    description: `বার্ষিক স্থায়ী সম্পদ অবচয় জাবেদা: ${asset.assetCode} - ${asset.name} [অর্থবছর ${fiscalYear}]`,
    referenceType: 'depreciation',
    referenceId: asset.id,
    lines,
    totalDebit: depreciationAmount,
    totalCredit: depreciationAmount,
    status: 'posted',
    createdBy: postedBy,
    createdAt: `${dateStr} 12:00`,
    notes: `অবচয় পদ্ধতি: ${asset.depreciationMethod} (${asset.depreciationRatePercentage}%)। প্রারম্ভিক ক্রয়মূল্য: ৳${asset.originalCost.toLocaleString()}`,
  };
}

/**
 * Creates a double-entry Journal Voucher for Asset Disposal
 */
export function createDisposalJournalVoucher(
  asset: FixedAsset,
  tenantId: string,
  saleProceeds: number,
  disposalDate: string,
  reason: string,
  approvedBy: string
): JournalEntry {
  const voucherNo = `JV-DSP-${Date.now().toString().slice(-6)}`;
  const originalCost = asset.originalCost;
  const accumulatedDep = asset.accumulatedDepreciation;
  const netBookValue = Math.max(0, originalCost - accumulatedDep);
  const gainOrLoss = saleProceeds - netBookValue;

  const lines: JournalEntryLine[] = [];

  // 1. Debit Cash/Bank if sale proceeds > 0
  if (saleProceeds > 0) {
    lines.push({
      id: `jvl-dsp-${Date.now()}-cash`,
      accountId: 'coa-cash',
      accountCode: '1010',
      accountName: 'ক্যাশ ইন হ্যান্ড / বিক্রয় মূল্যপ্রাপ্তি (Cash / Proceeds Received)',
      description: `সম্পদ বিক্রয়মূল্য বাবদ ক্যাশ প্রাপ্তি - ${asset.assetCode}`,
      debit: saleProceeds,
      credit: 0,
    });
  }

  // 2. Debit Accumulated Depreciation to clear contra-asset
  lines.push({
    id: `jvl-dsp-${Date.now()}-acc-dep`,
    accountId: 'coa-acc-dep',
    accountCode: '1590',
    accountName: 'পুঞ্জীভূত অবচয় সমন্বয় (Accumulated Depreciation Reversal)',
    description: `পুঞ্জীভূত অবচয় বাতিল - ${asset.assetCode}`,
    debit: accumulatedDep,
    credit: 0,
  });

  // 3. Record Gain or Loss
  if (gainOrLoss < 0) {
    const lossAmount = Math.abs(gainOrLoss);
    lines.push({
      id: `jvl-dsp-${Date.now()}-loss`,
      accountId: 'coa-loss-disp',
      accountCode: '6910',
      accountName: 'স্থায়ী সম্পদ বিক্রয়জনিত লোকসান (Loss on Sale of Fixed Asset)',
      description: `সম্পদ নিষ্পত্তি বা স্ক্র্যাপে লোকসান - ${asset.assetCode}`,
      debit: lossAmount,
      credit: 0,
    });
  } else if (gainOrLoss > 0) {
    lines.push({
      id: `jvl-dsp-${Date.now()}-gain`,
      accountId: 'coa-gain-disp',
      accountCode: '4910',
      accountName: 'স্থায়ী সম্পদ বিক্রয়জনিত লাভ (Gain on Sale of Fixed Asset)',
      description: `সম্পদ বিক্রয়ে অতিরিক্ত লাভ - ${asset.assetCode}`,
      debit: 0,
      credit: gainOrLoss,
    });
  }

  // 4. Credit Asset Account to remove from balance sheet
  lines.push({
    id: `jvl-dsp-${Date.now()}-asset-cost`,
    accountId: 'coa-fixed-asset',
    accountCode: '1510',
    accountName: 'স্থায়ী সম্পদ হিসাব (Fixed Assets Account Cost Reversal)',
    description: `সম্পদ হিসেব থেকে অপসারণ - ${asset.assetCode}: ${asset.name}`,
    debit: 0,
    credit: originalCost,
  });

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);

  return {
    id: `jv-dsp-${Date.now()}`,
    tenantId,
    entryNumber: voucherNo,
    date: disposalDate,
    description: `স্থায়ী সম্পদ নিষ্পত্তি/বিক্রয় জাবেদা: ${asset.assetCode} - ${asset.name} (${reason})`,
    referenceType: 'asset_disposal',
    referenceId: asset.id,
    lines,
    totalDebit,
    totalCredit,
    status: 'posted',
    createdBy: approvedBy,
    createdAt: `${disposalDate} 15:00`,
    notes: `মূল ক্রয়মূল্য: ৳${originalCost.toLocaleString()}, পুঞ্জীভূত অবচয়: ৳${accumulatedDep.toLocaleString()}, নিষ্পত্তি বুক ভ্যালু: ৳${netBookValue.toLocaleString()}, প্রাপ্তি: ৳${saleProceeds.toLocaleString()}, লাভ/(ক্ষতি): ৳${gainOrLoss.toLocaleString()}`,
  };
}
