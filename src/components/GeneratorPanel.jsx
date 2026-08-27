import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ChevronDown, Check, Copy } from 'lucide-react';
import { generatePassword } from '../api';

/**
 * Password generator panel with length slider, character-set toggles,
 * exclude-ambiguous toggle, generate button, and copy-to-clipboard.
 */
export default function GeneratorPanel() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const result = await generatePassword({
        length,
        useUppercase,
        useLowercase,
        useDigits,
        useSymbols,
        excludeAmbiguous,
      });
      setGenerated(result);
    } catch (err) {
      console.error('Generate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for insecure contexts
      const ta = document.createElement('textarea');
      ta.value = generated.password;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOptions = [
    { label: 'Uppercase (A–Z)', value: useUppercase, setter: setUseUppercase, id: 'toggle-uppercase' },
    { label: 'Lowercase (a–z)', value: useLowercase, setter: setUseLowercase, id: 'toggle-lowercase' },
    { label: 'Numbers (0–9)', value: useDigits, setter: setUseDigits, id: 'toggle-digits' },
    { label: 'Symbols (!@#$)', value: useSymbols, setter: setUseSymbols, id: 'toggle-symbols' },
    { label: 'Exclude ambiguous', value: excludeAmbiguous, setter: setExcludeAmbiguous, id: 'toggle-ambiguous' },
  ];

  return (
    <div id="generator-panel" className="tw:px-5 tw:py-4">
      {/* Header / toggle */}
      <button
        id="generator-toggle-btn"
        type="button"
        className="tw:w-full tw:flex tw:items-center tw:justify-between tw:cursor-pointer tw:bg-transparent tw:border-none tw:text-left tw:rounded-lg tw:focus:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-[var(--color-signal-glow)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="tw:flex tw:items-center tw:gap-2">
          <KeyRound size={16} strokeWidth={2.5} style={{ color: 'var(--phosphor)' }} />
          <h2 className="tw:text-sm font-display tw:font-semibold tw:tracking-widest tw:uppercase" style={{ color: 'var(--text-primary)' }}>
            Password Generator
          </h2>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="tw:overflow-hidden"
          >
            <div className="tw:pt-5 tw:space-y-5">
              {/* Length slider */}
              <div>
                <div className="tw:flex tw:justify-between tw:items-center tw:mb-2">
                  <label
                    htmlFor="length-slider"
                    className="tw:text-sm font-body tw:font-medium"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Length
                  </label>
                  <span
                    className="tw:text-sm font-data tw:font-bold tw:tabular-nums tw:px-2 tw:py-0.5 tw:rounded"
                    style={{
                      color: 'var(--phosphor)',
                      backgroundColor: 'rgba(57, 255, 136, 0.1)',
                    }}
                  >
                    {length}
                  </span>
                </div>
                <input
                  id="length-slider"
                  type="range"
                  min="4"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="slider-track"
                />
              </div>

              {/* Character toggles */}
              <div className="tw:space-y-3">
                {toggleOptions.map(({ label, value, setter, id }) => (
                  <div key={id} className="tw:flex tw:items-center tw:justify-between">
                    <span
                      className="tw:text-sm font-body"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {label}
                    </span>
                    <label className="toggle-switch" htmlFor={id}>
                      <input
                        id={id}
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setter(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>

              {/* Generate button */}
              <motion.button
                id="generate-btn"
                type="button"
                className="generator-action tw:w-full tw:py-3 tw:rounded-md tw:font-body tw:font-semibold tw:text-sm tw:transition-colors tw:focus:outline-none"
                style={{ 
                  backgroundColor: 'transparent',
                  color: 'var(--phosphor)',
                  border: '1px solid rgba(57, 255, 136, 0.3)'
                }}
                onClick={handleGenerate}
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                whileHover={{ backgroundColor: 'rgba(57, 255, 136, 0.12)' }}
              >
                {loading ? 'Generating...' : 'Generate New Password'}
              </motion.button>

              {/* Generated result */}
              <AnimatePresence>
                {generated && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="generator-result tw:space-y-3 tw:pt-2"
                  >
                    <div 
                      className="generator-output font-data tw:text-base tw:tracking-wider tw:p-4 tw:rounded-md tw:break-all"
                      style={{ 
                        background: 'rgba(5, 7, 10, 0.8)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(57, 255, 136, 0.18)'
                      }}
                    >
                      {generated.password}
                    </div>

                    <div className="tw:flex tw:items-center tw:justify-between">
                      <div className="tw:text-xs font-body" style={{ color: 'var(--text-muted)' }}>
                        {generated.analysis && (
                          <span>
                            Score: <strong style={{ color: 'var(--text-primary)' }}>{generated.analysis.score}/100</strong>
                            {' · '}
                            {generated.analysis.entropy_bits} bits
                          </span>
                        )}
                      </div>
                      
                      <motion.button
                        id="copy-btn"
                        type="button"
                        className="generator-copy tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:rounded-md tw:text-sm font-body tw:font-medium tw:transition-colors tw:focus:outline-none"
                        style={{
                          backgroundColor: copied ? 'rgba(57, 255, 136, 0.12)' : 'transparent',
                          color: copied ? 'var(--phosphor)' : 'var(--phosphor)',
                          border: `1px solid ${copied ? 'var(--phosphor)' : 'rgba(57, 255, 136, 0.24)'}`
                        }}
                        onClick={handleCopy}
                        whileTap={{ scale: 0.95 }}
                      >
                        {copied ? (
                          <>
                            <Check size={14} strokeWidth={3} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            Copy
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
