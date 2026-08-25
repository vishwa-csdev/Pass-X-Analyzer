# Pass-X Analyzer

> **Password Strength Analyzer** — Real-time scoring, entropy calculation, crack-time estimation, and secure password generation.

Built for the Andropedia Technical Recruitment 2026 — Round 1.

---

## 🚀 Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Core Logic** | Python 3.10+ | Scoring, entropy, crack-time, pattern detection, dictionary checks, generation |
| **CLI** | Python `argparse` | Terminal-based password analysis and generation |
| **API** | FastAPI + Pydantic | Stateless REST API (`/analyze`, `/generate`) |
| **Frontend** | React 18 + Vite | Component-based UI with fast HMR |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **Animation** | Framer Motion | Spring-based micro-animations |
| **Testing** | pytest | 54 unit tests covering edge cases |

---

## 📁 Repo Structure

```
Pass-X-Analyzer/
├── packages/
│   └── core/               ← Python core: scoring, entropy, crack-time, checks, generator
│       ├── analyzer.py      ← Main orchestrator
│       ├── checks.py        ← Individual check functions
│       ├── entropy.py       ← Entropy calculation
│       ├── crack_time.py    ← Crack-time estimation
│       ├── generator.py     ← Password generator (secrets module)
│       ├── suggestions.py   ← Suggestion engine
│       ├── models.py        ← Dataclasses (no framework dependency)
│       └── data/
│           └── common_passwords.txt  ← Top 10K common passwords
├── apps/
│   ├── cli/
│   │   └── main.py          ← CLI wrapper (argparse)
│   ├── server/
│   │   └── main.py          ← FastAPI server
│   └── web/
│       └── src/             ← React + Vite frontend
│           ├── App.jsx
│           ├── api.js
│           ├── index.css
│           └── components/
│               ├── PasswordInput.jsx
│               ├── StrengthMeter.jsx
│               ├── Checklist.jsx
│               ├── Suggestions.jsx
│               ├── EntropyDisplay.jsx
│               └── GeneratorPanel.jsx
├── tests/
│   └── test_analyzer.py     ← 54 pytest tests
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## ⚡ How to Run

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** (for the web frontend)

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
python -m pytest tests/ -v
```

### 3. Run the CLI

```bash
# Analyze a password
python -m apps.cli.main analyze --password "YourPassword123!"

# Interactive mode (prompts for password)
python -m apps.cli.main analyze

# Generate a password
python -m apps.cli.main generate --length 20
python -m apps.cli.main generate --length 16 --exclude-ambiguous
```

### 4. Start the API Server

```bash
source .venv/bin/activate
uvicorn apps.server.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 5. Start the Web Frontend

```bash
cd apps/web
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

> **Both the API server and Vite dev server must be running simultaneously** for the web UI to work.

---

## 🧮 How the Strength Score Is Calculated

The analyzer computes a score from 0 to 100 based on individual checks plus an entropy bonus:

| Check | Points | Details |
|-------|--------|---------|
| **Length ≥ 8** | 10 | +5 bonus at ≥ 12, +5 more at ≥ 16 (max 20) |
| **Has uppercase** | 5 | At least one A–Z |
| **Has lowercase** | 5 | At least one a–z |
| **Has digits** | 5 | At least one 0–9 |
| **Has symbols** | 10 | At least one special character |
| **No repeated chars** | 10 | Deducted if 3+ identical consecutive chars (`aaa`) |
| **No sequential patterns** | 10 | Detects `abc`, `123`, `cba`, `321` (3+ run) |
| **No keyboard walks** | 10 | Detects `qwerty`, `asdf`, `zxcv` (4+ run) |
| **Not a common password** | 15 | Checked against top 10K leaked passwords |
| **Entropy bonus** | 0–20 | Linear: 0 at ≤ 20 bits, 20 at ≥ 80 bits |

**Total possible: 100**

### Category Thresholds

| Score | Category |
|-------|----------|
| 0–39 | 🔴 **Weak** |
| 40–69 | 🟡 **Medium** |
| 70–100 | 🟢 **Strong** |

### Safety Clamps
- Passwords **shorter than 8 characters** are always capped at "Weak" (max 35)
- Passwords found in the **common-password list** are always capped at "Weak" (max 35)

---

## 📐 Entropy Calculation

Entropy is calculated using Shannon's formula:

```
entropy = length × log₂(pool_size)
```

Where `pool_size` is determined by which character classes are present:

| Character Class | Pool Size |
|----------------|-----------|
| Lowercase (a–z) | 26 |
| Uppercase (A–Z) | 26 |
| Digits (0–9) | 10 |
| Symbols | 32 |

**Example:** A 12-character password using lowercase + uppercase + digits:
`entropy = 12 × log₂(62) ≈ 71.45 bits`

---

## ⏱ Crack-Time Assumptions

Crack time is estimated under two attack scenarios:

| Scenario | Guesses/Second | Represents |
|----------|---------------|------------|
| **Online (throttled)** | 10³ (1,000) | Rate-limited login with captchas/lockouts |
| **Offline (GPU)** | 10⁹ (1 billion) | Attacker has password hashes, modern GPU rig |

Formula: `time = 2^(entropy - 1) / guesses_per_second`

(Using half the keyspace for average-case brute force.)

---

## 🎁 Bonus Features Implemented

- ✅ **Password Generator** — configurable length, character-set toggles, exclude ambiguous characters (`O0l1I|`)
- ✅ **Entropy Calculation** — displayed with the formula used
- ✅ **Crack-Time Estimates** — two scenarios with stated assumptions
- ✅ **Full Web Application** — React + Vite with responsive design
- ✅ **Copy to Clipboard** — one-click copy on generated passwords
- ✅ **Stronger Version Hint** — suggests a stronger variant of weak passwords
- ✅ **Animated UI** — Framer Motion spring animations on the strength meter, checklist, and panels
- ✅ **Dark Glassmorphism Theme** — premium visual design with backdrop blur and subtle gradients
- ✅ **Responsive Layout** — mobile-first, single column → two-column at 768px+
- ✅ **Edge-Case Handling** — empty input, 1–2 chars, digits-only, repeated chars, leaked passwords

---

## 📝 Important Assumptions

1. **No persistent state** — the API is fully stateless; no passwords are stored or logged.
2. **Common-password list** — sourced from SecLists top 10K most common passwords (case-insensitive matching).
3. **Entropy model** — assumes uniform random character selection per class. Real-world entropy may be lower for human-chosen passwords.
4. **Crack-time estimates** — theoretical best-case for the attacker; actual times depend on hashing algorithm, salting, hardware, and attack strategy.
5. **Password generator** — uses Python's `secrets` module (cryptographically secure PRNG).
6. **CORS** — the API allows requests from `localhost:5173` for local development.

---

## 🧪 Test Coverage

54 tests covering:
- Empty/short input edge cases
- Single character-class passwords
- Repeated character detection
- Sequential pattern detection (ascending + descending)
- Keyboard-walk detection
- Common-password lookup (case-insensitive)
- Length bonus tiers
- Entropy calculation correctness
- Crack-time estimation ranges
- Full integration analysis
- Generator output validation (length, character classes, ambiguous exclusion)

---

