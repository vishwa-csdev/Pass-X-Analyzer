import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { breachCheckPassword } from '../api';

const signalPositions = [
  [18, 26], [32, 18], [48, 12], [68, 16], [82, 26],
  [88, 42], [84, 60], [66, 80], [46, 88], [24, 78],
  [12, 60], [12, 42], [22, 48], [56, 28], [62, 58], [40, 68],
];

function BreachCheckCard({ password }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('STANDBY');
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    if (!password) {
      setResult(null);
      setLoading(false);
      setStatusText('STANDBY');
      return;
    }

    if (!scanKey) return;

    let active = true;
    setLoading(true);
    setStatusText('SCANNING KNOWN BREACH DATABASES...');

    const timer = setTimeout(async () => {
      try {
        const data = await breachCheckPassword(password);
        if (active) {
          setResult(data);
          setStatusText(data.found ? 'BREACH DETECTED' : 'NO SIGNAL DETECTED');
        }
      } catch (error) {
        if (active) {
          setResult({ found: false, matches: 0, status: 'scan_error', message: 'BREACH INDEX UNAVAILABLE' });
          setStatusText('DATABASE ERROR');
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 450);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [password, scanKey]);

  const handleScan = () => {
    if (!password || loading) return;
    setResult(null);
    setScanKey((value) => value + 1);
  };

  const statusClass = useMemo(() => {
    if (!result) return 'scan-status';
    if (result.status === 'breach_detected') return 'scan-status scan-status--alert';
    if (result.status === 'scan_error') return 'scan-status scan-status--warn';
    return 'scan-status';
  }, [result]);

  const label = result?.found ? '⚠ BREACH DETECTED' : 'NO SIGNAL DETECTED';
  const matchText = result && result.matches > 0 ? `${result.matches} MATCHES` : '0 MATCHES';

  return (
    <div className="vault-card terminal-panel breach-check-shell">
      <div className="tw:flex tw:items-center tw:justify-between tw:gap-3">
        <h2 className="panel-label tw:flex tw:items-center tw:gap-2">
          <AlertTriangle size={16} style={{ color: result?.found ? 'var(--alert-red)' : 'var(--phosphor)' }} />
          BREACH CHECK
        </h2>
      </div>

      <div className="radar-wrap">
        <div className="radar" aria-live="polite">
          <div className="radar-sweep" style={{ opacity: loading ? 1 : 0.8 }} />
          <div className="radar-pulse" style={{ opacity: result?.found ? 1 : 0.35 }} />
          <div className="breach-legend">
            {signalPositions.map(([x, y], i) => (
              <span key={i} style={{ left: `${x}%`, top: `${y}%`, opacity: loading || result?.found ? 1 : 0.4 }} />
            ))}
          </div>
        </div>
      </div>

      <div className={statusClass}>{loading ? statusText : (result ? statusText : 'STANDBY')}</div>

      <button className="terminal-button" type="button" disabled={!password || loading} onClick={handleScan}>
        {loading ? 'SCANNING...' : 'SCAN FOR KNOWN BREACHES'}
      </button>

      <div className={`readout-box ${result?.found ? 'readout-box--alert' : ''}`}>
        <div>
          <div className="readout-meta">BREACH INDEX</div>
          <div className={`readout-value ${result?.found ? 'readout-value--alert' : ''}`}>
            {result ? label : 'READY'}
          </div>
        </div>
        <div className="readout-meta" style={{ textAlign: 'right' }}>{result ? matchText : 'WAITING'}</div>
      </div>
    </div>
  );
}

export default BreachCheckCard;
