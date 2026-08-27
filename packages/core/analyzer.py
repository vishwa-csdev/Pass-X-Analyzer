"""
Main analyzer — orchestrates all checks, entropy, crack-time, and suggestions.
"""

from __future__ import annotations

from packages.core.checks import run_all_checks
from packages.core.entropy import calculate_entropy, entropy_score_bonus
from packages.core.crack_time import estimate_crack_time
from packages.core.suggestions import generate_suggestions, suggest_stronger_version
from packages.core.models import AnalysisResult


def _categorize(score: int) -> str:
    """Map a 0–100 score to a strength category."""
    if score >= 70:
        return "Strong"
    if score >= 40:
        return "Medium"
    return "Weak"


def analyze(password: str) -> AnalysisResult:
    """
    Analyze a password and return a comprehensive result.

    Scoring formula (documented):
        - Length ≥ 8: 10 pts (+5 at 12, +5 at 16 = max 20)
        - Has uppercase: 5 pts
        - Has lowercase: 5 pts
        - Has digits: 5 pts
        - Has symbols: 10 pts
        - No repeated chars (3+): 10 pts
        - No sequential patterns: 10 pts
        - No keyboard-walk patterns: 10 pts
        - Not a common password: 15 pts
        - Entropy bonus: 0–20 pts (linear, 20 bits→0, 80 bits→20)
        Total max: 100

    Categories:
        0–39  → Weak
        40–69 → Medium
        70–100 → Strong
    """
    # Handle empty input
    if not password:
        return AnalysisResult(
            password_length=0,
            score=0,
            max_score=100,
            category="Weak",
            checks=[],
            suggestions=["Enter a password to get started."],
            entropy_bits=0.0,
            entropy_formula="Empty password — 0 bits",
            crack_times=estimate_crack_time(0),
            stronger_version=None,
        )

    # Run all checks
    checks = run_all_checks(password)

    # Calculate base score from checks
    check_score = sum(c.points for c in checks)

    # Calculate entropy
    entropy_bits, entropy_formula = calculate_entropy(password)

    # Add entropy bonus
    bonus = entropy_score_bonus(entropy_bits)
    total_score = min(check_score + bonus, 100)

    # Clamp: passwords shorter than 8 chars can never leave "Weak"
    if len(password) < 8:
        total_score = min(total_score, 35)

    # Clamp: common or culturally predictable passwords can never leave "Weak"
    has_risky_pattern = any(
        c.name in {"common_password", "indic_password"} and not c.passed
        for c in checks
    )
    if has_risky_pattern:
        total_score = min(total_score, 35)

    # Category
    category = _categorize(total_score)

    # Suggestions
    suggestions = generate_suggestions(checks)

    # Stronger version
    stronger = suggest_stronger_version(password) if category != "Strong" else None

    # Crack-time estimates
    crack_times = estimate_crack_time(entropy_bits)

    return AnalysisResult(
        password_length=len(password),
        score=total_score,
        max_score=100,
        category=category,
        checks=checks,
        suggestions=suggestions,
        entropy_bits=entropy_bits,
        entropy_formula=entropy_formula,
        crack_times=crack_times,
        stronger_version=stronger,
    )
