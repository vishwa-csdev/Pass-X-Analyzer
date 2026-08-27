import { motion } from 'framer-motion';

/**
 * Animated checklist showing ✓/✗ for each password check.
 * Checks animate in, and the checkmark is drawn with a stroke animation.
 * Failed checks remain visible but muted.
 */
export default function Checklist({ checks }) {
  if (!checks || checks.length === 0) return null;

  return (
    <div id="checklist-panel">
      <h2 className="tw:text-xs font-display tw:font-semibold tw:tracking-widest tw:uppercase tw:mb-4" style={{ color: 'var(--text-muted)' }}>
        Analyzer Boot Log
      </h2>
      <div className="tw:space-y-3">
        {checks.map((check, index) => (
          <motion.div
            key={check.name}
            className={`tw:flex tw:items-start tw:gap-3 check-item ${!check.passed ? 'muted' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
            layout
          >
            {/* Icon container */}
            <div className="tw:mt-[2px] check-icon tw:w-5 tw:h-5 tw:flex tw:items-center tw:justify-center">
              {check.passed ? (
                <motion.svg 
                  width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="var(--color-verified)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                >
                  <motion.path 
                    d="M20 6L9 17l-5-5"
                    className="check-path"
                    initial={{ strokeDashoffset: 24 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ delay: index * 0.05 + 0.1, duration: 0.4, ease: "easeOut" }}
                  />
                </motion.svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              )}
            </div>

            <div className="tw:flex-1 tw:min-w-0">
              <div className="tw:text-sm font-body tw:font-medium">
                {check.label}
              </div>
              <div
                className="tw:text-xs font-body tw:mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {check.detail}
              </div>
            </div>

            <span
              className="tw:text-xs font-data tw:tabular-nums tw:flex-shrink-0 tw:mt-0.5"
              style={{ color: check.passed ? 'var(--color-verified)' : 'var(--text-muted)' }}
            >
              [{check.passed ? 'OK' : 'FAIL'}]
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
