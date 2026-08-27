import { ArrowLeft, BookOpen, CheckCircle2, Lightbulb, ShieldCheck } from 'lucide-react';

const sections = [
  {
    number: '01',
    title: 'Why password strength matters',
    icon: ShieldCheck,
    paragraphs: [
      'Attackers rarely guess randomly. They use lists of passwords and patterns collected from real data leaks, then try those guesses against many accounts at scale.',
      'A weak password can be the one thing standing between an attacker and an account, even when the rest of the service is well protected.',
    ],
  },
  {
    number: '02',
    title: 'What actually makes a password strong',
    icon: Lightbulb,
    paragraphs: [
      'Length and unpredictability matter more than adding a symbol just because a form asks for one. Avoid names, birthdays, dictionary words, and obvious substitutions. P@ssw0rd is still an obvious password.',
      'A passphrase is a good alternative: use a few long, unrelated words that are easy for you to remember but difficult for someone else to predict. A password manager can create and remember truly random strings for you.',
    ],
  },
  {
    number: '03',
    title: 'How this analyzer scores a password',
    icon: CheckCircle2,
    paragraphs: [
      'The analyzer checks length and character variety, then looks for repeated characters, sequences, keyboard patterns, and matches against known common passwords.',
      'Those checks combine into the Weak, Medium, or Strong result. The checklist beside your result is the actual list of things being checked. There is no hidden magic.',
    ],
  },
  {
    number: '04',
    title: 'What “entropy” means',
    icon: BookOpen,
    paragraphs: [
      'Entropy is a way to describe how many guesses a password might require. A four-digit PIN has 10,000 possible combinations, so it has relatively low entropy and can be searched quickly.',
      'A long, random password has many more possible combinations. The bits number shown in the app is a compact way to express that: more bits means more possibilities and more guesses required.',
    ],
  },
  {
    number: '05',
    title: 'What the crack-time estimate means',
    icon: BookOpen,
    paragraphs: [
      'The crack-time number is an estimate based on assumptions about an attacker’s guessing speed. It is useful for comparison, but it is not a guarantee or a promise about exactly how long your password will last.',
      'The app shows two reference scenarios: a slow, rate-limited online login attempt, and a much faster offline attack where an attacker has obtained password hashes and uses specialized hardware.',
    ],
  },
  {
    number: '06',
    title: 'How the breach check works, and why it is safe',
    icon: ShieldCheck,
    paragraphs: [
      'The breach check compares your password with known leaked-password data without sending the actual password to the breach database. The check is designed so the full password stays on your device.',
      'A “breach detected” result means this exact password appeared in a previous data leak. Treat it as already compromised and replace it, even if the strength meter gives it a reasonable score.',
    ],
  },
  {
    number: '07',
    title: 'What to actually do with this information',
    icon: Lightbulb,
    paragraphs: [
      'Use a password manager or generator instead of inventing and remembering passwords by hand. Use a different password for every site so one leak cannot unlock several accounts.',
      'When a breach check finds a match, change that password now. Then change it anywhere else you reused it and turn on multi-factor authentication when the service supports it.',
    ],
  },
];

function HowItWorks({ onBack }) {
  return (
    <main className="explainer-shell">
      <a className="explainer-back" href="/analyzer" onClick={(event) => { event.preventDefault(); onBack(); }}>
        <ArrowLeft size={16} />
        OPEN ANALYZER
      </a>

      <header className="explainer-header">
        <div className="explainer-kicker">PASS-X // FIELD GUIDE</div>
        <h1>HOW THE WEB APP WORKS</h1>
        <p>Understand what the analyzer checks, what the numbers mean, and what to do next.</p>
      </header>

      <div className="explainer-content">
        {sections.map(({ number, title, icon: Icon, paragraphs }) => (
          <section className="explainer-section" key={number}>
            <div className="explainer-number">{number}</div>
            <div>
              <h2><Icon size={18} /> {title}</h2>
              {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}

        <section className="explainer-myths">
          <div className="explainer-number">08</div>
          <div>
            <h2>MYTHS VS. FACTS</h2>
            <div className="myth-row"><strong>MYTH</strong><span>Adding one number and one symbol makes any password strong.</span></div>
            <div className="fact-row"><strong>FACT</strong><span>Predictable patterns still matter more than cosmetic complexity.</span></div>
            <div className="myth-row"><strong>MYTH</strong><span>If you can remember it, reusing it is fine.</span></div>
            <div className="fact-row"><strong>FACT</strong><span>Reuse lets one breach put several accounts at risk.</span></div>
          </div>
        </section>
      </div>

      <footer className="explainer-footer">
        <p>Good password security means making passwords difficult to guess and never reusing them.</p>
        <a className="terminal-button explainer-return" href="/analyzer" onClick={(event) => { event.preventDefault(); onBack(); }}>RETURN TO ANALYZER</a>
      </footer>
    </main>
  );
}

export default HowItWorks;
