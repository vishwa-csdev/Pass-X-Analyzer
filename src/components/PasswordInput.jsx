import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Live Entropy Waveform
 * Renders a thin horizontal strip that animates based on entropy.
 */
function EntropyWaveform({ entropyBits }) {
  const prefersReducedMotion = useReducedMotion();
  const [points, setPoints] = useState('');

  useEffect(() => {
    if (prefersReducedMotion) {
      // Just a flat line if reduced motion
      setPoints('0,10 100,10');
      return;
    }

    if (entropyBits === 0) {
      setPoints('0,10 100,10');
      return;
    }

    // Generate a jagged line based on entropy
    // Higher entropy = more points, higher amplitude
    const numPoints = Math.min(Math.max(Math.floor(entropyBits / 2), 5), 40);
    const amplitude = Math.min(entropyBits / 10, 8); // Max 8px up/down from center (10)
    
    let newPoints = '0,10 ';
    const step = 100 / numPoints;
    
    for (let i = 1; i < numPoints; i++) {
      const x = i * step;
      // Random value between -amplitude and +amplitude
      const yOffset = (Math.random() * 2 - 1) * amplitude;
      const y = 10 + yOffset;
      newPoints += `${x.toFixed(1)},${y.toFixed(1)} `;
    }
    newPoints += '100,10';
    
    setPoints(newPoints);
  }, [entropyBits, prefersReducedMotion]);

  // Determine color based on entropy loosely matching the strength tiers
  let strokeColor = 'var(--color-vault-line)';
  if (entropyBits > 0) strokeColor = 'var(--color-breach)';
  if (entropyBits >= 40) strokeColor = 'var(--color-caution)';
  if (entropyBits >= 70) strokeColor = 'var(--color-verified)';

  return (
    <div className="tw:h-[20px] tw:w-full tw:-mt-2 tw:mb-1 tw:opacity-60 tw:overflow-hidden">
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="tw:w-full tw:h-full">
        <motion.polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ points, stroke: strokeColor }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        />
      </svg>
    </div>
  );
}

/**
 * Password input with show/hide toggle and entropy waveform.
 */
export default function PasswordInput({ value, onChange, entropyBits }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="tw:flex tw:flex-col tw:gap-1">
      <div className="password-input-wrapper">
        <motion.input
          id="password-input"
          type={visible ? 'text' : 'password'}
          className="password-input font-data"
          placeholder="Enter your password..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        />
        <button
          id="toggle-visibility-btn"
          type="button"
          className="icon-btn tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2"
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
                <EyeOff size={18} strokeWidth={2} />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
              >
                <Eye size={18} strokeWidth={2} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
      
      {/* Signature Element: Live Entropy Waveform */}
      <EntropyWaveform entropyBits={entropyBits} />
    </div>
  );
}
