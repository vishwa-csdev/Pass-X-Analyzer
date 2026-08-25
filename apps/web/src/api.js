const API_BASE = 'http://localhost:8000';

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
