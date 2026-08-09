// "App Lock" — gates the app behind the phone's own screen-lock (Face ID,
// fingerprint, or device PIN) using the browser's WebAuthn platform authenticator.
// This is intentionally device-local: the credential lives in the phone's secure
// hardware, not our servers, so unlocking never depends on a network call.

const enabledKey = (userId: string) => `afrifinance_app_lock_${userId}`;
const credentialKey = (userId: string) => `afrifinance_app_lock_cred_${userId}`;

function toBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(b64url.length / 4) * 4, '=');
  const str = atob(b64);
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
}

export function isAppLockSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential && !!navigator.credentials;
}

export function isAppLockEnabled(userId: string): boolean {
  try {
    return localStorage.getItem(enabledKey(userId)) === '1' && !!localStorage.getItem(credentialKey(userId));
  } catch {
    return false;
  }
}

/** Prompts the device's biometric/PIN sheet to register a local unlock credential. */
export async function enableAppLock(userId: string, displayName: string): Promise<{ success: boolean; error?: string }> {
  if (!isAppLockSupported()) return { success: false, error: 'Your device or browser doesn\'t support this.' };
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userIdBytes = new TextEncoder().encode(userId).slice(0, 64);
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'AfriFinance', id: window.location.hostname },
        user: { id: userIdBytes, name: displayName || 'AfriFinance user', displayName: displayName || 'AfriFinance user' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        attestation: 'none',
        timeout: 60000,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return { success: false, error: 'Setup was cancelled.' };

    localStorage.setItem(credentialKey(userId), toBase64Url(credential.rawId));
    localStorage.setItem(enabledKey(userId), '1');
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Couldn\'t set up device lock.' };
  }
}

export function disableAppLock(userId: string) {
  try {
    localStorage.removeItem(enabledKey(userId));
    localStorage.removeItem(credentialKey(userId));
  } catch { /* no-op */ }
}

/** Prompts the device's biometric/PIN sheet to unlock. Resolves false on failure or cancel. */
export async function verifyAppLock(userId: string): Promise<boolean> {
  if (!isAppLockSupported()) return true; // nothing to verify against — don't lock the user out
  const credId = localStorage.getItem(credentialKey(userId));
  if (!credId) return true;
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: fromBase64Url(credId) as BufferSource, type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return !!assertion;
  } catch {
    return false;
  }
}