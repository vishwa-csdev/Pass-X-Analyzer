import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, ShieldQuestion, Zap } from 'lucide-react';
import PasswordInput from './components/PasswordInput';
import StrengthMeter from './components/StrengthMeter';
import Checklist from './components/Checklist';
import Suggestions from './components/Suggestions';
import EntropyDisplay from './components/EntropyDisplay';
import GeneratorPanel from './components/GeneratorPanel';
import SpaceBackground from './components/SpaceBackground';
import BreachCheckCard from './components/BreachCheckCard';
import HowItWorks from './components/HowItWorks';
import { analyzePassword } from './api';

function App() {
  const [view, setView] = useState(() => window.location.pathname === '/analyzer' ? 'analyzer' : 'intro');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleRouteChange = () => {
      setView(window.location.pathname === '/analyzer' ? 'analyzer' : 'intro');
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setView(path === '/analyzer' ? 'analyzer' : 'intro');
    setShowHowItWorks(false);
  };

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

  if (showHowItWorks || view === 'intro') {
    return (
      <>
        <SpaceBackground />
        <HowItWorks onBack={() => navigate('/analyzer')} />
      </>
    );
  }

  return (
    <>
      <SpaceBackground />

      <div className="app-shell tw:w-full tw:max-w-6xl tw:mx-auto tw:min-h-screen tw:flex tw:flex-col tw:justify-center tw:items-stretch tw:px-3 tw:py-4 sm:tw:px-4 md:tw:px-6 lg:tw:px-8">
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
            <motion.a
              href="https://github.com/vishwa-csdev/Pass-X-Analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="terminal-link github-link"
              aria-label="View repository"
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.94 }}
            >
              <GitBranch size={21} strokeWidth={1.8} />
              <span>REPOSITORY</span>
            </motion.a>
          </div>
        </motion.header>

        <motion.section
          className="command-hero"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.1, ease: 'easeOut' }}
        >
          <div className="hero-orbit hero-orbit--outer" />
          <div className="hero-orbit hero-orbit--inner" />
          <div className="hero-kicker">SECURITY OPERATIONS</div>
          <p className="hero-copy">LIVE PASSWORD TELEMETRY AND LOCAL BREACH INTELLIGENCE</p>
          <div className="hero-readout">
            <span>SESSION STATE</span>
            <strong>{password ? 'SIGNAL ACQUIRED' : 'AWAITING INPUT'}</strong>
          </div>
          <button className="hero-help-link" type="button" onClick={() => navigate('/how-it-works')}>
            HOW THIS WORKS
          </button>
        </motion.section>

        <div className="mission-grid tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-6 md:tw:gap-7 tw:items-start tw:flex-grow tw:w-full tw:mx-auto tw:max-w-5xl">
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
