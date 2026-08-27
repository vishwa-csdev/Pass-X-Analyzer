<p align="center">
  <a href="https://pass-x-analyzer.vercel.app">
    <img src="https://readme-typing-svg.demolab.com?font=VT323&size=42&duration=2500&pause=1200&color=39FF88&background=05070A&center=true&vCenter=true&width=650&height=90&lines=Pass-X-+Analyzer;Password+Strength+Analyzer;Entropy+-+Crack-Time+-+Generator" alt="Pass-X-Analyzer">
  </a>
</p>

<p align="center">
  <b>Password Strength Analyzer</b> — real-time scoring, entropy calculation, crack-time estimation, and secure password generation.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/python-3.10%2B-3776AB?logo=python&logoColor=white" alt="Python 3.10+">
  <img src="https://img.shields.io/badge/node-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+">
  <img src="https://img.shields.io/badge/FastAPI-backend-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-frontend-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/tests-61%2F61_passing-brightgreen?logo=pytest&logoColor=white" alt="Tests Passing">
  <img src="https://img.shields.io/badge/deployed_on-Vercel-000000?logo=vercel&logoColor=white" alt="Deployed on Vercel">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Editor-Code_--_OSS-2C2C32?logo=visual-studio-code&logoColor=39FF88" alt="Code - OSS">
  <img src="https://img.shields.io/badge/Agent-Antigravity-1B1035?logoColor=39FF88" alt="Antigravity">
  <img src="https://img.shields.io/badge/OS-CachyOS-05070A?logo=cachyos&logoColor=39FF88" alt="CachyOS">
</p>

<p align="center">
  <a href="https://pass-x-analyzer.vercel.app"><b>Live Demo</b></a>
</p>


---

## Technologies Used

| Layer          | Technology         | Purpose                                                                        |
| -------------- | ------------------ | ------------------------------------------------------------------------------ |
| **Core Logic** | Python 3.10+       | Scoring, entropy, crack-time, pattern detection, dictionary checks, generation |
| **CLI**        | Python `argparse`  | Terminal-based password analysis and generation                                |
| **API**        | FastAPI + Pydantic | Stateless REST API (`/analyze`, `/generate`) with Vercel serverless support     |
| **Frontend**   | React 19 + Vite    | Responsive, split-layout UI with fast HMR                                      |
| **Styling**    | Tailwind CSS 4     | Utility-first dark theme (Obsidian / Vault design system)                      |
| **Animation**  | Framer Motion      | Spring-based micro-animations and live entropy waveform                        |
| **Testing**    | pytest             | 61 unit tests covering edge cases                                              |

---

## Repo Structure

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
│           ├── common_passwords.txt  ← Top 10K common passwords
│           └── indic_blocklist.txt   ← Curated Indic high-salience tokens
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
│   └── test_analyzer.py     ← 61 pytest tests
├── index.html               ← Web entrypoint
├── vite.config.js           ← Vite configuration
├── package.json             ← Node dependencies & scripts
├── pyproject.toml           ← Python package configuration
├── requirements.txt         ← Python dependencies
└── vercel.json              ← Production Vercel deployment configuration
```

---

## How to Run

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**

### 1. Set Up the Python Environment

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

The API will be available at `http://localhost:8000`.

### 5. Start the Web Frontend

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Deployment on Vercel

The project is structured for zero-configuration deployment on Vercel:

