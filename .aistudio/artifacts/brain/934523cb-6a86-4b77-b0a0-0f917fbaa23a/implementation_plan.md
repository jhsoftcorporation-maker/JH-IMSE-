# Enterprise Clean Login System & 2-Factor Authentication (2FA) Architecture

A production-grade, secure authentication system for JH IMSE that eliminates all prefilled dummy credentials and manual store dropdown selectors, provides unified credentials-based tenant and super-admin auto-resolution, and delivers toggleable Google Authenticator (TOTP) two-factor authentication currently defaulted to OFF for initial setup.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed via Phase 1 clarification:
> - **Zero Dummy Data & No Store Dropdown**: The login form starts with pristine empty input fields. The artificial "স্টোর নির্বাচন" (Store Selection) dropdown is eliminated. The system resolves whether the user is Super Admin or a specific Merchant/Tenant automatically from their entered email or mobile number.
> - **Google Authenticator (TOTP) Standard**: Both Super Admin and general merchant accounts utilize industry-standard Google Authenticator TOTP (6-digit rotating time-based codes) along with emergency backup recovery codes.
> - **Initial 2FA State (OFF by default)**: As requested, 2FA is initially turned **OFF** so you can log in immediately using your email and password without being blocked. You can then navigate to the Master Security Vault to set up and toggle 2FA whenever you are ready.
> - **Unified Master Security Vault Control**: The Super Admin settings include independent master toggles for:
>   1. *Super Admin 2FA* (for `jhanik1616@gmail.com` and central console access).
>   2. *General Merchant 2FA Policy* (enforcing or offering TOTP 2FA when logging in from the public browser login button).

---

## 1. Overview & Core Concept

### What It Does
- **Clean SaaS Login**: Users see a clean, authentic authentication dialog with blank, non-prefilled fields (`Email/Phone` and `Password`).
- **Smart Identity Resolution**: 
  - If the user enters the Super Admin master email (`jhanik1616@gmail.com`), the system validates against the master security vault.
  - If the user enters any merchant/tenant's email or phone number, the system automatically matches the registered business account.
- **Two-Factor Authentication (TOTP) Workflow**:
  - When 2FA is **OFF** (current initial default): Immediate seamless login into either Super Admin console or Tenant Dashboard.
  - When 2FA is **ON**: After password validation, users are transitioned to a dedicated 6-digit TOTP verification step. They enter their Google Authenticator code or a one-time emergency backup code to finalize access.
