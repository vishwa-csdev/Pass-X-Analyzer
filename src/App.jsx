import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldQuestion, Zap } from 'lucide-react';
import PasswordInput from './components/PasswordInput';
import StrengthMeter from './components/StrengthMeter';
import Checklist from './components/Checklist';
import Suggestions from './components/Suggestions';
import EntropyDisplay from './components/EntropyDisplay';
import GeneratorPanel from './components/GeneratorPanel';
import SpaceBackground from './components/SpaceBackground';
import BreachCheckCard from './components/BreachCheckCard';
import { analyzePassword } from './api';

function App() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!password) {
      setResult(null);
      setError(null);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await analyzePassword(password);
        setResult(data);
        setError(null);
      } catch (err) {
        setError('Unable to reach the analyzer service.');
        console.error('Analysis error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [password]);

  const hasResult = result && result.score !== undefined;

  return (
    <>
      <SpaceBackground />

      <div className="app-shell tw:max-w-7xl tw:mx-auto tw:p-4 md:tw:p-8 tw:min-h-screen tw:flex tw:flex-col">
        <motion.header
          className="terminal-header tw:flex tw:items-center tw:justify-between tw:mb-8 md:tw:mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="tw:flex-1" />
          <div className="tw:text-center tw:flex-1">
            <div className="boot-tag">SYSTEM READY</div>
            <h1 className="tw:text-4xl md:tw:text-5xl tw:font-display tw:leading-none tw:tracking-wide">
              <span style={{ color: 'var(--phosphor)' }}>PASS-X</span>
              <span style={{ color: 'var(--text-primary)' }}> ANALYZER</span>
            </h1>
          </div>
          <div className="tw:flex-1 tw:flex tw:justify-end">
            <a
              href="https://github.com/vishwa-csdev/Pass-X-Analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link"
              aria-label="View repository"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </motion.header>

        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-6 md:tw:gap-8 tw:items-start tw:flex-grow">
          <div className="tw:flex tw:flex-col tw:gap-6">
            <h2 className="panel-label tw:flex tw:items-center tw:gap-2">
              <ShieldQuestion size={18} />
              ANALYZER
            </h2>

            <div className="vault-card tw:p-5">
              <PasswordInput value={password} onChange={setPassword} entropyBits={hasResult ? result.entropy_bits : 0} />

              <AnimatePresence>
                {loading && password && (
                  <motion.div className="terminal-status tw:mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <span className="terminal-dot" />
                    ANALYZING SIGNAL...
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div className="status-box status-box--error tw:mt-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {error}
                </motion.div>
              )}

              <div className="tw:mt-5">
                <StrengthMeter score={hasResult ? result.score : 0} category={hasResult ? result.category : 'Weak'} active={hasResult} />
              </div>
            </div>

            <BreachCheckCard password={password} />

            <AnimatePresence>
              {hasResult && (
                <motion.div
                  className="tw:flex tw:flex-col tw:gap-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="vault-card tw:p-5">
                    <Checklist checks={result.checks} />
                  </div>

                  <div className="vault-card tw:p-5 tw:flex tw:flex-col tw:gap-5">
                    <EntropyDisplay entropyBits={result.entropy_bits} entropyFormula={result.entropy_formula} crackTimes={result.crack_times} />
                    <Suggestions suggestions={result.suggestions} strongerVersion={result.stronger_version} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!hasResult && !error && (
                <motion.div className="vault-card tw:p-10 tw:text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="tw:mb-3" style={{ color: 'var(--text-muted)' }}>
                    <ShieldQuestion size={32} strokeWidth={1.5} />
                  </div>
                  <p className="tw:text-sm tw:leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    ENTER A PASSWORD TO BEGIN THE SIGNAL TRACE.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="tw:flex tw:flex-col tw:gap-6">
            <h2 className="panel-label tw:flex tw:items-center tw:gap-2">
              <Zap size={18} />
              GENERATOR
            </h2>
            <div className="vault-card">
              <GeneratorPanel />
            </div>
          </div>
        </div>

        <motion.footer className="tw:text-center tw:mt-12 tw:pb-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
          <p className="tw:text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            PASS-X ANALYZER // PASSWORDS ARE NEVER STORED OR TRANSMITTED BEYOND THIS SESSION.
          </p>
        </motion.footer>
      </div>
    </>
  );
}

export default App;
