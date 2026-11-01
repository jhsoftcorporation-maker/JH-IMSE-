// RFC 6238 Time-Based One-Time Password (TOTP) Engine
// Compatible with Google Authenticator, Microsoft Authenticator, Authy, etc.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a Base32 string into a Uint8Array
 */
export function base32Decode(base32Str: string): Uint8Array {
  const cleanStr = base32Str.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < cleanStr.length; i++) {
    const char = cleanStr[i];
    const val = BASE32_ALPHABET.indexOf(char);
    if (val === -1) {
      continue;
    }
    value = (value << 5) | val;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Generate a random Base32 secret key (16 characters, 80-bit standard)
 */
export function generateBase32Secret(length = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE32_ALPHABET[array[i] % BASE32_ALPHABET.length];
  }
  return result;
}

/**
 * Generate a TOTP code for a specific counter step using Web Crypto HMAC-SHA1
 */
async function generateHOTP(secretBytes: Uint8Array, counter: number): Promise<string> {
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  // Big-endian 64-bit integer
  counterView.setUint32(0, 0, false);
  counterView.setUint32(4, counter, false);

  const keyBuffer = secretBytes.buffer.slice(
    secretBytes.byteOffset,
    secretBytes.byteOffset + secretBytes.byteLength
  ) as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer);
  const hashBytes = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hashBytes[hashBytes.length - 1] & 0x0f;
  const binary =
    ((hashBytes[offset] & 0x7f) << 24) |
    ((hashBytes[offset + 1] & 0xff) << 16) |
    ((hashBytes[offset + 2] & 0xff) << 8) |
    (hashBytes[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

/**
 * Generate the current TOTP 6-digit code for a Base32 secret
 */
export async function generateTOTP(secretBase32: string, timeStepSeconds = 30): Promise<string> {
  const secretBytes = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStepSeconds);
  return generateHOTP(secretBytes, counter);
}

/**
 * Verify a 6-digit code with window tolerance (allows current, previous, and next 30s block)
 */
export async function verifyTOTP(
  token: string,
  secretBase32: string,
  timeStepSeconds = 30,
  windowTolerance = 1
): Promise<boolean> {
  const cleanToken = token.trim().replace(/\s+/g, '');
  if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
    return false;
  }

  const secretBytes = base32Decode(secretBase32);
  const epoch = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(epoch / timeStepSeconds);

  for (let offset = -windowTolerance; offset <= windowTolerance; offset++) {
    const expected = await generateHOTP(secretBytes, currentCounter + offset);
    if (expected === cleanToken) {
      return true;
    }
  }

  return false;
}

/**
 * Build standard otpauth:// URL for QR code generation
 */
export function buildOtpAuthUrl(issuer: string, accountName: string, secretBase32: string): string {
  const encIssuer = encodeURIComponent(issuer.trim());
  const encAccount = encodeURIComponent(accountName.trim());
  return `otpauth://totp/${encIssuer}:${encAccount}?secret=${secretBase32}&issuer=${encIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Generate 5 Emergency Backup Recovery Codes (e.g., JH-8492-3104)
 */
export function generateBackupRecoveryCodes(count = 5): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const part1 = Math.floor(1000 + Math.random() * 9000);
    const part2 = Math.floor(1000 + Math.random() * 9000);
    codes.push(`JH-${part1}-${part2}`);
  }
  return codes;
}
