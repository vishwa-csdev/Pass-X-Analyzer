import { motion, useReducedMotion } from 'framer-motion';

/**
 * Transmission Integrity Signal Meter - 10 discrete blocks lighting up left to right
 */
export default function StrengthMeter({ score, category, active }) {
  const prefersReducedMotion = useReducedMotion();
  const percentage = active ? Math.min(Math.max(score, 0), 100) : 0;

  // Calculate how many segments should be lit (0-10)
  const litSegments = Math.min(Math.max(Math.round((percentage / 100) * 10), 0), 10);

  // Determine category color for label
  const categoryColors = {
    Weak: 'var(--text-red)',
    Medium: 'var(--text-amber)',
    Strong: 'var(--text-phosphor)',
  };

  const categoryLabelColors = {
    Weak: 'var(--text-red)',
    Medium: 'var(--text-amber)',
    Strong: 'var(--text-phosphor)',
  };

  const displayCategory = active ? category.toUpperCase() : '---';
  const categoryColor = active ? (categoryColors[category] || categoryColors.Weak) : 'var(--text-dim)';

  return (
    <div className="tw:space-y-4">
      {/* Transmission Integrity Label */}
      <div className="signal-label">
        TRANSMISSION INTEGRITY:
        <span className="font-display-pixel" style={{ color: categoryLabelColors[category] || categoryLabelColors.Weak }}>
          {displayCategory}
        </span>
      </div>

      {/* Signal Meter - 10 discrete blocks */}
      <div className="signal-meter">
        {Array.from({ length: 10 }).map((_, index) => (
          <motion.div
            key={index}
            className="signal-meter-segment"
            animate={{
              backgroundColor: index < litSegments
                ? (index < 5 ? 'var(--text-dim)' : index < 8 ? 'var(--text-amber)' : 'var(--text-red)')
                : 'var(--text-dim)'
            }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="signal-meter-segment-inner" />
          </motion.div>
        ))}
      </div>

      {/* Numeric Score Display - Seven Segment Style */}
      <div className="tw:flex tw:items-center tw:justify-between tw:mt-2">
        <div className="tw:flex tw:items-center tw:gap-2">
          <span className="font-display-pixel" style={{ color: 'var(--text-dim)' }}>
            SCORE:
          </span>
          <span className="seven-seg-display" style={{ color: categoryColors[category] || categoryColors.Weak }}>
            {displayScore.toString().padStart(3, '0')}
          </span>
        </div>

        <div className="tw:text-xs font-body tw:text-right" style={{ color: 'var(--text-dim)' }}>
          <span className="font-display-pixel">/ 100</span>
        </div>
      </div>
    </div>
  );
}