1. Import the repository in [Vercel](https://vercel.com/new).
2. Leave all settings at their defaults.
3. Vercel automatically builds the Vite frontend (into `dist/`) and deploys the Python FastAPI backend as a serverless function (`api/index.py`).

After deployment, no local server or Python process is needed. The deployed frontend calls
the deployed `/api` function automatically. Set the `FRONTEND_ORIGINS` environment variable
only when hosting the frontend on a separate domain; a single Vercel project uses same-origin
requests and needs no CORS configuration.

The API includes a lightweight per-instance request limit and production security headers.
For high-traffic use, add a distributed rate limiter at the edge or through an API gateway,
because serverless instance memory is not shared across all invocations.

---

## How the Strength Score Is Calculated

The analyzer computes a score from 0 to 100 based on individual checks plus an entropy bonus:

| Check                      | Points | Details                                             |
| --------------------------- | ------ | ---------------------------------------------------- |
| **Length ≥ 8**              | 10     | +5 bonus at ≥ 12, +5 more at ≥ 16 (max 20)           |
| **Has uppercase**           | 5      | At least one A–Z                                     |
| **Has lowercase**           | 5      | At least one a–z                                     |
| **Has digits**              | 5      | At least one 0–9                                     |
| **Has symbols**             | 10     | At least one special character                       |
| **No repeated chars**       | 10     | Deducted if 3+ identical consecutive chars (`aaa`)   |
| **No sequential patterns**  | 10     | Detects `abc`, `123`, `cba`, `321` (3+ run)          |
| **No keyboard walks**       | 10     | Detects `qwerty`, `asdf`, `zxcv` (4+ run)            |
| **Not a common password**   | 15     | Checked against top 10K leaked passwords             |
| **Entropy bonus**           | 0–20   | Linear: 0 at ≤ 20 bits, 20 at ≥ 80 bits              |

**Total possible: 100**

### Category Thresholds

| Score  | Category      |
| ------ | ------------- |
| 0–39   | **Weak**   |
| 40–69  | **Medium** |
| 70–100 | **Strong** |

### Safety Clamps

- Passwords **shorter than 8 characters** are always capped at "Weak" (max 35)
- Passwords found in the **common-password list** are always capped at "Weak" (max 35)
- Passwords matching a high-salience **Indic token or simple mutation** are always capped at "Weak" (max 35)

### Indic-Aware Protection

The backend includes a separate Indic-aware blocklist for culturally salient religious terms, names, cities, cricket figures, film references, and vehicle brands. It also catches common constructions such as appending up to four digits or symbols and basic leetspeak substitutions. The seed list is intentionally stored as a reviewable data file so it can be expanded with provenance-documented entries from local password research without changing the scoring code. This protection complements the HIBP Pwned Passwords check; it is not a replacement for checking the exact password against breach data.

---

## Entropy Calculation

Entropy is calculated using Shannon's formula:

```
entropy = length × log₂(pool_size)
```

Where `pool_size` is determined by which character classes are present:

| Character Class  | Pool Size |
| ----------------- | --------- |
| Lowercase (a–z)   | 26        |
| Uppercase (A–Z)   | 26        |
| Digits (0–9)      | 10        |
| Symbols           | 32        |

**Example:** A 12-character password using lowercase + uppercase + digits: `entropy = 12 × log₂(62) ≈ 71.45 bits`

---

## Crack-Time Assumptions

Crack time is estimated under two attack scenarios:

| Scenario                | Guesses/Second   | Represents                                    |
| ------------------------ | ---------------- | ----------------------------------------------- |
| **Online (throttled)**  | 10³ (1,000)      | Rate-limited login with captchas/lockouts       |
| **Offline (GPU)**       | 10⁹ (1 billion)  | Attacker has password hashes, modern GPU rig    |

Formula: `time = 2^(entropy - 1) / guesses_per_second`

---

## Bonus Features Implemented

- **Password Generator** — configurable length, character-set toggles, exclude ambiguous characters (`O0l1I|`)
- **Entropy Calculation** — displayed with mathematical formula breakdown
- **Crack-Time Estimates** — dual attack scenario estimations
- **Live Entropy Waveform** — real-time signature audio/noise waveform animation reacting to password strength
- **Two-Column Split Layout** — dedicated analyzer on left, generator on right
- **One-Click Copy** — instant clipboard copying with visual confirmation
- **Stronger Version Hint** — suggests a stronger variant of weak passwords
- **Dark Obsidian/Vault Theme** — sleek, high-contrast dark design with subtle ambient background motion
- **Vercel Serverless Ready** — unified single-directory fullstack configuration
- **54/54 Unit Tests Passing** — complete edge case coverage

---

<p align="center">
  Made by <a href="https://github.com/vishwa-csdev">vishwa-csdev</a>
</p>
