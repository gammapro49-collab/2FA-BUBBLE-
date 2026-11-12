import { TotpAccount } from '../types';

/**
 * Backup encryption & decryption using AES-GCM 256-bit with PBKDF2 key derivation.
 */

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function exportEncryptedBackup(accounts: TotpAccount[], password: string): Promise<string> {
  const enc = new TextEncoder();
  const payload = JSON.stringify({
    version: 1,
    app: 'Floating2FA',
    exportedAt: new Date().toISOString(),
    accounts,
  });

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(payload)
  );

  const bundle = {
    salt: Array.from(salt),
    iv: Array.from(iv),
    ciphertext: Array.from(new Uint8Array(encryptedData)),
  };

  return JSON.stringify(bundle, null, 2);
}

export async function importEncryptedBackup(jsonString: string, password: string): Promise<TotpAccount[]> {
  try {
    const bundle = JSON.parse(jsonString);
    if (!bundle.salt || !bundle.iv || !bundle.ciphertext) {
      throw new Error('Invalid backup format');
    }

    const salt = new Uint8Array(bundle.salt);
    const iv = new Uint8Array(bundle.iv);
    const ciphertext = new Uint8Array(bundle.ciphertext);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    const parsed = JSON.parse(dec.decode(decrypted));
    if (parsed && Array.isArray(parsed.accounts)) {
      return parsed.accounts;
    }
    throw new Error('Invalid account list in backup');
  } catch {
    throw new Error('Decryption failed: incorrect password or corrupted file.');
  }
}
