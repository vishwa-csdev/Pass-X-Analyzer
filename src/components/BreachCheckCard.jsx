import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { breachCheckPassword } from '../api';

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

  const statusClass = result?.status === 'breach_detected'
    ? 'scan-status scan-status--alert'
    : result?.status === 'scan_error' ? 'scan-status scan-status--warn' : 'scan-status';

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

      <div className={`breach-scanner ${loading ? 'breach-scanner--active' : ''} ${result?.found ? 'breach-scanner--alert' : ''}`} aria-live="polite">
        <div className="scanner-track"><span /></div>
        <div className="scanner-caption">
          <span>{loading ? 'QUERYING HIBP RANGE' : result ? 'SCAN COMPLETE' : 'READY TO SCAN'}</span>
          <strong>{result ? (result.found ? 'EXPOSED' : 'CLEAR') : '—'}</strong>
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
