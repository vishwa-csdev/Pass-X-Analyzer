import { motion } from 'framer-motion';

/**
 * Entropy display with formula and crack-time estimates.
 */
export default function EntropyDisplay({ entropyBits, entropyFormula, crackTimes }) {
  if (entropyBits === undefined || entropyBits === null) return null;

  return (
    <motion.div
      id="entropy-display"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="tw:flex tw:flex-col tw:gap-4"
    >
      {/* Entropy */}
      <div>
        <h2 className="tw:text-xs font-display tw:font-semibold tw:tracking-widest tw:uppercase tw:mb-2" style={{ color: 'var(--text-muted)' }}>
          Entropy
        </h2>
        <div className="tw:flex tw:items-baseline tw:gap-2 tw:mb-1">
          <motion.span
            className="tw:text-2xl font-data tw:font-bold"
            style={{ color: 'var(--color-signal)' }}
            key={entropyBits}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {entropyBits}
          </motion.span>
          <span className="tw:text-sm font-body" style={{ color: 'var(--text-muted)' }}>bits</span>
        </div>
        <div
          className="tw:text-xs font-data tw:break-all tw:leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {entropyFormula}
        </div>
      </div>

      {/* Crack Time */}
      {crackTimes && crackTimes.length > 0 && (
        <div>
          <h2 className="tw:text-xs font-display tw:font-semibold tw:tracking-widest tw:uppercase tw:mb-2" style={{ color: 'var(--text-muted)' }}>
            Crack Time Estimates
          </h2>
          <div className="tw:space-y-2">
            {crackTimes.map((ct) => (
              <motion.div
                key={ct.scenario}
                className="tw:px-3 tw:py-2 tw:rounded-md tw:border tw:border-[var(--color-vault-line)]"
                style={{ backgroundColor: 'var(--color-obsidian)' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="tw:text-xs font-body tw:mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {ct.scenario}
                </div>
                <div className="tw:text-sm font-data tw:font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {ct.display}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