- **Dual Gateway URL Parity**:
  - Direct URL hash `#super-admin` or `#superadmin`: Opens login with administrative priority.
  - Standard Navbar "লগইন" button (`#login` / `#admin`): Accepts both Super Admin credentials and Merchant credentials without friction.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[User clicks 'লগইন' or visits #super-admin]
                 │
                 ▼
     ┌───────────────────────┐
     │  Clean Login Dialog   │
     │  - Email or Mobile    │  (Clean, empty inputs; NO dummy data)
     │  - Secret Password    │  (NO store selector dropdown)
     └───────────┬───────────┘
                 │ (User submits credentials)
                 ▼
     ┌───────────────────────┐
     │ Credential Matcher    │
     └───────────┬───────────┘
                 ├─── If Invalid ──► Display clear error message & increment lockout protection
                 │
                 ▼ (Credentials Valid)
     ┌───────────────────────────────────┐
     │ Check 2FA State (Super/General)   │
     └───────────┬───────────────────────┘
                 ├─── 2FA is OFF (Default) ──────────┐
                 │                                   │
                 ▼ (If 2FA is ON)                    ▼
     ┌───────────────────────────────┐     ┌───────────────────────┐
     │ 6-Digit TOTP Verification     │     │ Direct Authenticated  │
     │ - Google Authenticator Code   │     │ Session:              │
     │ - Emergency Backup Code       │     │ Super Admin Console   │
     │ - 30s auto-expiry guidance    │     │   or                  │
     └───────────┬───────────────────┘     │ Tenant ERP Dashboard  │
                 │ Verified                └───────────────────────┘
                 ▼
     ┌───────────────────────────────┐
     │ Granted Access to Dashboard   │
     └───────────────────────────────┘
```

### Visual Identity & Layout
- **Pristine Form Inputs**: Modern floating label / clean iconography with placeholder examples that guide format (e.g. `name@domain.com` or `017xxxxxxxx`) rather than prefilling fake customer accounts.
- **Zero-Pill Restraint**: Minimalist SaaS aesthetic conforming to WCAG AA, smooth micro-transitions, tabular numbers for OTP/TOTP inputs with monospaced letter spacing (`tracking-[0.3em]`).
- **Master Security Vault UI**:
  - QR Code generator for Google Authenticator pairing.
  - Instant One-Click Toggle for "Super Admin 2FA".
  - Dedicated Toggle for "General Merchant Login 2FA Policy".
  - Printable/Copyable Emergency Backup Recovery Codes.

---

## 3. Key Product Decisions & Trade-Offs

- **Elimination of Store Dropdown**:
  - *Chosen Approach*: Automatic lookup via user email and telephone number.
  - *Why*: In a production B2B SaaS system, asking a user to manually select their company name from a public dropdown reveals other tenant names (a privacy violation) and looks like a demo sandbox.
- **TOTP over SMS OTP for 2FA**:
  - *Chosen Approach*: RFC 6238 Time-based One-Time Password (TOTP) via Google Authenticator.
  - *Why*: Unaffected by telecom downtime, free of per-SMS carrier costs in Bangladesh, zero latency, and immune to SIM-swap attacks.
- **Default State**:
  - *Chosen Approach*: Initially defaulted to `isTotpEnabled: false` and `isGeneralTotpEnabled: false`.
  - *Why*: Allows you to immediately log in right now, explore all screens, and configure your authenticator app at your convenience before turning enforcement ON.

---

## 4. Technical Architecture & Data Strategy

### System Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       AuthModal.tsx                         │
│  - Email/Phone & Password Inputs (Uncontrolled/Empty init)  │
│  - Dynamic 2FA Verification View (Active only if 2FA is ON) │
│  - Forgot Password OTP Drawer                               │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│       masterSecurity.ts      │ │       totpEngine.ts          │
│  - Super Admin Credentials   │ │  - RFC 6238 TOTP Generator   │
│  - isTotpEnabled (Master)    │ │  - HMAC-SHA1 Hash Verifier   │
│  - isGeneralTotpEnabled      │ │  - Base32 Secret Encoding    │
│  - Backup Recovery Codes     │ │  - Emergency Code Reducer    │
│  - Failed Attempt Lockout    │ └──────────────────────────────┘
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ MasterSecurityVaultModal.tsx │
│  - Master Password Reset     │
│  - Authenticator Pairing QR  │
│  - 2FA Master Toggle (On/Off)│
│  - Merchant 2FA Policy Toggle│
└──────────────────────────────┘
```

### State Management & Persistence
1. **`masterSecurity.ts`**:
   - `isTotpEnabled`: Controls Super Admin 2FA enforcement (`boolean`, default: `false`).
   - `isGeneralTotpEnabled`: Controls General Merchant/Tenant login 2FA enforcement (`boolean`, default: `false`).
   - `masterEmail`: Super Admin identifier (`jhanik1616@gmail.com`).
   - `masterPasswordHash`: Super Admin secure credential (`Anik#2026!Master`).
2. **`AuthModal.tsx`**:
   - Removes hardcoded values `rahim.pharmacy@gmail.com`, `123456`, and the `<select>` store picker.
   - Cleans all input states to `''` upon modal open.
   - Unified authentication router: checks whether credentials match Master Admin or a registered Tenant.
   - Evaluates the corresponding 2FA flag before granting session or prompting for TOTP code.
3. **`MasterSecurityVaultModal.tsx`**:
   - Provides intuitive toggles for both Super Admin 2FA and General Merchant 2FA.
   - Includes real-time QR code display and one-click key copying.

---

## 5. Verification Plan

1. **Verify Empty Initial State**: Open login modal and confirm both email and password fields are completely blank without dummy data or store dropdown.
2. **Verify Super Admin Login with 2FA OFF**:
   - Input `jhanik1616@gmail.com` and `Anik#2026!Master`.
   - Confirm immediate entry to the Super Admin platform console.
3. **Verify Merchant Login with 2FA OFF**:
   - Input a tenant's email or phone number.
   - Confirm automatic resolution and navigation into that tenant's dashboard.
4. **Verify 2FA Activation & Enforcement**:
   - In Super Admin -> Master Security Vault, turn 2FA ON.
   - Log out and log back in: confirm the 6-digit TOTP verification screen appears and verifies the authenticator code.
5. **Verify Build & Compilation**: Run `compile_applet` to ensure zero TypeScript or build errors.
