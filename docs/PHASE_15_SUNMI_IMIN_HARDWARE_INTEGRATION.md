# Phase 15: Sunmi & iMin POS Native Hardware Integration
**সানমি (Sunmi) ও আইমিন (iMin) হার্ডওয়্যার ড্রাইভার, থার্মাল প্রিন্টিং ও ক্যাশ ড্রয়ার কিক**

---

## ১. সারসংক্ষেপ ও হার্ডওয়্যার ইকোসিস্টেম
আধুনিক রিটেল স্টোরে ডেস্কটপ ব্রাউজার প্রিন্ট ডায়ালগ (Ctrl+P) দিয়ে কাজ চালানো অত্যন্ত ধীরগতির ও অপেশাদার। 
আন্তর্জাতিক ব্র্যান্ডের মতো দ্রুতগতির কাউন্টার পরিচালনার জন্য অ্যান্ড্রয়েড পিওএস টার্মিনাল যেমন:
- **Sunmi V2 Pro / V2s / T2 / T2s / D2s**
- **iMin D4 / Swift 1 / M2-203**
- **Epson & Xprinter ESC/POS Thermal Printers**

এর সরাসরি ড্রাইভার লেভেলে ইন্টিগ্রেশন প্রয়োজন। Phase 15-এ হার্ডওয়্যার নিয়ন্ত্রণ যুক্ত হবে।

---

## ২. মূল হার্ডওয়্যার ক্যাপাবিলিটি (Hardware Capabilities)

### ১. ডিরেক্ট ESC/POS থার্মাল প্রিন্টিং (Zero Dialog Instant Print)
- ব্রাউজারের প্রিন্ট ডায়ালগ ছাড়া ১ ক্লিকেই সরাসরি থার্মাল পেপারে বিল প্রিন্ট।
- **সংযোগ মাধ্যম:**
  - ইউএসবি (WebUSB / Android USB Host)
  - ব্লুটুথ (Web Bluetooth Low Energy - BLE)
  - নেটওয়ার্ক আইপি (TCP/IP 9100 port)
- বাংলা টেক্সট রেন্ডারিং (Unicode Bangla ESC/POS Bitmap Font Engine).

### ২. ইলেকট্রনিক ক্যাশ ড্রয়ার কিক (RJ11 Cash Drawer Pulse)
- ক্যাশ পেমেন্ট বাটনে ক্লিক করার সাথে সাথে থার্মাল প্রিন্টারের RJ11 পোর্ট দিয়ে 24V পালস পাঠিয়ে ড্রয়ার স্বয়ংক্রিয় খুলে ফেলা।
- **ESC/POS হেক্স কোড:**
  ```text
  ASCII: ESC p m t1 t2
  HEX:   1B 70 00 19 FA
  ```

### ৩. কাস্টমার ফেসিং সেকেন্ডারি ডিসপ্লে (Customer-Facing Display - CFD)
- টার্মিনালের উল্টো পিঠে গ্রাহকের দিকে থাকা সেকেন্ডারি স্ক্রিনে লাইভ আইটেম তালিকা, মোট প্রদেয় টাকা এবং **bKash Dynamic QR Code** প্রদর্শন।
- গ্রাহক নিজের মোবাইল দিয়ে কিউআর স্ক্যান করে সেকেন্ডেই বিল পরিশোধ করতে পারবেন।

### ৪. ডিজিটাল ওজন স্কেল (Weighing Scale RS-232/USB)
- সুপারমার্কেটের কাঁচা সবজি, ফল বা মিষ্টির ওজন সরাসরি পিওএস মেশিনে চলে আসবে এবং স্বয়ংক্রিয় মোট টাকা নির্ধারণ হবে।

---

## ৩. আর্কিটেকচার ও ওয়েব-টু-হার্ডওয়্যার ব্রিজ (Hardware Bridge Architecture)

```
[JH IMSE React SPA / PWA]
            │
    (Web Serial / WebUSB / BLE / Local WebSocket Bridge)
            │
            ▼
[Sunmi / iMin Native Printer Service (Android AIDL / SDK)]
            │
            ├──► 内置 থার্মাল প্রিন্টার (Direct Thermal Head 58mm / 80mm)
            ├──► আরজে-১১ ক্যাশ বাক্স (Cash Drawer Kick)
            ├──► কাস্টমার সেকেন্ডারি স্ক্রিন (Dual Screen Sub-Display)
            └──► অপটিক্যাল বারকোড স্ক্যানার হেড (1D/2D Hardware Imager)
```

---

## ৪. কোড ইমপ্লিমেন্টেশন স্নsnippet (Web Serial & ESC/POS Command)

```typescript
// Cash Drawer Kick Command via Web Serial
export async function kickCashDrawer(writer: WritableStreamDefaultWriter<Uint8Array>) {
  const pulseCommand = new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]);
  await writer.write(pulseCommand);
}

// 80mm ESC/POS Paper Cut Command
export async function cutPaper(writer: WritableStreamDefaultWriter<Uint8Array>) {
  const cutCommand = new Uint8Array([0x1D, 0x56, 0x41, 0x00]);
  await writer.write(cutCommand);
}
```
