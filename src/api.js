// Use the same relative API path in development and production. Vite proxies
// /api requests locally to FastAPI, while Vercel routes them to api/index.py.
const API_BASE = '/api';

/**
 * Analyze a password via the FastAPI backend.
 * @param {string} password
 * @returns {Promise<Object>} AnalysisResult
 */
export async function analyzePassword(password) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Generate a password via the FastAPI backend.
 * @param {Object} options
 * @returns {Promise<Object>} GeneratedPassword with analysis
 */
export async function generatePassword(options = {}) {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      length: options.length ?? 16,
      use_uppercase: options.useUppercase ?? true,
      use_lowercase: options.useLowercase ?? true,
      use_digits: options.useDigits ?? true,
      use_symbols: options.useSymbols ?? true,
      exclude_ambiguous: options.excludeAmbiguous ?? false,
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Check HIBP directly from the browser using k-anonymity.
 * Only the first five SHA-1 characters leave the device. The remaining
 * hash suffix is compared locally against HIBP's response.
 */
export async function breachCheckPassword(password) {
  if (!password) {
    return { found: false, matches: 0, count: 0, status: 'no_signal' };
  }

  const digestBuffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
  const digest = Array.from(new Uint8Array(digestBuffer), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const prefix = digest.slice(0, 5);
  const suffix = digest.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });

  if (!res.ok) throw new Error(`HIBP API error: ${res.status}`);

  const match = (await res.text()).split('\n').find((line) => line.split(':', 1)[0].trim() === suffix);
  const matches = match ? Number.parseInt(match.split(':', 2)[1].trim(), 10) || 0 : 0;

  return {
    found: matches > 0,
    matches,
    count: matches,
    status: matches > 0 ? 'breach_detected' : 'no_signal',
    message: matches > 0
      ? `Found in ${matches} known compromised datasets.`
      : 'No signal detected in known breach data.',
  };
}
