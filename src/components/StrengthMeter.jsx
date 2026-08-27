import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animated strength meter bar that fills and shifts color.
 */
export default function StrengthMeter({ score, category, active }) {
  const prefersReducedMotion = useReducedMotion();
  const litBlocks = active ? Math.ceil(Math.min(Math.max(score, 0), 100) / 10) : 0;
  
  // Map categories to the new design tokens
  const colorMap = {
    Weak: { bar: 'var(--color-breach)', bg: 'var(--color-breach-bg)' },
    Medium: { bar: 'var(--color-caution)', bg: 'var(--color-caution-bg)' },
    Strong: { bar: 'var(--color-verified)', bg: 'var(--color-verified-bg)' },
  };

  const currentColors = active ? (colorMap[category] || colorMap.Weak) : { bar: 'var(--color-vault-line)', bg: 'transparent' };
  const displayCategory = active ? category.toUpperCase() : 'AWAITING SIGNAL';
  const displayScore = active ? score : '0';

  return (
    <div id="strength-meter" className="tw:space-y-4 transmission-meter">
      {/* Score and Category - Hero Moment */}
      <div className="tw:flex tw:items-baseline tw:justify-between">
        <div className="tw:flex tw:items-baseline tw:gap-2">
          <motion.span
            className="tw:text-5xl font-display tw:font-bold tw:tabular-nums"
            animate={{ color: currentColors.bar }}
            transition={{ duration: 0.3 }}
          >
            {displayScore}
          </motion.span>
          <span className="tw:text-base font-body tw:font-medium" style={{ color: 'var(--text-muted)' }}>
            / 100
          </span>
        </div>

        <motion.span
          className="tw:text-2xl font-display tw:font-bold tw:tracking-widest"
          animate={{ color: currentColors.bar }}
          transition={{ duration: 0.3 }}
        >
          {displayCategory}
        </motion.span>
      </div>

      <div className="transmission-label">TRANSMISSION INTEGRITY</div>
      <div className="signal-blocks" aria-label={`${litBlocks} of 10 signal blocks active`}>
        {Array.from({ length: 10 }, (_, index) => (
          <motion.i key={index} className={index < litBlocks ? 'is-lit' : ''} animate={{ backgroundColor: index < litBlocks ? currentColors.bar : 'var(--color-vault-line)' }} transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.12, delay: index * 0.03 }} />
        ))}
      </div>
    </div>
  );
}
