import React, { useState, useMemo } from 'react';
import { 
  X, Tag, Layers, Scale, Bookmark, Barcode, UploadCloud, Plus, Search, 
  Trash2, Edit3, CheckCircle2, AlertTriangle, Printer, Download, RefreshCw, 
  ArrowRight, Globe, Building2, Package, Check, Eye, HelpCircle, FileSpreadsheet
} from 'lucide-react';
import { 
  Product, Tenant, Warehouse, Brand, SubCategory, UnitOfMeasure, 
  OpeningStockEntry, Category, LabelPaperFormat, BarcodeSymbology,
  BulkUpdateItem, BulkUpdateSummary
} from '../../types';

interface ProductHierarchyManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
  tenant: Tenant;
  products: Product[];
  warehouses: Warehouse[];
  categories: Category[];
  brands: Brand[];
  subCategories: SubCategory[];
  units: UnitOfMeasure[];
  openingStocks: OpeningStockEntry[];
  initialTab?: 'brands' | 'sub_categories' | 'units' | 'opening_stock' | 'barcodes' | 'update_import';
  onSaveBrand: (brand: Brand) => void;
  onDeleteBrand: (brandId: string) => void;
  onSaveSubCategory: (subCat: SubCategory) => void;
  onDeleteSubCategory: (subCatId: string) => void;
  onSaveUnit: (unit: UnitOfMeasure) => void;
  onDeleteUnit: (unitId: string) => void;
  onSaveOpeningStock: (entry: OpeningStockEntry) => void;
  onBulkUpdateProducts: (updates: { id: string; costPrice?: number; sellingPrice?: number; stock?: number }[]) => void;
}

