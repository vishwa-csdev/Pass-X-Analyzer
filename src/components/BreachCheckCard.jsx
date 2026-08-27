import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { breach_check_for_password } from '../../packages/core/breach';

/**
 * Breach Check Component - Cyber Retro / Space Aesthetic
 * Features radar sweep animation and terminal-style breach checking
 */
export default function BreachCheckCard({ password }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('STANDBY');
  const prefersReducedMotion = useReducedMotion();

  // Radar sweep animation
  useEffect(() => {
    if (!password) {
      setResult(null);
      setLoading(false);
      setStatusText('STANDBY');
      return;
    }

    // Start scan when password changes
    const scan = async () => {
      setLoading(true);
      setStatusText('SCANNING KNOWN BREACH DATABASES...');

      try {
        const data = breach_check_for_password(password);
        setResult(data);
        setStatusText(data.found ? 'BREACH DETECTED' : 'NO SIGNAL DETECTED');
      } catch (error) {
        console.error('Breach check error:', error);
        setResult({ found: false, matches: 0, status: 'scan_error' });
        setStatusText('DATABASE ERROR');
      } finally {
        setLoading(false);
      }
    };

    scan();
  }, [password]);

  // Determine if we should show alert styling
  const isBreachAlert = result?.found === true;

  // Generate radar dot positions (like stars on radar)
  const radarPositions = [
    [18, 26], [32, 18], [48, 12], [68, 16], [82, 26],
    [88, 42], [84, 60], [66, 80], [46, 88], [24, 78],
    [12, 60], [12, 42], [22, 48], [56, 28], [62, 58], [40, 68],
  ];

  return (
    <motion.div
      className="vault-card tw:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
        <h2 className="tw:flex tw:items-center tw:gap-2" style={{ color: 'var(--text-primary)' }}>
          <AlertTriangle size={16} style={{
            color: isBreachAlert ? 'var(--text-red)' : 'var(--text-phosphor)',
            animation: isBreachAlert && !prefersReducedMotion ? 'pulseAlert 2s infinite' : 'none'
          }} />
          BREACH CHECK
        </h2>
        <button
          onClick={() => setLoading(true) && setStatusText('SCANNING KNOWN BREACH DATABASES...') &&
                         breach_check_for_password(password).then(data => {
                           setResult(data);
                           setStatusText(data.found ? 'BREACH DETECTED' : 'NO SIGNAL DETECTED');
                         }).finally(() => setLoading(false))
          }
          disabled={loading || !password}
          className={`icon-btn tw:px-4 tw:py-2 tw:text-sm font-body-mono
                     ${loading ? 'tw:opacity-50' : ''}
                     ${isBreachAlert && !prefersReducedMotion ? 'tw:animate-pulse' : ''}`}
          style={{
            border: isBreachAlert ? '1px solid var(--text-red)' : '1px solid var(--text-dim)',
            background: isBreachAlert ? 'rgba(255, 59, 59, 0.1)' : 'transparent',
            color: isBreachAlert ? 'var(--text-red)' : 'var(--text-dim)'
          }}
        >
          {loading ? 'SCANNING...' : 'SCAN FOR KNOWN BREACHES'}
        </button>
      </div>

      {/* Status Readout */}
      <div className="tw:mb-4" style={{
        color: isBreachAlert ? 'var(--text-red)' :
               loading ? 'var(--text-amber)' :
               'var(--text-phosphor)',
        fontFamily: 'var(--font-display-terminal)',
        fontSize: '18px',
        letterSpacing: '0.5px',
        textAlign: 'center',
        minHeight: '24px',
        animation: isBreachAlert && !prefersReducedMotion && result?.found
                  ? 'pulseAlert 2s infinite'
                  : 'none'
      }}>
        {statusText}
      </div>

      {/* Radar Display */}
      <div className="tw:relative tw:h-[200px] tw:w-full tw:mb-4">
        {/* Radar Background - Dotted Circle */}
        <div className="tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center">
          <div className="tw:w-[180px] tw:h-[180px] tw:border tw:border-dashed tw:border-2
                          tw:border-[var(--text-dim)] tw:rounded-full tw:opacity-30">
            {/* Radar Dots (like stars) */}
            {radarPositions.map(([x, y], index) => (
              <motion.div
                key={index}
                className="tw:absolute tw:w-2 tw:h-2 tw:bg-[var(--text-dim)] tw:rounded-full"
                style={{
                  left: `calc(50% + ${x - 90}px)`,
                  top: `calc(50% + ${y - 90}px)`,
                  animation: !prefersReducedMotion
                            ? `twinkle${index} 3s ease-in-out ${index * 0.2}s infinite`
                            : 'none'
                }}
              />
            ))}
          </div>
        </div>

        {/* Radar Sweep Line */}
        <motion.div
          className="tw:absolute tw:inset-0"
          style={{
            pointerEvents: 'none'
          }}
        >
          <div className="tw:w-[180px] tw:h-[180px] tw:rounded-full tw:overflow-hidden tw:pointer-events-none">
            <motion.div
              className="tw:absolute tw:inset-0 tw:m-auto tw:w-[2px] tw:h-[90px] tw:bg-[var(--text-phosphor)]"
              style={{
                transformOrigin: 'bottom center',
                transform: !prefersReducedMotion ? 'rotate(0deg)' : 'rotate(180deg)',
                animation: !prefersReducedMotion
                          ? 'sweep 3s linear infinite'
                          : 'none'
              }}
            />
          </div>
        </motion.div>

        {/* Pulse Effect on Breach Detection */}
        {isBreachAlert && !prefersReducedMotion && result?.found && (
          <motion.div
            className="tw:absolute tw:inset-0 tw:pointer-events-none"
            style={{
              animation: 'pulseBreach 2s ease-in-out infinite'
            }}
          >
            <div className="tw:w-[190px] tw:h-[190px] tw:rounded-full tw:border-2
                            tw:border-[var(--text-red)] tw:opacity-25" />
          </motion.div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <motion.div
          className="tw:space-y-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Breach Status */}
          <div className="tw:flex tw:items-baseline tw:gap-4">
            <span className="font-display-pixel" style={{
              color: 'var(--text-dim)',
              fontSize: '14px'
            }}>
              SCAN RESULT:
            </span>
            <span className="font-display-pixel" style={{
              color: result.found ? 'var(--text-red)' : 'var(--text-phosphor)',
              fontSize: '18px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              {result.found ? '⚠ BREACH DETECTED' : 'NO SIGNAL DETECTED'}
            </span>
          </div>

          {/* Match Count */}
          {result.matches !== undefined && (
            <div className="tw:flex tw:items-baseline tw:gap-4">
              <span className="font-display-pixel" style={{
                color: 'var(--text-dim)',
                fontSize: '14px'
              }}>
                DATASETS:
              </span>
              <span className="seven-seg-display" style={{
                color: result.matches > 0 ? 'var(--text-red)' : 'var(--text-dim)',
                fontSize: '24px'
              }}>
                {result.matches.toString().padStart(2, '0')}
              </span>
              <span className="font-display-pixel" style={{
                color: 'var(--text-dim)',
                fontSize: '14px'
              }}>
                SOURCES
              </span>
            </div>
          )}

          {/* Message */}
          {result.message && (
            <div className="tw:flex tw:items-start tw:gap-2 tw:text-xs font-body-mono" style={{
              color: result.found ? 'var(--text-red)' : 'var(--text-dim)',
              lineHeight: '1.4'
            }}>
              <span>▸ </span>
              <span>{result.message}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {!result && !loading && (
        <motion.div
          className="tw:text-center tw:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="tw:flex tw:items-center tw:justify-center tw:mb-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="tw:w-10 tw:h-10 tw:rounded-full tw:border tw:border-[var(--text-dim)] tw:flex tw:items-center tw:justify-center"
              style={{
                color: 'var(--text-dim)',
                fontSize: '10px',
                fontFamily: 'var(--font-display-terminal)'
              }}
            >
              ●
            </motion.div>
          </div>
          <p className="tw:text-sm font-body tw:leading-relaxed" style={{
            color: 'var(--text-dim)'
          }}>
            Ready to scan password against known breach databases
          </p>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && !result && (
        <motion.div
          className="tw:text-center tw:py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="tw:flex tw:items-center tw:justify-center tw:mb-4">
            <div className="tw:w-[40px] tw:h-[40px] tw:rounded-full tw:border tw:border-[var(--text-amber)] tw:flex tw:items-center tw:justify-center tw:animate-pulse"
                 style={{
                   background: 'rgba(255, 176, 0, 0.1)',
                   color: 'var(--text-amber)'
                 }}>
              ●
            </div>
          </div>
          <p className="tw:text-sm font-body tw:leading-relaxed" style={{
            color: 'var(--text-amber)'
          }}>
            Scanning breach database networks...
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* Animations */
const style = document.createElement('style');
style.textContent = `
  @keyframes sweep {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes twinkle0 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes twinkle1 { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
  @keyframes twinkle2 { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes twinkle3 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes twinkle4 { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
  @keyframes twinkle5 { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes twinkle6 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes twinkle7 { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
  @keyframes twinkle8 { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes twinkle9 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes twinkle10 { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
  @keyframes twinkle11 { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes twinkle12 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
  @keyframes twinkle13 { 0%, 100% { opacity: 0.2; } 50% { opacity: 0.7; } }
  @keyframes twinkle14 { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.9; } }
  @keyframes twinkle15 { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }

  @keyframes pulseAlert {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes pulseBreach {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(255, 59, 59, 0.4);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(255, 59, 59, 0.1);
    }
  }
`;
document.head.appendChild(style);