/**
 * RFC 6238 TOTP (Time-Based One-Time Password) implementation in TypeScript
 * with synchronous HMAC-SHA1, Base32 decoding, and otpauth:// URI parser.
 */

// Pure JavaScript SHA-1 implementation for synchronous instant OTP calculations
function sha1(bytes: Uint8Array): Uint8Array {
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const msgLen = bytes.length;
  const bitLen = msgLen * 8;
  const newLen = ((msgLen + 8) >> 6) + 1 << 6;
  const padded = new Uint8Array(newLen);
  padded.set(bytes);
  padded[msgLen] = 0x80;

  // Append length in bits as 64-bit big-endian integer
  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen & 0xffffffff, false);
  view.setUint32(newLen - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Uint32Array(80);

  for (let i = 0; i < newLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 80; t++) {
      const v = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (v << 1) | (v >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f = 0;
      let k = 0;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) | 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  const result = new Uint8Array(20);
  const outView = new DataView(result.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  return result;
}

function hmacSha1(key: Uint8Array, message: Uint8Array): Uint8Array {
  const blockSize = 64;
  let formattedKey: Uint8Array;

  if (key.length > blockSize) {
    formattedKey = new Uint8Array(blockSize);
    formattedKey.set(sha1(key));
  } else {
    formattedKey = new Uint8Array(blockSize);
    formattedKey.set(key);
  }

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = formattedKey[i] ^ 0x5c;
    iKeyPad[i] = formattedKey[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(iKeyPad.length + message.length);
  innerMsg.set(iKeyPad);
  innerMsg.set(message, iKeyPad.length);
  const innerHash = sha1(innerMsg);

  const outerMsg = new Uint8Array(oKeyPad.length + innerHash.length);
  outerMsg.set(oKeyPad);
  outerMsg.set(innerHash, oKeyPad.length);
  return sha1(outerMsg);
}

// RFC 4648 Base32 Decoding
export function base32Decode(str: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = str.toUpperCase().replace(/[\s=-]/g, '');
  let bits = 0;
  let value = 0;
  const output: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue; // Skip invalid characters gracefully
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

// RFC 6238 / RFC 4226 Generator
export function generateTotp(secretBase32: string, timestamp: number = Date.now(), period: number = 30, digits: number = 6): string {
  try {
    const key = base32Decode(secretBase32);
    if (key.length === 0) return '000000';

    const epochSeconds = Math.floor(timestamp / 1000);
    const counter = Math.floor(epochSeconds / period);

    const counterBytes = new Uint8Array(8);
    let temp = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }

    const hmac = hmacSha1(key, counterBytes);
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = (binary % Math.pow(10, digits)).toString().padStart(digits, '0');
    return otp;
  } catch {
    return '000000';
  }
}

// Calculate remaining seconds and ratio
export function getRemainingTime(timestamp: number = Date.now(), period: number = 30) {
  const epochSeconds = Math.floor(timestamp / 1000);
  const elapsed = epochSeconds % period;
  const remaining = period - elapsed;
  const progress = remaining / period; // 1.0 down to 0.0
  const isUrgent = remaining <= 5;
  return { remaining, progress, isUrgent };
}

export function formatOtpCode(code: string): string {
  if (code.length === 6) {
    return `${code.slice(0, 3)} ${code.slice(3)}`;
  }
  if (code.length === 8) {
    return `${code.slice(0, 4)} ${code.slice(4)}`;
  }
  return code;
}

// Parse otpauth://totp/ URI
export interface ParsedOtpAuth {
  issuer: string;
  accountName: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
}

export function parseOtpAuthUri(uri: string): ParsedOtpAuth | null {
  try {
    const trimmed = uri.trim();
    if (!trimmed.toLowerCase().startsWith('otpauth://')) {
      // Maybe user entered raw secret
      const cleanSecret = trimmed.replace(/[\s-]/g, '').toUpperCase();
      if (/^[A-Z2-7]{8,}$/.test(cleanSecret)) {
        return {
          issuer: 'Custom Account',
          accountName: 'user@example.com',
          secret: cleanSecret,
          digits: 6,
          period: 30,
          algorithm: 'SHA1',
        };
      }
      return null;
    }

    const url = new URL(trimmed);
    if (url.protocol !== 'otpauth:' || url.host.toLowerCase() !== 'totp') {
      return null;
    }

    const path = decodeURIComponent(url.pathname.replace(/^\//, ''));
    let issuer = url.searchParams.get('issuer') || '';
    let accountName = path;

    if (path.includes(':')) {
      const parts = path.split(':');
      if (!issuer) issuer = parts[0].trim();
      accountName = parts.slice(1).join(':').trim();
    }

    const secret = url.searchParams.get('secret') || '';
    const digits = parseInt(url.searchParams.get('digits') || '6', 10);
    const period = parseInt(url.searchParams.get('period') || '30', 10);
    const algorithm = (url.searchParams.get('algorithm') || 'SHA1').toUpperCase() as 'SHA1' | 'SHA256' | 'SHA512';

    if (!secret) return null;

    return {
      issuer: issuer || 'Authenticator',
      accountName: accountName || 'Unknown',
      secret: secret.replace(/\s+/g, '').toUpperCase(),
      digits: digits === 8 ? 8 : 6,
      period: period > 0 ? period : 30,
      algorithm: ['SHA1', 'SHA256', 'SHA512'].includes(algorithm) ? algorithm : 'SHA1',
    };
  } catch {
    return null;
  }
}
