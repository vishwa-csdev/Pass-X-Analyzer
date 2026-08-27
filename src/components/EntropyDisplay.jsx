import { motion } from 'framer-motion';

/**
 * Signal Readouts Display - Seven Segment Style
 * Displays entropy and crack-time estimates in seven-segment display style
 */
export default function EntropyDisplay({ entropyBits, entropyFormula, crackTimes }) {
  if (entropyBits === undefined || entropyBits === null) return null;

  return (
    <motion.div
      className="tw:flex tw:flex-col tw:gap-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Signal Entropy Readout */}
      <div className="tw:flex tw:items-baseline tw:gap-4">
        <span className="font-display-pixel" style={{ color: 'var(--text-dim)' }}>
          SIGNAL ENTROPY:
        </span>
        <div className="seven-seg-display"
             style={{
               color: entropyBits >= 70 ? 'var(--text-phosphor)' :
                      entropyBits >= 40 ? 'var(--text-amber)' :
                      'var(--text-dim)'
             }}>
          {Math.floor(entropyBits).toString().padStart(3, '0')}
        </div>
        <span className="font-display-pixel" style={{ color: 'var(--text-dim)' }}>
          BITS
        </span>
      </div>

      {/* Entropy Formula */}
      <div className="tw:flex tw:items-start tw:gap-2 tw:mt-2">
        <span className="font-body-mono" style={{ color: 'var(--text-dim)' }}>
          FORMULA:
        </span>
        <span className="font-body-mono" style={{ color: 'var(--text-phosphor)' }}>
          {entropyFormula}
        </span>
      </div>

      {/* Crack Time Estimates */}
      {crackTimes && crackTimes.length > 0 && (
        <motion.div
          className="tw:space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {crackTimes.map((ct, index) => (
            <motion.div
              key={ct.scenario}
              className="tw:flex tw:items-baseline tw:gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <span className="font-body-mono" style={{
                color: 'var(--text-dim)',
                fontSize: '14px'
              }}>
                {ct.scenario.toUpperCase()}:
              </span>
              <div className="tw:flex-1 tw:text-end font-body-mono" style={{
                color: ct.scenario.includes('Offline') || ct.display.includes('seconds') || ct.display.includes('minutes')
                       ? 'var(--text-red)'
                       : ct.scenario.includes('Online') && (ct.display.includes('hours') || ct.display.includes('days'))
                       ? 'var(--text-amber)'
                       : 'var(--text-phosphor)'
              }}>
                {ct.display}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
