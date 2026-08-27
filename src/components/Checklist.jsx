import { motion } from 'framer-motion';

/**
 * Terminal Log Style Checklist
 * Rendered like a boot log with monospace-aligned dot leaders
 */
export default function Checklist({ checks }) {
  if (!checks || checks.length === 0) return null;

  return (
    <motion.div
      className="tw:space-y-1"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {checks.map((check, index) => (
        <motion.div
          key={check.name}
          className="tw:flex tw:items-baseline tw:gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.3 }}
        >
          <span className="font-body-mono" style={{
            color: check.passed ? 'var(--text-phosphor)' : 'var(--text-dim)',
            letterSpacing: '-0.05em'
          }}>
            {check.label.toUpperCase().padEnd(20, '.')}
          </span>
          <span className="font-body-mono" style={{
            color: check.passed ? 'var(--text-phosphor)' :
                   check.name === 'indic_password' || check.name === 'common_password' ? 'var(--text-red)' :
                   'var(--text-dim)',
            letterSpacing: '-0.05em'
          }}>
            [{check.passed ? 'OK' : 'FAIL'}]
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
}
