import { ArrowLeft, Check, X } from 'lucide-react';

export default function HowItWorks({ onBack }) {
  return (
    <main className="how-page">
      <button className="text-button" type="button" onClick={onBack}><ArrowLeft size={16} /> Back to analyzer</button>
      <p className="eyebrow">PASS-X FIELD NOTES / 01</p>
      <h1>How this works</h1>
      <p className="how-intro">A plain-language guide to what the analyzer measures, what its estimates mean, and what to do with the result.</p>
      <div className="how-sections">
        <section><h2>Why password strength matters</h2><p>Attackers rarely guess randomly. They run known password lists and patterns from real breaches against accounts at scale. A weak password can be the one thing standing between an attacker and an account.</p></section>
        <section><h2>What makes a password strong</h2><p>Length and unpredictability matter more than adding a symbol because a form demanded one. Avoid names, birthdays, dictionary words, obvious substitutions like <code>P@ssw0rd</code>, sequences, and keyboard patterns. A few unrelated random words can make a long, memorable passphrase.</p></section>
        <section><h2>How the score is built</h2><p>The analyzer checks length, character variety, repeated characters, sequences, keyboard patterns, and common-password matches. Those checks combine into the Weak, Medium, or Strong result. The checklist beside your result is the actual list of checks, with no hidden magic.</p></section>
        <section><h2>What entropy means</h2><p>Entropy is a rough measure of how many guesses a password would take. A four-digit PIN has 10,000 possible combinations, so it has low entropy. A long random password has many more combinations. More bits means more possible combinations and more guesses required.</p></section>
        <section><h2>What crack time does and does not mean</h2><p>The estimate is built on assumptions, not a guarantee. The app shows a slow, rate-limited online login scenario and a fast offline attack using specialized hardware. Real systems, attackers, and defenses vary.</p></section>
        <section><h2>How the breach check works</h2><p>The check compares your password with known leaked-password databases without sending the full password to a third party. A breach hit means this exact password appeared in a previous leak. Treat it as compromised, even if the strength score looks good.</p></section>
        <section><h2>What to do next</h2><p>Use a password manager or generator, choose a different password for every site, and change a password immediately when a breach check finds it.</p></section>
        <section><h2>Myths vs. facts</h2><p className="myth"><X size={16} /> One number and symbol make any password strong.</p><p className="fact"><Check size={16} /> Length, randomness, and avoiding patterns matter more.</p><p className="myth"><X size={16} /> A memorable password is fine to reuse.</p><p className="fact"><Check size={16} /> Reuse lets one breach put other accounts at risk.</p></section>
      </div>
      <button className="text-button return-button" type="button" onClick={onBack}>Return to the analyzer <ArrowLeft size={16} className="rotate-180" /></button>
    </main>
  );
}