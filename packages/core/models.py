"""
Data models for the password analyzer.

All structured results are plain dataclasses — no framework dependency.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class CheckResult:
    """Result of a single password check."""

    name: str  # e.g. "length", "uppercase"
    label: str  # Human-readable label, e.g. "Minimum 8 characters"
    passed: bool
    detail: str  # Explanation, e.g. "Password has 12 characters"
    points: int  # Points awarded (0 if failed)
    max_points: int  # Maximum possible points for this check


@dataclass
class CrackTimeEstimate:
    """Crack-time estimate under a specific attack scenario."""

    scenario: str  # e.g. "Online (throttled)", "Offline (GPU)"
    guesses_per_second: float
    seconds: float
    display: str  # Human-readable, e.g. "3 centuries"


@dataclass
class AnalysisResult:
    """Complete result of analyzing a password."""

    password_length: int
    score: int  # 0–100
    max_score: int  # always 100
    category: str  # "Weak", "Medium", "Strong"
    checks: List[CheckResult]
    suggestions: List[str]
    entropy_bits: float
    entropy_formula: str  # e.g. "log2(62^12) = 71.45 bits"
    crack_times: List[CrackTimeEstimate]
    stronger_version: Optional[str] = None  # A suggested stronger password


@dataclass
class GeneratorOptions:
    """Options for the password generator."""

    length: int = 16
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    exclude_ambiguous: bool = False  # Exclude O, 0, l, 1, I, |


@dataclass
class GeneratedPassword:
    """Result of password generation."""

    password: str
    length: int
    character_sets: List[str]  # Which sets were used
    analysis: Optional[AnalysisResult] = None  # Analysis of the generated password
