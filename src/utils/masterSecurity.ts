import { generateBase32Secret, generateBackupRecoveryCodes, verifyTOTP } from './totpEngine';

export interface MasterSecurityConfig {
  masterEmail: string;
  masterPasswordHash: string; // Plain/encrypted storage for offline browser persistence
  isTotpEnabled: boolean; // OFF by default as requested (Super Admin 2FA)
  isGeneralTotpEnabled: boolean; // OFF by default as requested (General Merchant / Standard Login 2FA)
  totpSecret: string;
  backupCodes: string[];
  failedAttempts: number;
  lockoutUntil: number | null;
  updatedAt: string;
}

const STORAGE_KEY = 'jh_imse_master_security_vault_v1';

const DEFAULT_CONFIG: MasterSecurityConfig = {
  masterEmail: 'jhanik1616@gmail.com',
  masterPasswordHash: 'Anik#2026!Master', // Initial master password, customizable anytime in Super Admin
  isTotpEnabled: false, // Default is OFF
  isGeneralTotpEnabled: false, // Default is OFF for general user login
  totpSecret: 'JBSWY3DPEHPK3PXP', // 16-character base32 key
  backupCodes: ['JH-8912-3041', 'JH-5521-9923', 'JH-7104-8832', 'JH-3390-1284', 'JH-6045-7719'],
  failedAttempts: 0,
  lockoutUntil: null,
  updatedAt: new Date().toISOString(),
};

export function getMasterSecurityConfig(): MasterSecurityConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CONFIG));
      return DEFAULT_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveMasterSecurityConfig(config: MasterSecurityConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...config,
      updatedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to save master security config:', err);
  }
}

export function updateMasterCredentials(newEmail?: string, newPassword?: string): MasterSecurityConfig {
  const current = getMasterSecurityConfig();
  if (newEmail && newEmail.trim()) {
    current.masterEmail = newEmail.trim().toLowerCase();
  }
  if (newPassword && newPassword.trim()) {
    current.masterPasswordHash = newPassword.trim();
  }
  saveMasterSecurityConfig(current);
  return current;
}

export function setupNewTotpCredentials(): { secret: string; backupCodes: string[] } {
  const secret = generateBase32Secret(16);
  const backupCodes = generateBackupRecoveryCodes(5);
  return { secret, backupCodes };
}

export function enableMasterTotp(secret: string, backupCodes: string[]): MasterSecurityConfig {
  const current = getMasterSecurityConfig();
  current.isTotpEnabled = true;
  current.totpSecret = secret;
  current.backupCodes = backupCodes;
  saveMasterSecurityConfig(current);
  return current;
}

export function disableMasterTotp(): MasterSecurityConfig {
  const current = getMasterSecurityConfig();
  current.isTotpEnabled = false;
  saveMasterSecurityConfig(current);
  return current;
}

export function setGeneralTotpEnabled(enabled: boolean): MasterSecurityConfig {
  const current = getMasterSecurityConfig();
  current.isGeneralTotpEnabled = enabled;
  saveMasterSecurityConfig(current);
  return current;
}

/**
 * Check if the master account is currently locked due to too many failed attempts
 */
export function checkMasterLockout(): { isLocked: boolean; remainingSeconds: number } {
  const config = getMasterSecurityConfig();
  if (!config.lockoutUntil) return { isLocked: false, remainingSeconds: 0 };
  const now = Date.now();
  if (now < config.lockoutUntil) {
    return {
      isLocked: true,
      remainingSeconds: Math.ceil((config.lockoutUntil - now) / 1000),
    };
  }
  // Reset lockout
  config.lockoutUntil = null;
  config.failedAttempts = 0;
  saveMasterSecurityConfig(config);
  return { isLocked: false, remainingSeconds: 0 };
}

export function recordMasterLoginAttempt(success: boolean): void {
  const config = getMasterSecurityConfig();
  if (success) {
    config.failedAttempts = 0;
    config.lockoutUntil = null;
    saveMasterSecurityConfig(config);
    return;
  }

  config.failedAttempts = (config.failedAttempts || 0) + 1;
  // If 5 failed attempts, lock for 2 minutes
  if (config.failedAttempts >= 5) {
    config.lockoutUntil = Date.now() + 2 * 60 * 1000;
  }
  saveMasterSecurityConfig(config);
}

/**
 * Verify 2FA code (checks 6-digit TOTP first, then emergency backup recovery codes)
 */
export async function verifyMaster2FACode(code: string): Promise<{ success: boolean; usedBackupCode?: boolean }> {
  const config = getMasterSecurityConfig();
  const cleanCode = code.trim().toUpperCase();

  // If 2FA is off, always true
  if (!config.isTotpEnabled) {
    return { success: true };
  }

  // 1. Check TOTP token
  const isTotpValid = await verifyTOTP(cleanCode, config.totpSecret);
  if (isTotpValid) {
    recordMasterLoginAttempt(true);
    return { success: true, usedBackupCode: false };
  }

  // 2. Check Emergency Backup Codes
  const foundIndex = config.backupCodes.findIndex(c => c.toUpperCase() === cleanCode);
  if (foundIndex !== -1) {
    // Consume this one-time emergency code
    config.backupCodes.splice(foundIndex, 1);
    saveMasterSecurityConfig(config);
    recordMasterLoginAttempt(true);
    return { success: true, usedBackupCode: true };
  }

  // Failed
  recordMasterLoginAttempt(false);
  return { success: false };
}
