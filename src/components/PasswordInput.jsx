import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Live Entropy Waveform - Seven Segment Style
 * Renders entropy as a seven-segment style display
 */
function EntropyWaveform({ entropyBits }) {
  // Format entropy for display (0-3 digits)
  const displayValue = Math.floor(entropyBits).toString().padStart(3, '0');

  return (
    <motion.div
      className="tw:flex tw:items-center tw:justify-center tw:mt-2"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <span className="font-display-pixel" style={{ color: 'var(--text-dim)' }}>
        SIGNAL ENTROPY:
      </span>
      <span className="seven-seg-display"
            style={{
              color: entropyBits >= 70 ? 'var(--text-phosphor)' :
                     entropyBits >= 40 ? 'var(--text-amber)' :
                     'var(--text-dim)'
            }}>
        {displayValue}
      </span>
      <span className="font-display-pixel" style={{ color: 'var(--text-dim)' }}>
        BITS
      </span>
    </motion.div>
  );
}

/**
 * Password input with terminal prompt styling and show/hide toggle.
 */
export default function PasswordInput({ value, onChange, entropyBits }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {/* Terminal Prompt */}
      <div className="terminal-prompt">
        <span className="terminal-label">PASSWORD</span>
        <span className="terminal-label">></span>
        <motion.div
          className="terminal-cursor"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        <motion.input
          id="password-input"
          type={visible ? 'text' : 'password'}
          className="password-input font-body-mono"
          placeholder="Enter your password..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          className="tw:border-none tw:bg-transparent tw:text-[var(--color-phosphor)] tw:focus:tw:outline-none tw:focus-visible:tw:ring-0"
          style={{
            textShadow: '0 0 4px var(--color-phosphor)',
            letterSpacing: '0.05em'
          }}
        />
      </motion.div>

      {/* Show/Hide Toggle */}
      <div className="tw:flex tw:justify-end">
        <button
          id="toggle-visibility-btn"
          type="button"
          className="icon-btn"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {visible ? (
              <motion.div
                key="eye-off"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <EyeOff size={18} strokeWidth={2} style={{ color: 'var(--text-dim)' }} />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Eye size={18} strokeWidth={2} style={{ color: 'var(--text-dim)' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Entropy Display */}
      <EntropyWaveform entropyBits={entropyBits} />
    </div>
  );
}
