import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * How This Works Explainer Page
 * Static content explaining password strength concepts in plain language
 */
export default function HowThisWorks() {
  const [currentSection, setCurrentSection] = useState(0);
  const sections = [
    {
      id: 1,
      title: "Why password strength matters",
      content: [
        "Attackers rarely guess randomly — they run known password lists and patterns from real breaches against accounts at scale. A weak password is often the one thing standing between an attacker and an account, no matter how secure everything else around it is.",
        "Think of your password like a lock on your front door. If it's flimsy or easily picked, no amount of alarm systems or security cameras will keep a determined intruder out. Strong passwords are the foundation of your digital security."
      ]
    },
    {
      id: 2,
      title: "What actually makes a password strong",
      content: [
        "Length matters more than complexity rules. A long password of simple characters is often stronger than a short, complex one that follows predictable patterns.",
        "Randomness and unpredictability matter more than throwing in a symbol because a form demanded one. 'Password123!' might meet complexity requirements, but it's still weak because it follows a predictable pattern.",
        "Avoid personal information like names, birthdays, or pet names — these are easily guessed or found through social media.",
        "Stay away from dictionary words and their obvious substitutions (like P@ssw0rd or H3ll0). Attackers' dictionaries include these common substitutions.",
        "Avoid sequences (abc, 123) and keyboard patterns (qwerty, asdf) — these are among the first things attackers try.",
        "Consider using passphrases: a few random unrelated words strung together (like 'correct-horse-battery-staple'). These can be both strong and memorable."
      ]
    },
    {
      id: 3,
      title: "How this analyzer actually scores a password",
      content: [
        "The analyzer runs a series of straightforward checks on your password, each contributing to your final score. There's no hidden magic — everything is transparent and based on established security principles.",
        "Here's what gets checked:",
        "",
        "• **Length**: Longer passwords get higher scores (8+ chars = 10 pts, 12+ = 15 pts, 16+ = 20 pts)",
        "• **Character variety**: Points for using uppercase, lowercase, numbers, and symbols",
        "• **Repetition penalties**: Lose points for having the same character repeated 3+ times (like 'aaa')",
        "• **Sequence detection**: Lose points for sequential patterns (abc, 123) or reverse sequences (cba, 321)",
        "• **Keyboard walks**: Lose points for patterns like qwerty, asdf, or zxcv",
        "• **Common password check**: Lose all points if your password appears in lists of commonly used passwords",
        "• **Entropy bonus**: Extra points for high unpredictability (more on this below)",
        "",
        "The checklist you see alongside your results is literally the list of things being checked — each line corresponds to one of these tests."
      ]
    },
    {
      id: 4,
      title: "What 'entropy' means",
      content: [
        "Entropy measures how unpredictable something is. In password terms, it answers: 'How many guesses would it actually take to crack this password?'",
        "Think of it like combinations on a lock:",
        "",
        "• A 4-digit PIN has 10,000 possible combinations (0000-9999): low entropy",
        "• A 6-character lowercase-only password has ~308 million possibilities: still relatively low",
        "• A 12-character password using letters, numbers, and symbols has sextillions of possibilities: very high entropy",
        "",
        "The entropy value shown in bits represents the exponent in 2^n. For example:",
        "",
        "• 20 bits of entropy = 2^20 = ~1 million possible combinations",
        "• 50 bits of entropy = 2^50 = ~1 quadrillion possible combinations",
        "• 80 bits of entropy = 2^80 = ~1.2 sextillion possible combinations",
        "",
        "More bits means more possible combinations, which means more guesses required to crack the password through brute force."
      ]
    },
    {
      id: 5,
      title: "What the crack-time estimate does and doesn't tell you",
      content: [
        "This needs an honest framing: it's an estimate built on stated assumptions about how fast an attacker can guess, not a guarantee.",
        "The analyzer shows two scenarios to give you context:",
        "",
        "• **Online attack (throttled)**: Assumes 1,000 guesses per second. This represents rate-limited login attempts with security measures like captchas, account lockouts, or network delays.",
        "• **Offline attack (GPU-powered)**: Assumes 1 billion guesses per second. This represents an attacker who has stolen password hashes and is trying to crack them on specialized hardware.",
        "",
        "Important limitations to understand:",
        "",
        "• These are mathematical estimates based on entropy alone — they don't account for smart guessing algorithms that try common passwords first",
        "• Real-world attacks might be faster or slower depending on the specific security implementations",
        "• The estimates assume the attacker knows nothing about you and is purely brute-forcing",
        "• A 'centuries' estimate doesn't mean you're safe forever — it means brute force would take that long, but attackers use smarter methods",
        "",
        "Use these estimates as relative guides: if one password shows 'hours' and another shows 'centuries', the second is vastly stronger against brute force attacks."
      ]
    },
    {
      id: 6,
      title: "How the breach check works, and why it's safe",
      content: [
        "This section exists mainly to build trust: checking a password against known leaked-password databases does NOT mean sending your actual password off to a third party.",
        "",
        "How it works (in simple terms):",
        "",
        "1. Your password is converted to a cryptographic hash (a one-way fingerprint) using SHA-1",
        "2. Only the first few characters of this hash are sent to the breach database",
        "3. The database returns all hash fragments that match those first few characters",
        "4. Your browser checks locally if the full hash matches any of those returned fragments",
        "5. If there's a match, it means your exact password has appeared in a breach — but your password never left your computer",
        "",
        "What a 'breach detected' result actually means:",
        "",
        "This exact password has appeared in a previous data breach, so treat it as already compromised — not just weak. Even if it's otherwise strong (long, random, etc.), attackers will try it first because they know it works.",
        "",
        "The safest approach is to treat any breach hit as an immediate signal to change that password everywhere you've used it."
      ]
    },
    {
      id: 7,
      title: "What to actually do with this information",
      content: [
        "Practical, not preachy: here's what actually works:",
        "",
        "• **Use a password manager**: Let it generate and store truly random, unique passwords for every site. You only need to remember one master password.",
        "• **Never reuse passwords**: If one site gets breached, reused passwords let attackers access your other accounts.",
        "• **Enable two-factor authentication**: Especially on important accounts (email, banking, social media).",
        "• **Change breached passwords immediately**: If our tool flags a password as compromised, change it now — not eventually.",
        "• **Consider passphrases for master passwords**: Four or five random words can be both strong and memorable for your password manager master password.",
        "",
        "Remember: security isn't about perfection — it's about making yourself a harder target than the person next to you."
      ]
    }
  ];

  return (
    <motion.div
      className="tw:min-h-screen tw:flex tw:flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <motion.header
        className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-8 tw:border-b tw:border-[var(--text-dim)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="tw:flex-1" />
        <div className="tw:text-center tw:flex-1">
          <h1 className="tw:text-3xl tw:font-display tw:font-bold tw:mb-2">
            <span style={{ color: 'var(--color-signal)' }}>Pass-X</span>
            <span style={{ color: 'var(--text-primary)' }}> How It Works</span>
          </h1>
          <p className="tw:text-sm font-body" style={{ color: 'var(--text-muted)' }}>
            Plain-language explanations of password security concepts
          </p>
        </div>
        <div className="tw:flex-1 tw:flex tw:justify-end">
          <a
            href="/"
            className="tw:text-[var(--text-muted)] hover:tw:text-[var(--text-primary)] tw:transition-colors tw:p-2 tw:rounded-md focus:tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-[var(--color-signal-glow)]"
          >
            ← Back to Analyzer
          </a>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="tw:flex-1 tw:px-6 tw:py-8 tw:overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Progress Indicator */}
        <div className="tw:mb-8">
          <div className="tw:w-full tw:h-1 tw:bg-[var(--text-dim)] tw:rounded-full tw:overflow-hidden">
            <div
              className="tw:h-full tw:bg-[var(--text-phosphor)] tw:transition-all tw:duration-500"
              style={{
                width: `${((currentSection + 1) / sections.length) * 100}%`
              }}
            />
          </div>
          <p className="tw:text-xs font-body tw:text-center tw:mt-1" style={{ color: 'var(--text-dim)' }}>
            Section {currentSection + 1} of {sections.length}
          </p>
        </div>

        {/* Content Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            className={`tw:space-y-6 ${currentSection === index ? 'tw:block' : 'tw:hidden'}`}
            initial={{ opacity: 0, x: currentSection > index ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              type: currentSection === index ? 'spring' : 'tween',
              stiffness: currentSection === index ? 300 : 0,
              damping: currentSection === index ? 20 : 0
            }}
          >
            <h2 className="tw:text-2xl tw:font-display tw:font-bold tw:mb-4" style={{ color: 'var(--text-primary)' }}>
              {section.title}
            </h2>
            <div className="tw:prose tw:max-w-none tw:text-lg font-body tw:leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {section.content.map((paragraph, paraIndex) => (
                paragraph === ''
                  ? <div key={paraIndex} className="tw:mb-6" />
                  : <p key={paraIndex} className="tw:mb-4">{paragraph}</p>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Navigation Controls */}
        <div className="tw:flex tw:items-center tw:justify-between tw:pt-8 tw:border-t tw:border-[var(--text-dim)]">
          <div className="tw:flex tw:items-center tw:gap-4">
            {currentSection > 0 && (
              <button
                onClick={() => setCurrentSection(currentSection - 1)}
                className="icon-btn tw:p-3 tw:hover:tw:bg-[var(--text-dim)]"
                aria-label="Previous section"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: currentSection > 0 ? 0 : -15 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  ←
                </motion.div>
              </button>
            )}
            <span className="tw:text-xs font-body-mono tw:text-[var(--text-muted)]">
              Section {currentSection + 1} of {sections.length}
            </span>
            {currentSection < sections.length - 1 && (
              <button
                onClick={() => setCurrentSection(currentSection + 1)}
                className="icon-btn tw:p-3 tw:hover:tw:bg-[var(--text-dim)]"
                aria-label="Next section"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: currentSection < sections.length - 1 ? 0 : 15 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  →
                </motion.div>
              </button>
            )}
          </div>
          <div className="tw:text-xs font-body-mono tw:text-[var(--text-dim)] tw:tracking-wider">
            Use ← → keys or swipe to navigate
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        className="tw:text-center tw:px-6 tw:py-6 tw:border-t tw:border-[var(--text-dim)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="tw:text-xs font-body" style={{ color: 'var(--text-muted)' }}>
          Pass-X Analyzer — Your passwords are never stored or transmitted beyond this session.
        </p>
      </motion.footer>
    </motion.div>
  );
}