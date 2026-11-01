import React, { useState } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, Users, Building, Package } from 'lucide-react';
import { Product, Tenant, Customer, Supplier } from '../types';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  warehouseId: string;
  importType?: 'products' | 'customers' | 'suppliers';
  onImportProducts: (newProducts: Omit<Product, 'id'>[]) => void;
  onImportCustomers?: (newCustomers: Omit<Customer, 'id' | 'createdAt'>[]) => void;
  onImportSuppliers?: (newSuppliers: Omit<Supplier, 'id' | 'createdAt'>[]) => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  tenant,
  warehouseId,
  importType = 'products',
  onImportProducts,
  onImportCustomers,
  onImportSuppliers,
}) => {
  const [csvText, setCsvText] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleProductsCsv = `Name,SKU,Category,CostPrice,SellingPrice,Stock,Unit,ExpiryDate,GenericName,BatchNumber
Ace Plus 500mg,MED-ACE-PL,Pain Relief,2.20,3.00,300,tablet,2027-05-15,Paracetamol+Caffeine,SQ-ACE-88
Chinigura Aromatic Rice 1kg,GRO-RICE-CHINI,Rice & Grains,130.00,150.00,80,pack,,,
Fast Charging Type-C Cable,ELEC-CABLE-TC,Accessories,150.00,280.00,50,pcs,,,`;

  const sampleCustomersCsv = `Name,Phone,Address,Email,CreditLimit,OpeningDue
রহমান মেডিকেল স্টোর,01711000111,ধানমন্ডি ঢাকা,rahman@med.com,50000,12000
ফারুক ট্রেডার্স,01812999222,চকবাজার চট্টগ্রাম,faruk@trade.com,100000,0
গ্রিন ফার্মেসি,01913888333,শাহবাগ ঢাকা,green@pharma.com,30000,4500`;

  const sampleSuppliersCsv = `Name,Company,Phone,Email,Address,OpeningDue
স্কয়ার ফার্মাসিউটিক্যালস,Square Pharma Ltd,01711223344,supply@square.com,উত্তরা ঢাকা,45000
বেক্সিমকো ডিস্ট্রিবিউটর,Beximco Distributors,01811334455,order@beximco.com,তেজগাঁও ঢাকা,15000
এসিআই কনজিউমার কেয়ার,ACI Consumer Care,01911445566,care@aci.com,মতিঝিল ঢাকা,0`;

  const currentSampleCsv = importType === 'customers' ? sampleCustomersCsv : importType === 'suppliers' ? sampleSuppliersCsv : sampleProductsCsv;

  const handleDownloadTemplate = () => {
    const filename = importType === 'customers' 
      ? 'JH_IMSE_Customers_Import_Template.csv' 
      : importType === 'suppliers' 
      ? 'JH_IMSE_Suppliers_Import_Template.csv' 
      : 'JH_IMSE_Products_Import_Template.csv';
    const blob = new Blob([currentSampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseCsv = (text: string) => {
    setCsvText(text);
    setParseError(null);
    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    try {
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        setParseError('কমপক্ষে ১টি হেডার লাইন এবং ১টি ডেটার রো থাকতে হবে।');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx] || '';
        });

        if (importType === 'customers') {
          if (row.name) {
            rows.push({
              name: row.name,
              phone: row.phone || '01700000000',
              address: row.address || 'ঢাকা, বাংলাদেশ',
              email: row.email || '',
              creditLimit: parseFloat(row.creditlimit) || 25000,
              dueAmount: parseFloat(row.openingdue) || 0,
            });
          }
        } else if (importType === 'suppliers') {
          if (row.name) {
            rows.push({
              name: row.name,
              companyName: row.company || row.companyname || row.name,
              phone: row.phone || '01700000000',
              email: row.email || '',
              address: row.address || 'ঢাকা, বাংলাদেশ',
              dueBalance: parseFloat(row.openingdue) || 0,
            });
          }
        } else {
          if (row.name) {
            rows.push({
              name: row.name,
              sku: row.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
              category: row.category || 'General',
              costPrice: parseFloat(row.costprice) || 0,
              sellingPrice: parseFloat(row.sellingprice) || 0,
              stock: parseInt(row.stock) || 10,
              unit: row.unit || 'pcs',
              expiryDate: row.expirydate || undefined,
              genericName: row.genericname || undefined,
              batchNumber: row.batchnumber || undefined,
            });
          }
        }
      }

      setParsedRows(rows);
    } catch {
      setParseError('CSV ফরম্যাট পার্স করতে সমস্যা হয়েছে। দয়া করে কমা (,) দ্বারা বিভক্ত ফাইল দিন।');
    }
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    if (importType === 'customers') {
      const formattedCustomers: Omit<Customer, 'id' | 'createdAt'>[] = parsedRows.map(r => ({
        tenantId: tenant.id,
        name: r.name,
        phone: r.phone,
        address: r.address,
        email: r.email,
        totalSpent: 0,
        dueAmount: r.dueAmount,
        creditLimit: r.creditLimit,
        loyaltyPoints: 0,
        loyaltyTier: 'bronze',
        purchaseCount: 0,
        lastPurchased: new Date().toISOString().slice(0, 10),
        hasLoginAccount: false,
        portalStatus: 'invited',
      }));
      onImportCustomers?.(formattedCustomers);
    } else if (importType === 'suppliers') {
      const formattedSuppliers: Omit<Supplier, 'id' | 'createdAt'>[] = parsedRows.map(r => ({
        tenantId: tenant.id,
        name: r.name,
        companyName: r.companyName,
        phone: r.phone,
        email: r.email,
        address: r.address,
        category: 'General Supply',
        totalPurchases: 0,
        totalPaid: 0,
        dueBalance: r.dueBalance,
        status: 'active',
      }));
      onImportSuppliers?.(formattedSuppliers);
    } else {
      const formatted: Omit<Product, 'id'>[] = parsedRows.map(r => ({
        tenantId: tenant.id,
        name: r.name,
        sku: r.sku,
        category: r.category,
        costPrice: r.costPrice,
        sellingPrice: r.sellingPrice,
        wholesalePrice: r.sellingPrice * 0.9,
        stock: r.stock,
        alertStock: 5,
        unit: r.unit,
        showInOnlineStore: true,
        warehouseId: warehouseId || 'wh-1',
        expiryDate: r.expiryDate,
        batchNumber: r.batchNumber,
        genericName: r.genericName,
      }));
      onImportProducts(formatted);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] shadow-2xl border border-purple-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-800 text-purple-200">
              {importType === 'customers' ? <Users className="w-5 h-5" /> : importType === 'suppliers' ? <Building className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base">
                {importType === 'customers' ? 'Excel / CSV বাল্ক কাস্টমার ইমপোর্ট' : importType === 'suppliers' ? 'Excel / CSV বাল্ক মহাজন (সাপ্লায়ার) ইমপোর্ট' : 'Excel / CSV বাল্ক পণ্য ইমপোর্ট'}
              </h3>
              <p className="text-xs text-purple-200">
                {importType === 'customers' ? 'এক ক্লিকে শত শত কাস্টমার ও বাকি খাতা যুক্ত করুন' : importType === 'suppliers' ? 'এক ক্লিকে সকল মহাজন ও আগের দেনা ব্যালেন্স যুক্ত করুন' : 'এক ক্লিকে শত শত পণ্য ইনভেন্টরিতে যুক্ত করুন'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> স্যাম্পল CSV ডাউনলোড
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-slate-800">
                CSV ডেটা পেস্ট করুন অথবা ফাইল থেকে কপি করুন:
              </label>
              <button
                type="button"
                onClick={() => handleParseCsv(currentSampleCsv)}
                className="text-purple-700 font-bold hover:underline"
              >
                ডেমো ডেটা লোড করুন
              </button>
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={e => handleParseCsv(e.target.value)}
              placeholder={importType === 'customers' 
                ? 'Name,Phone,Address,Email,CreditLimit,OpeningDue\nরহমান মেডিকেল স্টোর,01711000111,ধানমন্ডি ঢাকা,rahman@med.com,50000,12000'
                : importType === 'suppliers'
                ? 'Name,Company,Phone,Email,Address,OpeningDue\nস্কয়ার ফার্মাসিউটিক্যালস,Square Pharma Ltd,01711223344,supply@square.com,উত্তরা ঢাকা,45000'
                : 'Name,SKU,Category,CostPrice,SellingPrice,Stock,Unit,ExpiryDate,GenericName,BatchNumber\nNapa 500mg,MED-01,Medicine,2.0,3.0,100,tablet,2027-10-10,Paracetamol,SQ-1'
              }
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {parseError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  সফলভাবে শনাক্ত হয়েছে: {parsedRows.length}টি এন্ট্রি
                </span>
                <span className="text-[11px] text-slate-500">
                  {importType === 'customers' ? 'কাস্টমার ডাটাবেজ' : importType === 'suppliers' ? 'মহাজন খতিয়ান' : `ইনভেন্টরি ওয়্যারহাউস: ${warehouseId || 'Main Store'}`}
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    {importType === 'customers' ? (
                      <tr>
                        <th className="py-2 px-3">নাম</th>
                        <th className="py-2 px-3">ফোন</th>
                        <th className="py-2 px-3">ঠিকানা</th>
                        <th className="py-2 px-3">ক্রেডিট লিমিট</th>
                        <th className="py-2 px-3">আগের বাকি</th>
                      </tr>
                    ) : importType === 'suppliers' ? (
                      <tr>
                        <th className="py-2 px-3">মহাজন নাম</th>
                        <th className="py-2 px-3">কোম্পানি</th>
                        <th className="py-2 px-3">ফোন</th>
                        <th className="py-2 px-3">ঠিকানা</th>
                        <th className="py-2 px-3">আগের দেনা</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="py-2 px-3">নাম</th>
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">ক্যাটাগরি</th>
                        <th className="py-2 px-3">কেনা দর</th>
                        <th className="py-2 px-3">বেচা দর</th>
                        <th className="py-2 px-3">স্টক</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {importType === 'customers' ? (
                          <>
                            <td className="py-1.5 px-3 font-medium text-slate-900">{r.name}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{r.phone}</td>
                            <td className="py-1.5 px-3 text-slate-600">{r.address}</td>
                            <td className="py-1.5 px-3 font-mono">{tenant.currency}{r.creditLimit}</td>
                            <td className="py-1.5 px-3 font-bold text-rose-600 font-mono">{tenant.currency}{r.dueAmount}</td>
                          </>
                        ) : importType === 'suppliers' ? (
                          <>
                            <td className="py-1.5 px-3 font-medium text-slate-900">{r.name}</td>
                            <td className="py-1.5 px-3 text-slate-600">{r.companyName}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-600">{r.phone}</td>
                            <td className="py-1.5 px-3 text-slate-600">{r.address}</td>
                            <td className="py-1.5 px-3 font-bold text-blue-700 font-mono">{tenant.currency}{r.dueBalance}</td>
                          </>
                        ) : (
                          <>
                            <td className="py-1.5 px-3 font-medium text-slate-900">{r.name}</td>
                            <td className="py-1.5 px-3 font-mono text-slate-500">{r.sku}</td>
                            <td className="py-1.5 px-3 text-slate-600">{r.category}</td>
                            <td className="py-1.5 px-3">{tenant.currency}{r.costPrice}</td>
                            <td className="py-1.5 px-3 font-bold text-purple-700">{tenant.currency}{r.sellingPrice}</td>
                            <td className="py-1.5 px-3 font-semibold text-emerald-700">{r.stock} {r.unit}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl transition"
          >
            বাতিল
          </button>
          <button
            onClick={handleExecuteImport}
            disabled={parsedRows.length === 0}
            className="px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <UploadCloud className="w-4 h-4" /> {parsedRows.length}টি {importType === 'customers' ? 'কাস্টমার' : importType === 'suppliers' ? 'মহাজন' : 'পণ্য'} সফলভাবে ইমপোর্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
};
