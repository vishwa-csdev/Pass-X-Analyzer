const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:8000';

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

export async function checkPasswordBreach(password) {
  const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(password));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { 'Add-Padding': 'true' },
  });
  if (!res.ok) throw new Error(`Breach API error: ${res.status}`);
  const match = (await res.text()).split('\n').find((line) => line.startsWith(suffix));
  return { found: Boolean(match), count: match ? Number(match.split(':')[1]) : 0 };
}
