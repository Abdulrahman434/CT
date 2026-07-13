const ACCOUNT_KEY = 'careinn-account';

export interface AccountData {
  pinHash: string;
  pinSalt: string;
  nfcCardUid: string | null;
  setAt: number;
}

/** Generate random salt (16 hex chars) */
function generateSalt(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => 
    b.toString(16).padStart(2, '0')).join('');
}

/** Hash PIN with salt using SubtleCrypto SHA-256 */
async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(salt + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export function isAccountSet(): boolean {
  return localStorage.getItem(ACCOUNT_KEY) !== null;
}

export function getAccount(): AccountData | null {
  try {
    const raw = localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

export async function setAccount(
  pin: string,
  nfcCardUid: string | null
): Promise<void> {
  const salt = generateSalt();
  const pinHash = await hashPin(pin, salt);
  const data: AccountData = { 
    pinHash, pinSalt: salt, nfcCardUid, setAt: Date.now() 
  };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(data));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const acc = getAccount();
  if (!acc) return false;
  const hash = await hashPin(pin, acc.pinSalt);
  return hash === acc.pinHash;
}

export function verifyNfcUid(uid: string): boolean {
  const acc = getAccount();
  if (!acc || !acc.nfcCardUid) return false;
  return acc.nfcCardUid.toUpperCase() === uid.toUpperCase();
}

export function clearAccount(): void {
  localStorage.removeItem(ACCOUNT_KEY);
  // Notify locked components to dismiss
  window.dispatchEvent(new CustomEvent('account-cleared'));
}

export async function updateNfcCard(uid: string | null): Promise<void> {
  const acc = getAccount();
  if (!acc) return;
  const updated = { ...acc, nfcCardUid: uid };
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(updated));
}
