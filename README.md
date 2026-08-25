# Pass-X Analyzer

Password Strength Analyzer — Real-time scoring, entropy calculation, crack-time estimation, and secure password generation.

Built for the Andropedia Technical Recruitment 2026 — Round 1.

---

## Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Core Logic | Python 3.10+ | Scoring, entropy, crack-time, pattern detection, dictionary checks, generation |
| CLI | Python argparse | Terminal-based password analysis and generation |
| API | FastAPI + Pydantic | Stateless REST API (/analyze, /generate) with Vercel serverless support |
| Frontend | React 19 + Vite | Responsive, split-layout UI with fast HMR |
| Styling | Tailwind CSS 4 | Utility-first dark theme (Obsidian / Vault design system) |
| Animation | Framer Motion | Spring-based micro-animations and live entropy waveform |
| Testing | pytest | 54 unit tests covering edge cases |

---

## Repository Structure

```
Pass-X-Analyzer/
├── api/
│   └── index.py             ← FastAPI backend (Vercel Serverless Function & local dev)
├── cli/
│   ├── __init__.py
│   └── main.py              ← CLI wrapper (argparse)
├── packages/
│   └── core/                ← Core Python package: scoring, entropy, crack-time, generator
│       ├── analyzer.py       ← Main orchestrator
│       ├── checks.py         ← Individual check functions
│       ├── crack_time.py     ← Crack-time estimation
│       ├── entropy.py        ← Entropy calculation
│       ├── generator.py      ← Password generator (secrets module)
│       ├── models.py         ← Dataclasses (no framework dependency)
│       ├── suggestions.py    ← Suggestion engine
│       └── data/
│           └── common_passwords.txt  ← Top 10K common passwords
├── src/                     ← React + Vite frontend source
│   ├── App.jsx              ← Main two-column split layout
│   ├── api.js               ← API client (local & production routing)
│   ├── index.css            ← Design tokens & ambient animations
│   ├── main.jsx             ← React root entrypoint
│   └── components/
│       ├── Checklist.jsx
│       ├── EntropyDisplay.jsx
│       ├── GeneratorPanel.jsx
│       ├── PasswordInput.jsx
│       ├── StrengthMeter.jsx
│       └── Suggestions.jsx
├── public/                  ← Favicons and static assets
├── tests/
│   └── test_analyzer.py      ← 54 pytest tests
├── index.html               ← Web entrypoint
├── vite.config.js           ← Vite configuration
├── package.json             ← Node dependencies & scripts
├── pyproject.toml           ← Python package configuration
├── requirements.txt         ← Python dependencies
├── vercel.json              ← Production Vercel deployment configuration
└── README.md
```

---

## How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Set Up Python Environment

```bash
# From the project root
python3 -m venv .venv
source .venv/bin/activate    # Linux/macOS
# .venv\Scripts\activate     # Windows

pip install -r requirements.txt
```

### 2. Run Tests

```bash
pytest tests/ -v
```

### 3. Run the CLI

```bash
# Analyze a password
python -m cli.main analyze --password "YourPassword123!"

# Interactive mode (prompts for password)
python -m cli.main analyze

# Generate a password
python -m cli.main generate --length 20
python -m cli.main generate --length 16 --exclude-ambiguous
```

### 4. Start the Local API Server

```bash
source .venv/bin/activate
uvicorn api.index:app --reload --host 0.0.0.0 --port 8000
```

The API is available at `http://localhost:8000`.

### 5. Start the Web Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deployment on Vercel

The project is structured for zero-configuration deployment on Vercel:

1. Import the repository in Vercel
2. Leave all settings at their defaults
3. Vercel automatically builds the Vite frontend into dist/ and deploys the Python FastAPI backend as a serverless function in api/index.py

---

## Strength Score Calculation

The analyzer computes a score from 0 to 100 based on individual checks plus an entropy bonus:

| Check | Points | Details |
|-------|--------|---------|
| Length >= 8 | 10 | +5 bonus at >= 12, +5 more at >= 16 (max 20) |
| Has uppercase | 5 | At least one A–Z |
| Has lowercase | 5 | At least one a–z |
| Has digits | 5 | At least one 0–9 |
| Has symbols | 10 | At least one special character |
| No repeated chars | 10 | Deducted if 3+ identical consecutive chars (aaa) |
| No sequential patterns | 10 | Detects abc, 123, cba, 321 (3+ run) |
| No keyboard walks | 10 | Detects qwerty, asdf, zxcv (4+ run) |
| Not a common password | 15 | Checked against top 10K leaked passwords |
| Entropy bonus | 0–20 | Linear: 0 at <= 20 bits, 20 at >= 80 bits |

Total possible: 100

### Category Thresholds

| Score | Category |
|-------|----------|
| 0–39 | Weak |
| 40–69 | Medium |
| 70–100 | Strong |

### Safety Clamps
- Passwords shorter than 8 characters are capped at Weak (max 35)
- Passwords found in the common-password list are capped at Weak (max 35)

---

## Entropy Calculation

Entropy is calculated using Shannon's formula:

```
entropy = length × log₂(pool_size)
```

Where pool_size is determined by which character classes are present:

| Character Class | Pool Size |
|----------------|-----------|
| Lowercase (a–z) | 26 |
| Uppercase (A–Z) | 26 |
| Digits (0–9) | 10 |
| Symbols | 32 |

Example: A 12-character password using lowercase + uppercase + digits:
`entropy = 12 × log₂(62) ≈ 71.45 bits`

---

## Crack-Time Assumptions

Crack time is estimated under two attack scenarios:

| Scenario | Guesses/Second | Represents |
|----------|---------------|------------|
| Online (throttled) | 10³ (1,000) | Rate-limited login with captchas/lockouts |
| Offline (GPU) | 10⁹ (1 billion) | Attacker has password hashes, modern GPU rig |

Formula: `time = 2^(entropy - 1) / guesses_per_second`

---

## Implemented Features

- Password Generator — configurable length, character-set toggles, exclude ambiguous characters (O0l1I|)
- Entropy Calculation — displayed with mathematical formula breakdown
- Crack-Time Estimates — dual attack scenario estimations
- Live Entropy Waveform — real-time signature audio/noise waveform animation reacting to password strength
- Two-Column Split Layout — dedicated analyzer on left, generator on right
- One-Click Copy — instant clipboard copying with visual confirmation
- Stronger Version Hint — suggests a stronger variant of weak passwords
- Dark Obsidian/Vault Theme — sleek, high-contrast dark design with subtle ambient background motion
- Vercel Serverless Ready — unified single-directory fullstack configuration
- 54/54 Unit Tests Passing — complete edge case coverage
