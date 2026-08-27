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
import { analyzePassword } from './api';

function App() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Debounced analysis
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
        setError('Could not connect to the API. Make sure the server is running.');
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
      {/* Interactive Space Galaxy Background */}
      <SpaceBackground />

      <div className="tw:w-full tw:max-w-7xl tw:mx-auto tw:p-4 md:tw:p-8 tw:min-h-screen tw:flex tw:flex-col">
        {/* Header */}
        <motion.header
          className="tw:flex tw:items-center tw:justify-between tw:mb-8 md:tw:mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="tw:flex-1" />
          <div className="tw:text-center tw:flex-1">
            <h1 className="tw:text-3xl tw:font-display tw:font-bold tw:mb-1">
              <span style={{ color: 'var(--color-signal)' }}>Pass-X</span>
              <span style={{ color: 'var(--text-primary)' }}> Analyzer</span>
            </h1>
            <p className="tw:text-sm font-body" style={{ color: 'var(--text-muted)' }}>
              Test your password strength in real time
            </p>
          </div>
          <div className="tw:flex-1 tw:flex tw:justify-end">
            <a 
              href="https://github.com/andropedia/pass-x-analyzer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="tw:text-[var(--text-muted)] hover:tw:text-[var(--text-primary)] tw:transition-colors tw:p-2 tw:rounded-md focus:tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-[var(--color-signal-glow)]"
              aria-label="View on GitHub"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </motion.header>

        {/* Main content — Two Column Split Design */}
        <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-6 md:tw:gap-8 tw:items-start tw:flex-grow">
          
          {/* Left Column: Password Analyzer */}
          <div className="tw:flex tw:flex-col tw:gap-6">
            <h2 className="tw:text-lg font-display tw:font-semibold tw:flex tw:items-center tw:gap-2" style={{ color: 'var(--text-primary)' }}>
              <ShieldQuestion size={18} style={{ color: 'var(--color-signal)' }} />
              Analyzer
            </h2>
            
            <div className="vault-card tw:p-5">
              <PasswordInput 
                value={password} 
                onChange={setPassword} 
                entropyBits={hasResult ? result.entropy_bits : 0} 
              />
              
              <AnimatePresence>
                {loading && password && (
                  <motion.div
                    className="tw:mt-3 tw:flex tw:items-center tw:gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      className="tw:w-2 tw:h-2 tw:rounded-full tw:animate-pulse"
                      style={{ backgroundColor: 'var(--color-signal)' }}
                    />
                    <span className="tw:text-xs" style={{ color: 'var(--text-muted)' }}>
                      Analyzing...
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  className="tw:mt-3 tw:text-xs tw:p-3 tw:rounded-lg"
                  style={{
                    color: 'var(--color-breach)',
                    backgroundColor: 'var(--color-breach-bg)',
                    border: '1px solid var(--color-breach)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.div>
              )}

              {/* Strength Meter */}
              <div className="tw:mt-5">
                <StrengthMeter
                  score={hasResult ? result.score : 0}
                  category={hasResult ? result.category : 'Weak'}
                  active={hasResult}
                />
              </div>
            </div>

            {/* Complete Analyzer Feedback */}
            <AnimatePresence>
              {hasResult && (
                <motion.div
                  className="tw:flex tw:flex-col tw:gap-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Checklist */}
                  <div className="vault-card tw:p-5">
                    <Checklist checks={result.checks} />
                  </div>

                  {/* Entropy & Suggestions */}
                  <div className="vault-card tw:p-5 tw:flex tw:flex-col tw:gap-5">
                    <EntropyDisplay
                      entropyBits={result.entropy_bits}
                      entropyFormula={result.entropy_formula}
                      crackTimes={result.crack_times}
                    />
                    <Suggestions
                      suggestions={result.suggestions}
                      strongerVersion={result.stronger_version}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state (only shows when no results are present) */}
            <AnimatePresence>
              {!hasResult && !error && (
                <motion.div
                  className="vault-card tw:p-10 tw:text-center tw:flex tw:flex-col tw:items-center tw:justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="tw:mb-3"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ShieldQuestion size={32} strokeWidth={1.5} />
                  </motion.div>
                  <p
                    className="tw:text-sm font-body tw:leading-relaxed"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Type a password to see it break down in real time
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Generator */}
          <div className="tw:flex tw:flex-col tw:gap-6">
            <h2 className="tw:text-lg font-display tw:font-semibold tw:flex tw:items-center tw:gap-2" style={{ color: 'var(--text-primary)' }}>
              <Zap size={18} style={{ color: 'var(--color-signal)' }} />
              Generator
            </h2>
            <div className="vault-card">
              <GeneratorPanel />
            </div>
          </div>

        </div>

        {/* Footer */}
        <motion.footer
          className="tw:text-center tw:mt-12 tw:pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="tw:text-xs font-body" style={{ color: 'var(--text-muted)' }}>
            Pass-X Analyzer — Your passwords are never stored or transmitted beyond this session.
          </p>
        </motion.footer>
      </div>
    </>
  );
}

export default App;
