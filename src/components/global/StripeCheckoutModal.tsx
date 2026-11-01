import React, { useState } from 'react';
import { 
  X, ShieldCheck, CreditCard, Lock, CheckCircle2, AlertCircle, 
  Smartphone, ArrowRight, RefreshCw, Printer, ExternalLink, Globe
} from 'lucide-react';
import { CurrencyCode, CrossBorderTransaction, Tenant, ExchangeRateRecord } from '../../types';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  exchangeRates: ExchangeRateRecord[];
  onPaymentSuccess: (transaction: CrossBorderTransaction) => void;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  tenant,
  exchangeRates,
  onPaymentSuccess,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('USD');
  const [amount, setAmount] = useState<number>(120.00);
  const [customerName, setCustomerName] = useState('Johnathan Miller');
  const [customerEmail, setCustomerEmail] = useState('j.miller@globalclient.com');
  const [customerCountry, setCustomerCountry] = useState('United States');
  
  // Card input states
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 3D Secure 2.0 State
  const [show3dsModal, setShow3dsModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [isVerifying3ds, setIsVerifying3ds] = useState(false);

  // Success State
  const [completedTransaction, setCompletedTransaction] = useState<CrossBorderTransaction | null>(null);

  if (!isOpen) return null;

  // Find active exchange rate for selected currency to BDT
  const currentFx = exchangeRates.find(fx => fx.fromCurrency === selectedCurrency) || {
    rate: selectedCurrency === 'BDT' ? 1.0 : 121.50,
    buyRate: 120.90,
    sellRate: 122.10,
    spreadPct: 0.99,
  };

  const bookingRate = currentFx.rate;
  const baseBDT = Number((amount * bookingRate).toFixed(2));
  // Simulate slight market rate movement at settlement (+/- 0.20 BDT) for forex gain/loss demonstration
  const settlementRate = selectedCurrency === 'BDT' ? 1.0 : Number((bookingRate + 0.35).toFixed(2));
  const settlementBDT = Number((amount * settlementRate).toFixed(2));
  const forexGainLoss = Number((settlementBDT - baseBDT).toFixed(2));
  const gatewayFee = Number(((baseBDT * 0.029) + (0.30 * bookingRate)).toFixed(2));
  const netBDT = Number((settlementBDT - gatewayFee).toFixed(2));

  // Auto-detect card brand
  const detectCardBrand = (num: string): 'visa' | 'mastercard' | 'amex' => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('51') || clean.startsWith('52') || clean.startsWith('53') || clean.startsWith('54') || clean.startsWith('55')) return 'mastercard';
    if (clean.startsWith('34') || clean.startsWith('37')) return 'amex';
    return 'visa';
  };

  const cardBrand = detectCardBrand(cardNumber);

  // Format Card Number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Expiry
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Quick fill test cards
  const applyTestCard = (type: 'visa_success' | 'mc_3ds' | 'decline') => {
    if (type === 'visa_success') {
      setCardNumber('4242 4242 4242 4242');
      setCardExpiry('12/28');
      setCardCvc('892');
      setErrorMessage(null);
    } else if (type === 'mc_3ds') {
      setCardNumber('5555 5555 5555 4444');
      setCardExpiry('11/27');
      setCardCvc('314');
      setErrorMessage(null);
    } else {
      setCardNumber('4000 0000 0000 0002');
      setCardExpiry('08/26');
      setCardCvc('101');
      setErrorMessage(null);
    }
  };

  // Trigger Pay
  const handlePayClick = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১৬ ডিজিটের কার্ড নম্বর প্রদান করুন।');
      return;
    }

    if (cleanCard === '4000000000000002') {
      setErrorMessage('Your card was declined. (Test card error: insufficient_funds)');
      return;
    }

    setIsProcessing(true);

    // If test card has 3DS trigger or amounts > 200, trigger 3DS 2.0 challenge
    setTimeout(() => {
      setIsProcessing(false);
      if (cleanCard.startsWith('5555') || amount >= 200) {
        setShow3dsModal(true);
      } else {
        finalizePayment(false);
      }
    }, 1200);
  };

  const finalizePayment = (used3ds: boolean) => {
    const cleanCard = cardNumber.replace(/\s+/g, '');
    const newTrx: CrossBorderTransaction = {
      id: 'trx-glb-' + Date.now(),
      tenantId: tenant.id,
      transactionNo: `GLB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      customerCountry,
      customerEmail,
      gateway: 'stripe',
      currency: selectedCurrency,
      foreignAmount: amount,
      exchangeRate: bookingRate,
      baseAmountBDT: baseBDT,
      settlementExchangeRate: settlementRate,
      settlementAmountBDT: settlementBDT,
      forexGainLossBDT: forexGainLoss,
      gatewayFeeBDT: gatewayFee,
      netAmountBDT: netBDT,
      status: 'succeeded',
      paymentIntentId: `pi_3N9x${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      cardLast4: cleanCard.slice(-4),
      cardBrand,
      threeDSecureAuthenticated: true,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      notes: `Stripe Elements Hosted Checkout (${used3ds ? '3DS 2.0 SCA Verified' : 'Direct Frictionless'})`,
      journalEntryPosted: true,
    };

    setCompletedTransaction(newTrx);
    onPaymentSuccess(newTrx);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      setErrorMessage('ভুল OTP কোড। অনুগ্রহ করে 123456 ব্যবহার করুন।');
      return;
    }
    setIsVerifying3ds(true);
    setTimeout(() => {
      setIsVerifying3ds(false);
      setShow3dsModal(false);
      finalizePayment(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 my-auto">
        {/* Stripe Header */}
        <div className="bg-[#635BFF] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-white shadow-xs">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide">STRIPE CHECKOUT & ELEMENTS</span>
                <span className="text-[10px] bg-emerald-400 text-slate-900 font-black px-2 py-0.5 rounded-full uppercase">
                  3D Secure 2.0
                </span>
              </div>
              <p className="text-xs text-indigo-100">{tenant.name} • গ্লোবাল ক্রস-বর্ডার পেমেন্ট গেটওয়ে</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPLETED SUCCESS RECEIPT VIEW */}
        {completedTransaction ? (
          <div className="p-6 space-y-6 text-slate-800 animate-in fade-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">আন্তর্জাতিক পেমেন্ট সফল হয়েছে!</h3>
              <p className="text-xs text-slate-500">
                Stripe PaymentIntent সফলভাবে ক্যাপচার এবং ব্যাংকে ডিপোজিট সম্পন্ন হয়েছে।
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">ট্রানজেকশন আইডি:</span>
                <span className="font-mono font-bold text-purple-700">{completedTransaction.transactionNo}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Stripe PaymentIntent:</span>
                <span className="font-mono text-slate-700">{completedTransaction.paymentIntentId}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">চার্জকৃত বৈদেশিক মুদ্রা:</span>
                <span className="font-bold text-slate-900">
                  {completedTransaction.currency} {completedTransaction.foreignAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">বুকিং এক্সচেঞ্জ রেট:</span>
                <span className="font-semibold text-slate-700">১ {completedTransaction.currency} = ৳{completedTransaction.exchangeRate}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">লোকাল কারেন্সি সমতুল্য (BDT):</span>
                <span className="font-black text-slate-900">৳{completedTransaction.baseAmountBDT.toLocaleString()} BDT</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 bg-emerald-50/80 -mx-4 px-4 py-2 text-emerald-900">
                <span className="font-semibold">বৈদেশিক মুদ্রা নিষ্পত্তি লাভ (Forex Gain):</span>
                <span className="font-black text-emerald-700">+৳{completedTransaction.forexGainLossBDT.toFixed(2)} BDT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">নিট ডিপোজিট (ফি বাদে):</span>
                <span className="font-black text-purple-800 text-sm">৳{completedTransaction.netAmountBDT.toLocaleString()} BDT</span>
              </div>
            </div>

            {/* 3DS Security Badge */}
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900 text-xs">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold block">3D Secure 2.0 ও SCA অনুমোদিত</span>
                <span className="text-[11px] text-indigo-700">
                  ভিসা/মাস্টারকার্ড ভেরিফায়েড প্রোটোকল দ্বারা ফ্রড ও চার্র্জব্যাক শতভাগ প্রটেক্টেড।
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                রসিদ প্রিন্ট করুন
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#635BFF] hover:bg-[#5349e4] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
              >
                সম্পন্ন ও বন্ধ করুন
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* PAYMENT FORM VIEW */
          <form onSubmit={handlePayClick} className="p-6 space-y-4 text-xs text-slate-700">
            {/* Currency & Amount Selector */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">আন্তর্জাতিক মুদ্রা নির্বাচন ও পরিমাণ:</span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-700">
                  <Globe className="w-3.5 h-3.5" />
                  <span>রেট: ১ {selectedCurrency} = ৳{bookingRate}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {(['USD', 'EUR', 'GBP', 'AED', 'SAR', 'BDT'] as CurrencyCode[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCurrency(c)}
                    className={`py-1.5 px-2 rounded-xl font-bold text-center border transition cursor-pointer ${
                      selectedCurrency === c
                        ? 'bg-[#635BFF] text-white border-[#635BFF] shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">
                    {selectedCurrency === 'USD' ? '$' : selectedCurrency === 'EUR' ? '€' : selectedCurrency === 'GBP' ? '£' : selectedCurrency === 'BDT' ? '৳' : ''}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-black text-sm focus:outline-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex-1 bg-white p-2 border border-slate-200 rounded-xl text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">বাংলাদেশী সমপরিমাণ (BDT):</span>
                  <span className="font-black text-purple-800 text-sm">৳{baseBDT.toLocaleString()} BDT</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">গ্রাহকের নাম (Cardholder Name):</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-indigo-500"
                  placeholder="e.g. Johnathan Miller"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">ইমেইল ঠিকানা (Email):</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-indigo-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Stripe Card Elements Container */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                  কার্ড তথ্য (Stripe Card Element):
                </label>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> 256-bit SSL Encrypted
                </span>
              </div>

              <div className="border border-slate-300 rounded-2xl p-3 bg-white focus-within:border-[#635BFF] focus-within:ring-2 focus-within:ring-indigo-100 transition space-y-2.5 shadow-2xs">
                {/* Card Number Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="flex-1 font-mono text-sm tracking-widest text-slate-900 focus:outline-none"
                  />
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    cardBrand === 'visa' ? 'bg-blue-100 text-blue-800' :
                    cardBrand === 'mastercard' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {cardBrand.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">মেয়াদ (MM/YY):</label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full font-mono text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-semibold mb-0.5">CVC / CVV:</label>
                    <input
                      type="password"
                      required
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••"
                      maxLength={4}
                      className="w-full font-mono text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Cards Quick Presets */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] space-y-1.5">
              <span className="font-bold text-slate-600 block">স্ট্রাইপ টেস্ট কার্ড কুইক-ফিল:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyTestCard('visa_success')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-emerald-500 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  💳 ভিসা (সরাসরি সফল)
                </button>
                <button
                  type="button"
                  onClick={() => applyTestCard('mc_3ds')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-500 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  🔐 মাস্টারকার্ড (3DS 2.0 চ্যালেঞ্জ)
                </button>
                <button
                  type="button"
                  onClick={() => applyTestCard('decline')}
                  className="px-2 py-1 bg-white border border-slate-200 hover:border-rose-500 rounded-lg text-slate-700 font-semibold cursor-pointer"
                >
                  ❌ ডিক্লাইন্ড টেস্ট
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-[#635BFF] hover:bg-[#5349e4] disabled:opacity-75 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Stripe Gateway Communicating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay {selectedCurrency} {amount.toFixed(2)} (৳{baseBDT.toLocaleString()})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* 3D SECURE 2.0 CHALLENGE MODAL SIMULATOR */}
      {show3dsModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-300 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <span className="font-extrabold text-xs text-slate-900 uppercase">3D Secure 2.0 Verification</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">Card Issuing Bank</span>
            </div>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-slate-900">SMS ওয়ান-টাইম পাসওয়ার্ড (OTP)</h4>
              <p className="text-[11px] text-slate-500">
                আপনার কার্ড প্রদানকারী ব্যাংক থেকে +1 (555) ***-4821 নম্বরে একটি কোড পাঠানো হয়েছে।
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block text-center mb-1">
                  ৬ ডিজিটের ভেরিফিকেশন কোড (টেস্ট কোড: 123456)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full text-center tracking-widest font-mono text-base font-bold py-2 border-2 border-indigo-200 rounded-xl focus:border-indigo-600 focus:outline-none"
                  placeholder="123456"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying3ds}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-75 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifying3ds ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying with Issuer...</span>
                  </>
                ) : (
                  <span>পেমেন্ট নিশ্চিত করুন (Authorize)</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShow3dsModal(false)}
                className="w-full py-1.5 text-slate-400 hover:text-slate-600 text-xs font-semibold cursor-pointer"
              >
                বাতিল করুন
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