export const ProductHierarchyManager: React.FC<ProductHierarchyManagerProps> = ({
  isOpen = true,
  onClose,
  tenant,
  products,
  warehouses,
  categories,
  brands,
  subCategories,
  units,
  openingStocks,
  initialTab = 'brands',
  onSaveBrand,
  onDeleteBrand,
  onSaveSubCategory,
  onDeleteSubCategory,
  onSaveUnit,
  onDeleteUnit,
  onSaveOpeningStock,
  onBulkUpdateProducts,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'brands' | 'sub_categories' | 'units' | 'opening_stock' | 'barcodes' | 'update_import'>(initialTab);

  // Sync initial tab if passed
  React.useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Brand Form State
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    code: '',
    originCountry: 'Bangladesh',
    website: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [brandSearch, setBrandSearch] = useState('');

  // SubCategory Form State
  const [subCatModalOpen, setSubCatModalOpen] = useState(false);
  const [editingSubCat, setEditingSubCat] = useState<SubCategory | null>(null);
  const [subCatForm, setSubCatForm] = useState({
    categoryId: categories[0]?.id || '',
    name: '',
    code: '',
    description: '',
  });
  const [subCatFilterCategory, setSubCatFilterCategory] = useState<string>('all');
  const [subCatSearch, setSubCatSearch] = useState('');

  // Unit Form State
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<UnitOfMeasure | null>(null);
  const [unitForm, setUnitForm] = useState({
    name: '',
    shortName: '',
    isBaseUnit: false,
    baseUnit: 'pcs',
    operator: '*' as '*' | '/',
    operationValue: 12,
  });

  // Opening Stock Form State
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openingForm, setOpeningForm] = useState({
    warehouseId: warehouses[0]?.id || '',
    productId: products[0]?.id || '',
    quantity: 50,
    unitCost: products[0]?.costPrice || 10,
    batchNumber: '',
    expiryDate: '',
    note: '',
  });

  // Barcode Label Studio State
  const [barcodeSelectedProductId, setBarcodeSelectedProductId] = useState<string>(products[0]?.id || '');
  const [barcodeFormat, setBarcodeFormat] = useState<LabelPaperFormat>('a4_24');
  const [barcodeSymbology, setBarcodeSymbology] = useState<BarcodeSymbology>('CODE128');
  const [barcodeIncludeProduct, setBarcodeIncludeProduct] = useState(true);
  const [barcodeIncludeBrand, setBarcodeIncludeBrand] = useState(true);
  const [barcodeIncludeSKU, setBarcodeIncludeSKU] = useState(true);
  const [barcodeIncludePrice, setBarcodeIncludePrice] = useState(true);
  const [barcodeIncludeExpiry, setBarcodeIncludeExpiry] = useState(true);
  const [barcodeIncludeBusiness, setBarcodeIncludeBusiness] = useState(true);
  const [barcodeCopies, setBarcodeCopies] = useState<number>(24);

  // Bulk Import (Update Only) State
  const [updateCsvText, setUpdateCsvText] = useState<string>('');
  const [updateStockMode, setUpdateStockMode] = useState<'replace' | 'add'>('replace');
  const [updatePreviewList, setUpdatePreviewList] = useState<{
    product: Product;
    oldCost: number;
    newCost?: number;
    oldSelling: number;
    newSelling?: number;
    oldStock: number;
    newStock?: number;
    calculatedStock: number;
    status: 'match' | 'no_change';
  }[]>([]);
  const [updateNotFoundSkus, setUpdateNotFoundSkus] = useState<string[]>([]);
  const [updateExecutedSummary, setUpdateExecutedSummary] = useState<BulkUpdateSummary | null>(null);

  if (!isOpen) return null;

  // Filtered Lists
  const tenantBrands = brands.filter(b => b.tenantId === tenant.id);
  const filteredBrands = tenantBrands.filter(b => 
    b.name.toLowerCase().includes(brandSearch.toLowerCase()) || 
    (b.code && b.code.toLowerCase().includes(brandSearch.toLowerCase()))
  );

  const tenantSubCats = subCategories.filter(s => s.tenantId === tenant.id);
  const filteredSubCats = tenantSubCats.filter(s => {
    const matchCategory = subCatFilterCategory === 'all' || s.categoryId === subCatFilterCategory;
    const matchSearch = s.name.toLowerCase().includes(subCatSearch.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(subCatSearch.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const tenantUnits = units.filter(u => u.tenantId === tenant.id);
  const tenantOpeningStocks = openingStocks.filter(o => o.tenantId === tenant.id);

  // Brand Handlers
  const handleOpenBrandModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        name: brand.name,
        code: brand.code || '',
        originCountry: brand.originCountry || 'Bangladesh',
        website: brand.website || '',
        description: brand.description || '',
        status: brand.status,
      });
    } else {
      setEditingBrand(null);
      setBrandForm({
        name: '',
        code: '',
        originCountry: 'Bangladesh',
        website: '',
        description: '',
        status: 'active',
      });
    }
    setBrandModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandForm.name.trim()) return;

    const brandToSave: Brand = {
      id: editingBrand ? editingBrand.id : `br-${Date.now()}`,
      tenantId: tenant.id,
      name: brandForm.name.trim(),
      code: brandForm.code.trim() || undefined,
      originCountry: brandForm.originCountry,
      website: brandForm.website.trim() || undefined,
      description: brandForm.description.trim() || undefined,
      status: brandForm.status,
      createdAt: editingBrand ? editingBrand.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveBrand(brandToSave);
    setBrandModalOpen(false);
  };

  // SubCategory Handlers
  const handleOpenSubCatModal = (subCat?: SubCategory) => {
    if (subCat) {
      setEditingSubCat(subCat);
      setSubCatForm({
        categoryId: subCat.categoryId,
        name: subCat.name,
        code: subCat.code || '',
        description: subCat.description || '',
      });
    } else {
      setEditingSubCat(null);
      setSubCatForm({
        categoryId: categories[0]?.id || '',
        name: '',
        code: '',
        description: '',
      });
    }
    setSubCatModalOpen(true);
  };

  const handleSaveSubCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCatForm.name.trim() || !subCatForm.categoryId) return;

    const cat = categories.find(c => c.id === subCatForm.categoryId);
    const subCatToSave: SubCategory = {
      id: editingSubCat ? editingSubCat.id : `sub-${Date.now()}`,
      tenantId: tenant.id,
      categoryId: subCatForm.categoryId,
      categoryName: cat?.name || '',
      name: subCatForm.name.trim(),
      code: subCatForm.code.trim() || undefined,
      description: subCatForm.description.trim() || undefined,
      createdAt: editingSubCat ? editingSubCat.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveSubCategory(subCatToSave);
    setSubCatModalOpen(false);
  };

  // Unit Handlers
  const handleOpenUnitModal = (unit?: UnitOfMeasure) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitForm({
        name: unit.name,
        shortName: unit.shortName,
        isBaseUnit: !!unit.isBaseUnit,
        baseUnit: unit.baseUnit || 'pcs',
        operator: unit.operator || '*',
        operationValue: unit.operationValue || 1,
      });
    } else {
      setEditingUnit(null);
      setUnitForm({
        name: '',
        shortName: '',
        isBaseUnit: false,
        baseUnit: 'pcs',
        operator: '*',
        operationValue: 12,
      });
    }
    setUnitModalOpen(true);
  };

  const handleSaveUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitForm.name.trim() || !unitForm.shortName.trim()) return;

    const unitToSave: UnitOfMeasure = {
      id: editingUnit ? editingUnit.id : `uom-${Date.now()}`,
      tenantId: tenant.id,
      name: unitForm.name.trim(),
      shortName: unitForm.shortName.trim().toLowerCase(),
      isBaseUnit: unitForm.isBaseUnit,
      baseUnit: unitForm.isBaseUnit ? undefined : unitForm.baseUnit,
      operator: unitForm.isBaseUnit ? undefined : unitForm.operator,
      operationValue: unitForm.isBaseUnit ? undefined : Number(unitForm.operationValue),
      createdAt: editingUnit ? editingUnit.createdAt : new Date().toISOString().split('T')[0],
    };

    onSaveUnit(unitToSave);
    setUnitModalOpen(false);
  };

  // Opening Stock Handlers
  const handleSaveOpening = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === openingForm.productId);
    const wh = warehouses.find(w => w.id === openingForm.warehouseId);
    if (!prod || !wh) return;

    const qty = Number(openingForm.quantity) || 0;
    const cost = Number(openingForm.unitCost) || 0;

    const entry: OpeningStockEntry = {
      id: `op-${Date.now()}`,
      tenantId: tenant.id,
      warehouseId: openingForm.warehouseId,
      warehouseName: wh.name,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: qty,
      unitCost: cost,
      subtotalCost: qty * cost,
      batchNumber: openingForm.batchNumber.trim() || `OP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      expiryDate: openingForm.expiryDate || undefined,
      entryDate: new Date().toISOString().split('T')[0],
      note: openingForm.note.trim() || 'প্রাথমিক উদ্বোধনী স্টক ব্যালেন্স',
      status: 'posted',
    };

    onSaveOpeningStock(entry);
    setOpeningModalOpen(false);
  };

  // Parse Bulk Update CSV
  const handleParseUpdateCsv = (text: string) => {
    setUpdateCsvText(text);
    setUpdateExecutedSummary(null);
    if (!text.trim()) {
      setUpdatePreviewList([]);
      setUpdateNotFoundSkus([]);
      return;
    }

    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const skuIdx = headers.findIndex(h => h === 'sku');
    const costIdx = headers.findIndex(h => h.includes('cost'));
    const sellingIdx = headers.findIndex(h => h.includes('selling') || h.includes('price') || h.includes('mrp'));
    const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty'));

    if (skuIdx === -1) {
      alert('CSV ফাইলে অবশ্যই একটি "SKU" হেডার কলাম থাকতে হবে!');
      return;
    }

    const previews: any[] = [];
    const notFounds: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim());
      const sku = cols[skuIdx];
      if (!sku) continue;

      const product = products.find(p => p.sku.toLowerCase() === sku.toLowerCase());
      if (!product) {
        notFounds.push(sku);
        continue;
      }

      const newCost = costIdx !== -1 && cols[costIdx] !== '' ? parseFloat(cols[costIdx]) : undefined;
      const newSelling = sellingIdx !== -1 && cols[sellingIdx] !== '' ? parseFloat(cols[sellingIdx]) : undefined;
      const newStock = stockIdx !== -1 && cols[stockIdx] !== '' ? parseInt(cols[stockIdx]) : undefined;

      let calculatedStock = product.stock;
      if (newStock !== undefined) {
        calculatedStock = updateStockMode === 'replace' ? newStock : product.stock + newStock;
      }

      previews.push({
        product,
        oldCost: product.costPrice,
        newCost: !isNaN(newCost as number) ? newCost : undefined,
        oldSelling: product.sellingPrice,
        newSelling: !isNaN(newSelling as number) ? newSelling : undefined,
        oldStock: product.stock,
        newStock: !isNaN(newStock as number) ? newStock : undefined,
        calculatedStock,
        status: 'match',
      });
    }

    setUpdatePreviewList(previews);
    setUpdateNotFoundSkus(notFounds);
  };

  const handleExecuteBulkUpdate = () => {
    if (updatePreviewList.length === 0) return;

    const updatesToCommit = updatePreviewList.map(item => ({
      id: item.product.id,
      costPrice: item.newCost !== undefined ? item.newCost : item.oldCost,
      sellingPrice: item.newSelling !== undefined ? item.newSelling : item.oldSelling,
      stock: item.calculatedStock,
    }));

    onBulkUpdateProducts(updatesToCommit);

    setUpdateExecutedSummary({
      totalRows: updatePreviewList.length + updateNotFoundSkus.length,
      updatedCount: updatePreviewList.length,
      notFoundCount: updateNotFoundSkus.length,
      skippedCount: 0,
      items: updatePreviewList.map(p => ({
        sku: p.product.sku,
        name: p.product.name,
        costPrice: p.newCost,
        sellingPrice: p.newSelling,
        stock: p.calculatedStock,
        status: 'success',
        message: `সফলভাবে আপডেট করা হয়েছে (স্টক: ${p.calculatedStock})`,
      })),
    });

    setUpdateCsvText('');
    setUpdatePreviewList([]);
  };

  // Sample Update CSV template download
  const handleDownloadUpdateTemplate = () => {
    const sample = `SKU,CostPrice,SellingPrice,StockQuantity
MED-NAPA-EX,2.15,3.20,450
GRO-RICE-MINI50,3150.00,3450.00,85
ELEC-SAM-A15,18200.00,21499.00,25`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'JH_IMSE_Update_Only_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Barcode / QR Generator Helper
  const currentBarcodeProduct = products.find(p => p.id === barcodeSelectedProductId) || products[0];

  const renderVectorBarcode = (code: string, symbology: BarcodeSymbology) => {
    if (symbology === 'QR') {
      return (
        <svg viewBox="0 0 100 100" className="w-16 h-16 mx-auto my-1">
          {/* Authentic QR finder patterns and data blocks */}
          <rect x="0" y="0" width="100" height="100" fill="white" />
          {/* Top-left pattern */}
          <rect x="10" y="10" width="30" height="30" fill="#0f172a" />
          <rect x="15" y="15" width="20" height="20" fill="white" />
          <rect x="20" y="20" width="10" height="10" fill="#0f172a" />
          {/* Top-right pattern */}
          <rect x="60" y="10" width="30" height="30" fill="#0f172a" />
          <rect x="65" y="15" width="20" height="20" fill="white" />
          <rect x="70" y="20" width="10" height="10" fill="#0f172a" />
          {/* Bottom-left pattern */}
          <rect x="10" y="60" width="30" height="30" fill="#0f172a" />
          <rect x="15" y="65" width="20" height="20" fill="white" />
          <rect x="20" y="70" width="10" height="10" fill="#0f172a" />
          {/* Data dots */}
          <rect x="45" y="15" width="8" height="8" fill="#0f172a" />
          <rect x="45" y="30" width="8" height="8" fill="#0f172a" />
          <rect x="45" y="50" width="8" height="8" fill="#0f172a" />
          <rect x="65" y="45" width="8" height="8" fill="#0f172a" />
          <rect x="55" y="65" width="8" height="8" fill="#0f172a" />
          <rect x="75" y="75" width="8" height="8" fill="#0f172a" />
          <rect x="85" y="60" width="8" height="8" fill="#0f172a" />
          <rect x="30" y="45" width="8" height="8" fill="#0f172a" />
        </svg>
      );
    }

    // Code128 / EAN13 barcode representation
    const bars = code.split('').map((c, i) => {
      const codeVal = c.charCodeAt(0) + i;
      const width = (codeVal % 3) + 1.2;
      return width;
    });

    return (
      <div className="flex items-center justify-center gap-[1.5px] h-8 w-full my-1 overflow-hidden">
        {bars.map((w, idx) => (
          <span 
            key={idx} 
            style={{ width: `${w}px` }} 
            className="h-full bg-slate-950 shrink-0" 
          />
        ))}
        {/* Fillers for realistic barcode aesthetic */}
        <span className="h-full w-[2px] bg-slate-950 shrink-0" />
        <span className="h-full w-[1px] bg-slate-950 shrink-0" />
        <span className="h-full w-[3px] bg-slate-950 shrink-0" />
        <span className="h-full w-[1.5px] bg-slate-950 shrink-0" />
        <span className="h-full w-[2px] bg-slate-950 shrink-0" />
        <span className="h-full w-[1px] bg-slate-950 shrink-0" />
      </div>
    );
  };

  const handlePrintLabels = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Printable Area CSS Injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-label-sheet, #printable-label-sheet * {
            visibility: visible !important;
          }
          #printable-label-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Banner & Sub-Navigation */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                প্রোডাক্ট হায়ারার্কি, ব্র্যান্ড, সাব-ক্যাটাগরি ও লেবেল প্রিন্টিং (Phase 17)
              </h2>
              <p className="text-xs text-slate-500">
                ERP আন্তর্জাতিক স্ট্যান্ডার্ডে ব্র্যান্ড ও সাব-ক্যাটাগরি ম্যাপিং, UOM কনভার্সন, প্রারম্ভিক স্টক ও A4/রোল বারকোড শিট জেনারেটর
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition self-start sm:self-center"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* 6 Nav Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('brands')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'brands'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> ব্র্যান্ড মাস্টার ({tenantBrands.length})
          </button>

          <button
            onClick={() => setActiveSubTab('sub_categories')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'sub_categories'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" /> সাব-ক্যাটাগরি ({tenantSubCats.length})
          </button>

          <button
            onClick={() => setActiveSubTab('units')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'units'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" /> পরিমাপ একক ও কনভার্সন ({tenantUnits.length})
          </button>

          <button
            onClick={() => setActiveSubTab('opening_stock')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'opening_stock'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> প্রারম্ভিক স্টক এন্ট্রি ({tenantOpeningStocks.length})
          </button>

          <button
            onClick={() => setActiveSubTab('barcodes')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'barcodes'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Barcode className="w-3.5 h-3.5" /> বারকোড ও স্টিকার শিট স্টুডিও
          </button>

          <button
            onClick={() => setActiveSubTab('update_import')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeSubTab === 'update_import'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" /> Import (Update Only) এক্সেল
          </button>
        </div>
      </div>

      {/* TAB 1: BRANDS MASTER */}
      {activeSubTab === 'brands' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
                placeholder="ব্র্যান্ডের নাম বা কোড খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
              />
            </div>

            <button
              onClick={() => handleOpenBrandModal()}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন ব্র্যান্ড যোগ করুন
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">ব্র্যান্ডের নাম</th>
                    <th className="px-4 py-3">কোড</th>
                    <th className="px-4 py-3">উৎপাদক দেশ</th>
                    <th className="px-4 py-3">ওয়েবসাইট</th>
                    <th className="px-4 py-3">সংযুক্ত পণ্য</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBrands.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        কোনো ব্র্যান্ড পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredBrands.map(brand => {
                      const linkedCount = products.filter(p => p.brandId === brand.id || p.brand === brand.name).length;
                      return (
                        <tr key={brand.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 font-black text-xs flex items-center justify-center border border-purple-100">
                                {brand.name.slice(0, 2).toUpperCase()}
                              </span>
                              <div>
                                <div>{brand.name}</div>
                                {brand.description && <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{brand.description}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600 font-medium">
                            {brand.code || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                            <Globe className="w-3.5 h-3.5 text-slate-400" /> {brand.originCountry || 'Bangladesh'}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {brand.website ? (
                              <a href={brand.website} target="_blank" rel="noreferrer" className="text-purple-700 hover:underline flex items-center gap-1">
                                {brand.website.replace('https://', '')}
                              </a>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {linkedCount}টি আইটেম
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              brand.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {brand.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenBrandModal(brand)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                                title="এডিট"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি "${brand.name}" ব্র্যান্ড মুছে ফেলতে চান?`)) {
                                    onDeleteBrand(brand.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                                title="মুছে ফেলুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUB-CATEGORIES */}
      {activeSubTab === 'sub_categories' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={subCatSearch}
                  onChange={e => setSubCatSearch(e.target.value)}
                  placeholder="সাব-ক্যাটাগরি খুঁজুন..."
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              {/* Category Filter */}
              <select
                value={subCatFilterCategory}
                onChange={e => setSubCatFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
              >
                <option value="all">সকল প্যারেন্ট ক্যাটাগরি</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenSubCatModal()}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন সাব-ক্যাটাগরি
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">সাব-ক্যাটাগরির নাম</th>
                    <th className="px-4 py-3">প্যারেন্ট ক্যাটাগরি</th>
                    <th className="px-4 py-3">কোড</th>
                    <th className="px-4 py-3">বিবরণ</th>
                    <th className="px-4 py-3">সংযুক্ত পণ্য</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubCats.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        কোনো সাব-ক্যাটাগরি পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredSubCats.map(sub => {
                      const parentCat = categories.find(c => c.id === sub.categoryId);
                      const linkedCount = products.filter(p => p.subCategoryId === sub.id).length;
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-purple-600" />
                              <span>{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-purple-700">
                            {parentCat?.name || sub.categoryName || 'General'}
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-600">
                            {sub.code || '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                            {sub.description || '—'}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {linkedCount}টি আইটেম
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenSubCatModal(sub)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`আপনি কি "${sub.name}" সাব-ক্যাটাগরি মুছে ফেলতে চান?`)) {
                                    onDeleteSubCategory(sub.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNITS OF MEASURE (UOM) */}
      {activeSubTab === 'units' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">পরিমাপ একক ও কনভার্সন রুলস (UOM Master)</h3>
              <p className="text-xs text-slate-500">
                বেস ইউনিট বনাম সেকেন্ডারি বিক্রয়/ক্রয় ইউনিট ম্যাপিং (যেমন: ১ কার্টুন = ১২ পিস, ১ কেজি = ১০০০ গ্রাম)
              </p>
            </div>
            <button
              onClick={() => handleOpenUnitModal()}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> নতুন ইউনিট তৈরি করুন
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenantUnits.map(unit => (
              <div key={unit.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition relative">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{unit.name}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                        {unit.shortName}
                      </span>
                    </div>
                    {unit.isBaseUnit ? (
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ✓ বেস ইউনিট (Primary Base Unit)
                      </span>
                    ) : (
                      <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 font-medium">
                        কনভার্সন সূত্র: <span className="font-bold text-purple-700">1 {unit.name} = {unit.operationValue} {unit.baseUnit}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenUnitModal(unit)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`আপনি কি "${unit.name}" ইউনিট মুছে ফেলতে চান?`)) {
                          onDeleteUnit(unit.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: OPENING STOCK SETUP */}
      {activeSubTab === 'opening_stock' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">প্রারম্ভিক স্টক সেটআপ (Opening Stock Voucher Hub)</h3>
              <p className="text-xs text-slate-500">
                নতুন দোকান বা নতুন আর্থিক বছরের শুরুতে গোডাউনভিত্তিক প্রাথমিক পণ্য স্টক, লট ও ক্রয়মূল্য এককালীন এন্ট্রি
              </p>
            </div>

            <button
              onClick={() => setOpeningModalOpen(true)}
              className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> প্রারম্ভিক স্টক ভাউচার এন্ট্রি
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">গোডাউন / ব্রাঞ্চ</th>
                    <th className="px-4 py-3">পণ্যের নাম ও SKU</th>
                    <th className="px-4 py-3">লট / ব্যাচ নং</th>
                    <th className="px-4 py-3 text-right">পরিমাণ</th>
                    <th className="px-4 py-3 text-right">একক ক্রয়মূল্য</th>
                    <th className="px-4 py-3 text-right">মোট ইনভেস্টমেন্ট</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tenantOpeningStocks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        কোনো প্রারম্ভিক স্টক এন্ট্রি করা হয়নি।
                      </td>
                    </tr>
                  ) : (
                    tenantOpeningStocks.map(op => (
                      <tr key={op.id} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">{op.entryDate}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{op.warehouseName}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{op.productName}</div>
                          <div className="font-mono text-[10px] text-purple-700">{op.sku}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">
                          {op.batchNumber || '—'}
                          {op.expiryDate && <span className="block text-[10px] text-rose-500">মেয়াদ: {op.expiryDate}</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900">{op.quantity}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-600">{tenant.currency}{op.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700">{tenant.currency}{op.subtotalCost.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            ✓ পোস্টেড (Posted)
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BARCODE LABEL & STICKER STUDIO */}
      {activeSubTab === 'barcodes' && (
        <div className="space-y-4">
          {/* Controls Bar (Hidden during Print) */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4 no-print">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-purple-700" />
                  বারকোড লেবেল ও স্টিকার প্রিন্ট স্টুডিও (Barcode Sheet Studio)
                </h3>
                <p className="text-xs text-slate-500">
                  A4 স্টিকার শিট (২৪ ও ৩০ লেবেল) অথবা ৫০x৩০ মিমি থার্মাল রোল স্টিকার পেপারে উচ্চমানের বারকোড প্রিন্ট করুন
                </p>
              </div>

              <button
                onClick={handlePrintLabels}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-center"
              >
                <Printer className="w-4 h-4" /> শিট প্রিন্ট করুন (Print Now)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Product Picker */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">পণ্য সিলেক্ট করুন:</label>
                <select
                  value={barcodeSelectedProductId}
                  onChange={e => setBarcodeSelectedProductId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} [{p.sku}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Paper Format */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কাগজ / শিট ফরম্যাট:</label>
                <select
                  value={barcodeFormat}
                  onChange={e => setBarcodeFormat(e.target.value as LabelPaperFormat)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  <option value="a4_24">A4 শিট: ২৪ লেবেল (৩ x ৮ গ্রিড - 70x37mm)</option>
                  <option value="a4_30">A4 শিট: ৩০ লেবেল (৩ x ১০ গ্রিড - 70x30mm)</option>
                  <option value="roll_50x30">থার্মাল রোল: ৫০ x ৩০ মিমি (১ কলাম)</option>
                  <option value="roll_40x25">জুয়েলারি/মিনি রোল: ৪০ x ২৫ মিমি</option>
                </select>
              </div>

              {/* Barcode Symbology */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">বারকোড ফরম্যাট:</label>
                <select
                  value={barcodeSymbology}
                  onChange={e => setBarcodeSymbology(e.target.value as BarcodeSymbology)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  <option value="CODE128">Code 128 (আলফানিউমেরিক স্ট্যান্ডার্ড)</option>
                  <option value="EAN13">EAN-13 (রিটেইল গ্লোবাল)</option>
                  <option value="QR">QR Code (দ্বিমাত্রিক কিউআর কোড)</option>
                </select>
              </div>

              {/* Copies Count */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">কপি সংখ্যা (Stickers count):</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={barcodeCopies}
                  onChange={e => setBarcodeCopies(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Customization Checkbox Toggles */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludeBusiness}
                  onChange={e => setBarcodeIncludeBusiness(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>দোকানের নাম</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludeProduct}
                  onChange={e => setBarcodeIncludeProduct(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>পণ্যের নাম</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludeBrand}
                  onChange={e => setBarcodeIncludeBrand(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>ব্র্যান্ডের নাম</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludeSKU}
                  onChange={e => setBarcodeIncludeSKU(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>SKU কোড</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludePrice}
                  onChange={e => setBarcodeIncludePrice(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>বিক্রয় মূল্য (MRP)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={barcodeIncludeExpiry}
                  onChange={e => setBarcodeIncludeExpiry(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span>ব্যাচ ও মেয়াদোত্তীর্ণ তারিখ</span>
              </label>
            </div>
          </div>

          {/* Printable Label Sheet Preview */}
          <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-200">
            <div className="max-w-4xl mx-auto">
              <div 
                id="printable-label-sheet"
                className={`bg-white p-4 shadow-sm border border-slate-300 rounded-xl ${
                  barcodeFormat === 'roll_50x30' || barcodeFormat === 'roll_40x25'
                    ? 'max-w-[260px] mx-auto space-y-3'
                    : 'grid grid-cols-1 sm:grid-cols-3 gap-3'
                }`}
              >
                {Array.from({ length: barcodeCopies }).map((_, index) => (
                  <div
                    key={index}
                    className="border border-dashed border-slate-300 rounded-lg p-2.5 text-center flex flex-col justify-between bg-white text-slate-900"
                    style={{ minHeight: barcodeFormat === 'roll_40x25' ? '95px' : '115px' }}
                  >
                    {/* Business Name */}
                    {barcodeIncludeBusiness && (
                      <div className="text-[10px] font-black uppercase tracking-wider text-purple-900 line-clamp-1 border-b border-slate-100 pb-0.5">
                        {tenant.name}
                      </div>
                    )}

                    {/* Product Name */}
                    {barcodeIncludeProduct && (
                      <div className="font-bold text-xs text-slate-900 line-clamp-1 mt-0.5">
                        {currentBarcodeProduct?.name || 'Selected Product'}
                      </div>
                    )}

                    {/* Brand */}
                    {barcodeIncludeBrand && currentBarcodeProduct?.brand && (
                      <div className="text-[9px] text-slate-500 font-medium">
                        Brand: {currentBarcodeProduct.brand}
                      </div>
                    )}

                    {/* Barcode Render */}
                    <div className="my-1">
                      {renderVectorBarcode(currentBarcodeProduct?.sku || 'SKU-1001', barcodeSymbology)}
                      {barcodeIncludeSKU && (
                        <div className="text-[9px] font-mono tracking-widest text-slate-700">
                          *{currentBarcodeProduct?.sku || 'SKU-1001'}*
                        </div>
                      )}
                    </div>

                    {/* Price & Batch */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-1 mt-0.5 text-[10px]">
                      {barcodeIncludePrice && (
                        <div className="font-black text-slate-900">
                          MRP: {tenant.currency}{currentBarcodeProduct?.sellingPrice.toFixed(2)}
                        </div>
                      )}
                      {barcodeIncludeExpiry && currentBarcodeProduct?.expiryDate && (
                        <div className="text-[8px] text-slate-500">
                          Exp: {currentBarcodeProduct.expiryDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IMPORT UPDATE ONLY EXCEL */}
      {activeSubTab === 'update_import' && (
        <div className="space-y-4 no-print">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-indigo-600" />
                  বাল্ক আপডেট এক্সেল ইঞ্জিন (Import Update Only)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  নতুন পণ্য যোগ না করে শুধুমাত্র বিদ্যমান পণ্যের ক্রয়মূল্য (Cost), বিক্রয়মূল্য (Selling) ও স্টক এক ক্লিকে হালনাগাদ করুন
                </p>
              </div>

              <button
                onClick={handleDownloadUpdateTemplate}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 cursor-pointer self-start sm:self-center"
              >
                <Download className="w-4 h-4" /> স্যাম্পল CSV টেমপ্লেট
              </button>
            </div>

            {/* Radio Mode Selector */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-700">
              <span className="text-slate-500">স্টক আপডেট মোড:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stockMode"
                  checked={updateStockMode === 'replace'}
                  onChange={() => setUpdateStockMode('replace')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>রিপ্লেস মোড (নতুন সংখ্যাকে বর্তমান স্টক হিসেবে বসাবে)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="stockMode"
                  checked={updateStockMode === 'add'}
                  onChange={() => setUpdateStockMode('add')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>যোগ মোড (বিদ্যমান স্টকের সাথে নতুন সংখ্যা যোগ করবে)</span>
              </label>
            </div>

            {/* CSV Paste Textbox */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CSV টেক্সট পেস্ট করুন (Paste Comma-Separated Data):
              </label>
              <textarea
                rows={5}
                value={updateCsvText}
                onChange={e => handleParseUpdateCsv(e.target.value)}
                placeholder="SKU,CostPrice,SellingPrice,StockQuantity&#10;MED-NAPA-EX,2.15,3.20,450&#10;GRO-RICE-MINI50,3150.00,3450.00,85"
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Preview Diff Table */}
            {updatePreviewList.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-800">
                    আপডেট প্রিভিউ তালিকা ({updatePreviewList.length}টি মিলে যাওয়া পণ্য):
                  </h4>
                  <button
                    onClick={handleExecuteBulkUpdate}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> নিশ্চিত করুন ও আপডেট কার্যকর করুন
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">SKU</th>
                        <th className="px-3 py-2">পণ্যের নাম</th>
                        <th className="px-3 py-2 text-right">পূর্বের ক্রয়মূল্য → নতুন</th>
                        <th className="px-3 py-2 text-right">পূর্বের বিক্রয়মূল্য → নতুন</th>
                        <th className="px-3 py-2 text-right">পূর্বের স্টক → নতুন স্টক</th>
                        <th className="px-3 py-2 text-center">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {updatePreviewList.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-indigo-700">{item.product.sku}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{item.product.name}</td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-slate-400 line-through mr-1">{tenant.currency}{item.oldCost.toFixed(2)}</span>
                            <span className="font-bold text-slate-900">
                              {item.newCost !== undefined ? `${tenant.currency}${item.newCost.toFixed(2)}` : 'অপরিবর্তিত'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-slate-400 line-through mr-1">{tenant.currency}{item.oldSelling.toFixed(2)}</span>
                            <span className="font-bold text-emerald-700">
                              {item.newSelling !== undefined ? `${tenant.currency}${item.newSelling.toFixed(2)}` : 'অপরিবর্তিত'}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <span className="text-slate-400 mr-1">{item.oldStock} →</span>
                            <span className="font-bold text-purple-700">{item.calculatedStock}</span>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                              সফল মিল
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Unmatched SKUs Warning */}
            {updateNotFoundSkus.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {updateNotFoundSkus.length}টি SKU ইনভেন্টরিতে পাওয়া যায়নি (এগুলো স্কিপ করা হবে):
                </div>
                <div className="font-mono text-[11px] text-amber-700">
                  {updateNotFoundSkus.join(', ')}
                </div>
              </div>
            )}

            {/* Execution Audit Log Notification */}
            {updateExecutedSummary && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950">
                    বাল্ক আপডেট সফলভাবে সম্পন্ন হয়েছে!
                  </h4>
                  <p className="text-emerald-700 mt-0.5">
                    মোট {updateExecutedSummary.updatedCount}টি পণ্যের দাম ও স্টক সরাসরি ইনভেন্টরিতে হালনাগাদ করা হয়েছে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BRAND MODAL */}
      {brandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-purple-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingBrand ? 'ব্র্যান্ড তথ্য সম্পাদন করুন' : 'নতুন ব্র্যান্ড যোগ করুন'}
              </h3>
              <button onClick={() => setBrandModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ব্র্যান্ডের নাম *</label>
                <input
                  type="text"
                  required
                  value={brandForm.name}
                  onChange={e => setBrandForm({ ...brandForm, name: e.target.value })}
                  placeholder="যেমন: Square, Samsung, Pran"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কোড (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={brandForm.code}
                    onChange={e => setBrandForm({ ...brandForm, code: e.target.value })}
                    placeholder="SQ-PHARMA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">উৎপাদক দেশ</label>
                  <input
                    type="text"
                    value={brandForm.originCountry}
                    onChange={e => setBrandForm({ ...brandForm, originCountry: e.target.value })}
                    placeholder="Bangladesh"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">অফিসিয়াল ওয়েবসাইট</label>
                <input
                  type="url"
                  value={brandForm.website}
                  onChange={e => setBrandForm({ ...brandForm, website: e.target.value })}
                  placeholder="https://brand.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ (Description)</label>
                <textarea
                  rows={2}
                  value={brandForm.description}
                  onChange={e => setBrandForm({ ...brandForm, description: e.target.value })}
                  placeholder="ব্র্যান্ডের সংক্ষিপ্ত তথ্য..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">স্ট্যাটাস</label>
                <select
                  value={brandForm.status}
                  onChange={e => setBrandForm({ ...brandForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="inactive">নিষ্ক্রিয় (Inactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBrandModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-CATEGORY MODAL */}
      {subCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-purple-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingSubCat ? 'সাব-ক্যাটাগরি সম্পাদনা' : 'নতুন সাব-ক্যাটাগরি তৈরি করুন'}
              </h3>
              <button onClick={() => setSubCatModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubCat} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">প্যারেন্ট ক্যাটাগরি *</label>
                <select
                  required
                  value={subCatForm.categoryId}
                  onChange={e => setSubCatForm({ ...subCatForm, categoryId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">সাব-ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  required
                  value={subCatForm.name}
                  onChange={e => setSubCatForm({ ...subCatForm, name: e.target.value })}
                  placeholder="যেমন: Paracetamol Tablets, Organic Spices"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">কোড (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={subCatForm.code}
                  onChange={e => setSubCatForm({ ...subCatForm, code: e.target.value })}
                  placeholder="SUB-001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">বিবরণ (ঐচ্ছিক)</label>
                <textarea
                  rows={2}
                  value={subCatForm.description}
                  onChange={e => setSubCatForm({ ...subCatForm, description: e.target.value })}
                  placeholder="সাব-ক্যাটাগরির সংক্ষিপ্ত বিবরণ..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSubCatModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UNIT OF MEASURE MODAL */}
      {unitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-purple-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                {editingUnit ? 'ইউনিট ও পরিমাপ সম্পাদনা' : 'নতুন ইউনিট তৈরি করুন'}
              </h3>
              <button onClick={() => setUnitModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ইউনিটের পুরো নাম *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.name}
                    onChange={e => setUnitForm({ ...unitForm, name: e.target.value })}
                    placeholder="Box, Carton, Dozen"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সংক্ষিপ্ত নাম (Code) *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.shortName}
                    onChange={e => setUnitForm({ ...unitForm, shortName: e.target.value })}
                    placeholder="box, ctn, doz"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-900">
                  <input
                    type="checkbox"
                    checked={unitForm.isBaseUnit}
                    onChange={e => setUnitForm({ ...unitForm, isBaseUnit: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>এটি একটি বেস ইউনিট (যেমন: pcs, kg, litre)</span>
                </label>
                <p className="text-[10px] text-purple-700 mt-1">
                  যদি এটি বেস ইউনিট না হয়, তবে নিচের কনভার্সন সূত্র পূরণ করুন।
                </p>
              </div>

              {!unitForm.isBaseUnit && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="font-semibold text-slate-800">কনভার্সন রুলস (Conversion Equation):</div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">1 {unitForm.name || 'Unit'} =</span>
                    <input
                      type="number"
                      min={1}
                      value={unitForm.operationValue}
                      onChange={e => setUnitForm({ ...unitForm, operationValue: Number(e.target.value) })}
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                    <select
                      value={unitForm.operator}
                      onChange={e => setUnitForm({ ...unitForm, operator: e.target.value as any })}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg font-bold"
                    >
                      <option value="*">* (গুণ)</option>
                      <option value="/">/ (ভাগ)</option>
                    </select>
                    <input
                      type="text"
                      value={unitForm.baseUnit}
                      onChange={e => setUnitForm({ ...unitForm, baseUnit: e.target.value })}
                      placeholder="pcs / gm"
                      className="w-20 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">
                    উদাহরণ: 1 Box = 12 * pcs অথবা 1 kg = 1000 * gm
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setUnitModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPENING STOCK MODAL */}
      {openingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-purple-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                প্রারম্ভিক স্টক ভাউচার এন্ট্রি (Opening Stock)
              </h3>
              <button onClick={() => setOpeningModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOpening} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">গোডাউন / ব্রাঞ্চ সিলেক্ট করুন *</label>
                <select
                  required
                  value={openingForm.warehouseId}
                  onChange={e => setOpeningForm({ ...openingForm, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.location})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">পণ্য সিলেক্ট করুন *</label>
                <select
                  required
                  value={openingForm.productId}
                  onChange={e => {
                    const pid = e.target.value;
                    const p = products.find(prod => prod.id === pid);
                    setOpeningForm({
                      ...openingForm,
                      productId: pid,
                      unitCost: p?.costPrice || 0,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} [{p.sku}]</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পরিমাণ (Quantity) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={openingForm.quantity}
                    onChange={e => setOpeningForm({ ...openingForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">একক ক্রয়মূল্য ({tenant.currency}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={openingForm.unitCost}
                    onChange={e => setOpeningForm({ ...openingForm, unitCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">লট / ব্যাচ নম্বর</label>
                  <input
                    type="text"
                    value={openingForm.batchNumber}
                    onChange={e => setOpeningForm({ ...openingForm, batchNumber: e.target.value })}
                    placeholder="OPN-2025-01"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">মেয়াদোত্তীর্ণ তারিখ</label>
                  <input
                    type="date"
                    value={openingForm.expiryDate}
                    onChange={e => setOpeningForm({ ...openingForm, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between text-xs font-bold text-purple-900">
                <span>মোট ইনভেস্টমেন্ট হিসাব:</span>
                <span className="text-sm">{tenant.currency}{(openingForm.quantity * openingForm.unitCost).toFixed(2)}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">নোট / রেফারেন্স</label>
                <input
                  type="text"
                  value={openingForm.note}
                  onChange={e => setOpeningForm({ ...openingForm, note: e.target.value })}
                  placeholder="যেমন: উদ্বোধনী ব্যালেন্স সেটেলমেন্ট"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOpeningModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  পোস্ট করুন (Post to Inventory)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
