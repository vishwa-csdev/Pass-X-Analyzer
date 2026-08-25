import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Suggestions panel with actionable tips and stronger version hint.
 */
export default function Suggestions({ suggestions, strongerVersion }) {
  if ((!suggestions || suggestions.length === 0) && !strongerVersion) return null;

  return (
    <motion.div
      id="suggestions-panel"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="tw:flex tw:flex-col tw:gap-5"
    >
      {suggestions && suggestions.length > 0 && (
        <div>
          <h2 className="tw:text-xs font-display tw:font-semibold tw:tracking-widest tw:uppercase tw:mb-3" style={{ color: 'var(--text-muted)' }}>
            Suggestions
          </h2>
          <div className="tw:space-y-2">
            <AnimatePresence>
              {suggestions.map((suggestion, i) => (
                <motion.div
                  key={suggestion}
                  className="tw:flex tw:items-start tw:gap-2 tw:text-sm font-body tw:leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="tw:mt-[3px] tw:flex-shrink-0" style={{ color: 'var(--color-signal)' }}>
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </div>
                  <span>{suggestion}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {strongerVersion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="tw:text-xs font-display tw:font-semibold tw:tracking-widest tw:uppercase tw:mb-2" style={{ color: 'var(--text-muted)' }}>
            Suggested Stronger Version
          </h2>
          <div 
            className="font-data tw:text-base tw:tracking-wider tw:p-3 tw:rounded-md tw:break-all tw:font-medium"
            style={{ 
              background: 'var(--color-obsidian)',
              color: 'var(--color-verified)',
              border: '1px solid var(--color-vault-line)'
            }}
          >
            {strongerVersion}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
