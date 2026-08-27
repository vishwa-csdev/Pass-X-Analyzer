import { motion, useReducedMotion } from 'framer-motion';

/**
 * Animated strength meter bar that fills and shifts color.
 */
export default function StrengthMeter({ score, category, active }) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = active ? Math.min(Math.max(score, 0), 100) : 0;
  
  // Map categories to the new design tokens
  const colorMap = {
    Weak: { bar: 'var(--color-breach)', bg: 'var(--color-breach-bg)' },
    Medium: { bar: 'var(--color-caution)', bg: 'var(--color-caution-bg)' },
    Strong: { bar: 'var(--color-verified)', bg: 'var(--color-verified-bg)' },
  };

  const currentColors = active ? (colorMap[category] || colorMap.Weak) : { bar: 'var(--color-vault-line)', bg: 'transparent' };
  const displayCategory = active ? category.toUpperCase() : '---';
  const displayScore = active ? score : '0';

  return (
    <div id="strength-meter" className="tw:space-y-4">
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

      {/* Progress bar */}
      <div className="tw:h-[6px] tw:w-full tw:rounded-full tw:bg-[var(--color-vault-line)] tw:overflow-hidden">
        <motion.div
          className="tw:h-full tw:rounded-full"
          animate={{ 
            width: `${percentage}%`,
            backgroundColor: currentColors.bar 
          }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 100, damping: 15 }}
        />
      </div>
    </div>
  );
}
