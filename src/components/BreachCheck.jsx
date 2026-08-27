import { useEffect, useState } from 'react';
import { AlertTriangle, Radar, ShieldCheck } from 'lucide-react';
import { checkPasswordBreach } from '../api';

const signals = Array.from({ length: 34 }, (_, index) => ({
  left: `${50 + Math.cos(index * 1.87) * (18 + (index % 4) * 8)}%`,
  top: `${50 + Math.sin(index * 1.87) * (18 + (index % 4) * 8)}%`,
  animationDelay: `${(index % 7) * 0.12}s`,
}));

export default function BreachCheck({ password }) {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setState('idle');
    setResult(null);
    setError(null);
  }, [password]);

  async function handleScan() {
    setState('scanning');
    setError(null);
    try {
      setResult(await checkPasswordBreach(password));
      setState('complete');
    } catch (scanError) {
      setError('Unable to reach the breach index. Try again shortly.');
      setState('error');
      console.error('Breach check error:', scanError);
    }
  }

  const isFound = state === 'complete' && result?.found;
  const statusText = state === 'scanning'
    ? 'SCANNING KNOWN BREACH DATABASES...'
    : isFound
      ? `BREACH DETECTED - FOUND ${result.count.toLocaleString()} TIMES IN KNOWN BREACHES.`
      : state === 'complete'
        ? 'NO SIGNAL DETECTED - 0 MATCHES IN KNOWN BREACHES.'
        : 'AWAITING SCAN COMMAND.';

  return (
    <section className={`breach-panel ${state === 'scanning' ? 'is-scanning' : ''} ${isFound ? 'is-breached' : ''}`} aria-live="polite">
      <div className="breach-heading">
        <div><p className="eyebrow">BREACH TELEMETRY</p><h2>Known breach scan</h2></div>
        <Radar size={22} aria-hidden="true" />
      </div>
      <div className="radar-shell" aria-hidden="true">
        <div className="radar-grid" /><div className="radar-sweep" />
        {signals.map((signal, index) => <i key={index} className="radar-signal" style={signal} />)}
        {state === 'complete' && !isFound && <ShieldCheck className="radar-result-icon" size={30} />}
        {isFound && <AlertTriangle className="radar-result-icon" size={30} />}
      </div>
      <p className="breach-status">{statusText}</p>
      {error && <p className="breach-error">{error}</p>}
      <button className="terminal-button" type="button" onClick={handleScan} disabled={!password || state === 'scanning'}>
        {state === 'scanning' ? 'SCANNING...' : 'SCAN FOR KNOWN BREACHES'}
      </button>
      <p className="breach-note">The password is checked using a partial hash. The full password never leaves this browser.</p>
    </section>
  );
}