"""
Individual password checks.

Each check function takes a password string and returns a CheckResult.
"""

from __future__ import annotations

import re
import os
from typing import Set

from packages.core.models import CheckResult

# ---------------------------------------------------------------------------
# Common-password set (loaded once at module level)
# ---------------------------------------------------------------------------

_COMMON_PASSWORDS: Set[str] = set()
_INDIC_BLOCKLIST: Set[str] = set()


def _load_common_passwords() -> Set[str]:
    """Load the common-passwords word list from the bundled data file."""
    global _COMMON_PASSWORDS
    if _COMMON_PASSWORDS:
        return _COMMON_PASSWORDS

    data_path = os.path.join(os.path.dirname(__file__), "data", "common_passwords.txt")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            _COMMON_PASSWORDS = {line.strip().lower() for line in f if line.strip()}
    except FileNotFoundError:
        _COMMON_PASSWORDS = set()

    return _COMMON_PASSWORDS


def _load_indic_blocklist() -> Set[str]:
    """Load normalized, culturally salient Indic password tokens."""
    global _INDIC_BLOCKLIST
    if _INDIC_BLOCKLIST:
        return _INDIC_BLOCKLIST

    data_path = os.path.join(os.path.dirname(__file__), "data", "indic_blocklist.txt")
    try:
        with open(data_path, "r", encoding="utf-8") as f:
            _INDIC_BLOCKLIST = {
                re.sub(r"[^a-z0-9]", "", line.strip().lower())
                for line in f
                if line.strip() and not line.lstrip().startswith("#")
            }
    except FileNotFoundError:
        _INDIC_BLOCKLIST = set()

    return _INDIC_BLOCKLIST


def _normalize_indic_candidate(password: str) -> str:
    """Remove separators and fold common leetspeak for blocklist matching."""
    normalized = password.lower().translate(str.maketrans({"0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s"}))
    return re.sub(r"[^a-z0-9]", "", normalized)


def _contains_indic_token(password: str) -> str | None:
    """Return the matched Indic token, including simple digit/symbol mutations."""
    normalized = _normalize_indic_candidate(password)
    raw_normalized = re.sub(r"[^a-z0-9]", "", password.lower())

    for token in _load_indic_blocklist():
        if not token:
            continue
        if normalized == token:
            return token

        if raw_normalized.startswith(token) or raw_normalized.endswith(token):
            remainder = raw_normalized[len(token):] if raw_normalized.startswith(token) else raw_normalized[:-len(token)]
            if not remainder or (len(remainder) <= 4 and (remainder.isdigit() or not remainder.isalnum())):
                return token

    return None


# ---------------------------------------------------------------------------
# Keyboard-walk patterns
# ---------------------------------------------------------------------------

KEYBOARD_ROWS = [
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
    "1234567890",
]

# Also include reversed rows
KEYBOARD_PATTERNS = []
for row in KEYBOARD_ROWS:
    KEYBOARD_PATTERNS.append(row)
    KEYBOARD_PATTERNS.append(row[::-1])


# ---------------------------------------------------------------------------
# Sequential character helpers
# ---------------------------------------------------------------------------

def _has_sequential_run(password: str, min_run: int = 3) -> bool:
    """
    Detect runs of 3+ sequential characters (ascending or descending).
    Works on the ordinal values — catches abc, 123, cba, 321, etc.
    """
    if len(password) < min_run:
        return False

    pw_lower = password.lower()
    asc_run = 1
    desc_run = 1

    for i in range(1, len(pw_lower)):
        diff = ord(pw_lower[i]) - ord(pw_lower[i - 1])
        if diff == 1:
            asc_run += 1
            desc_run = 1
        elif diff == -1:
            desc_run += 1
            asc_run = 1
        else:
            asc_run = 1
            desc_run = 1

        if asc_run >= min_run or desc_run >= min_run:
            return True

    return False


def _has_keyboard_walk(password: str, min_run: int = 4) -> bool:
    """
    Detect keyboard-walk patterns of length >= min_run.
    Checks substrings of the password against known keyboard rows.
    """
    if len(password) < min_run:
        return False

    pw_lower = password.lower()

    for pattern in KEYBOARD_PATTERNS:
        # Check if any substring of length >= min_run matches a keyboard row substring
        for length in range(min_run, len(pw_lower) + 1):
            for start in range(len(pw_lower) - length + 1):
                substring = pw_lower[start : start + length]
                if substring in pattern:
                    return True
    return False


# ---------------------------------------------------------------------------
# Check functions
# ---------------------------------------------------------------------------


def check_length(password: str) -> CheckResult:
    """Check password length (min 8, bonus at 12 and 16)."""
    length = len(password)

    if length >= 16:
        points = 20
        detail = f"Excellent! Password has {length} characters (≥ 16)"
    elif length >= 12:
        points = 15
        detail = f"Good — password has {length} characters (≥ 12)"
    elif length >= 8:
        points = 10
        detail = f"Password has {length} characters (≥ 8)"
    else:
        points = 0
        detail = f"Password has only {length} character{'s' if length != 1 else ''} (minimum 8 required)"

    return CheckResult(
        name="length",
        label="Minimum 8 characters",
        passed=length >= 8,
        detail=detail,
        points=points,
        max_points=20,
    )


def check_uppercase(password: str) -> CheckResult:
    """Check for at least one uppercase letter."""
    has_upper = any(c.isupper() for c in password)
    return CheckResult(
        name="uppercase",
        label="Contains uppercase letter",
        passed=has_upper,
        detail="Contains uppercase letters" if has_upper else "No uppercase letters found",
        points=5 if has_upper else 0,
        max_points=5,
    )


def check_lowercase(password: str) -> CheckResult:
    """Check for at least one lowercase letter."""
    has_lower = any(c.islower() for c in password)
    return CheckResult(
        name="lowercase",
        label="Contains lowercase letter",
        passed=has_lower,
        detail="Contains lowercase letters" if has_lower else "No lowercase letters found",
        points=5 if has_lower else 0,
        max_points=5,
    )


def check_digits(password: str) -> CheckResult:
    """Check for at least one digit."""
    has_digit = any(c.isdigit() for c in password)
    return CheckResult(
        name="digits",
        label="Contains a number",
        passed=has_digit,
        detail="Contains digits" if has_digit else "No digits found",
        points=5 if has_digit else 0,
        max_points=5,
    )


def check_symbols(password: str) -> CheckResult:
    """Check for at least one symbol (non-alphanumeric printable character)."""
    symbol_pattern = re.compile(r'[^a-zA-Z0-9\s]')
    has_symbol = bool(symbol_pattern.search(password))
    return CheckResult(
        name="symbols",
        label="Contains a symbol",
        passed=has_symbol,
        detail="Contains special characters" if has_symbol else "No special characters found",
        points=10 if has_symbol else 0,
        max_points=10,
    )


def check_repeated_chars(password: str) -> CheckResult:
    """Check for 3+ identical consecutive characters (e.g. 'aaa', '111')."""
    has_repeats = bool(re.search(r'(.)\1{2,}', password))
    return CheckResult(
        name="repeated_chars",
        label="No repeated characters (3+)",
        passed=not has_repeats,
        detail=(
            "Contains repeated characters (3+ identical in a row)"
            if has_repeats
            else "No problematic character repetition"
        ),
        points=0 if has_repeats else 10,
        max_points=10,
    )


def check_sequential(password: str) -> CheckResult:
    """Check for sequential character patterns (abc, 123, cba, 321)."""
    has_seq = _has_sequential_run(password)
    return CheckResult(
        name="sequential",
        label="No sequential patterns",
        passed=not has_seq,
        detail=(
            "Contains sequential characters (e.g. abc, 123)"
            if has_seq
            else "No sequential patterns detected"
        ),
        points=0 if has_seq else 10,
        max_points=10,
    )


def check_keyboard_walks(password: str) -> CheckResult:
    """Check for keyboard-walk patterns (qwerty, asdf, zxcv)."""
    has_walk = _has_keyboard_walk(password)
    return CheckResult(
        name="keyboard_walk",
        label="No keyboard-walk patterns",
        passed=not has_walk,
        detail=(
            "Contains a keyboard-walk pattern (e.g. qwerty, asdf)"
            if has_walk
            else "No keyboard-walk patterns detected"
        ),
        points=0 if has_walk else 10,
        max_points=10,
    )


def check_common_password(password: str) -> CheckResult:
    """Check if the password is in the common-passwords list."""
    common = _load_common_passwords()
    is_common = password.lower() in common
    return CheckResult(
        name="common_password",
        label="Not a common password",
        passed=not is_common,
        detail=(
            "This is a commonly used password — it will be one of the first guesses an attacker tries"
            if is_common
            else "Not found in the common-passwords list"
        ),
        points=0 if is_common else 15,
        max_points=15,
    )


def check_indic_password(password: str) -> CheckResult:
    """Reject high-salience Indic tokens and their predictable mutations."""
    matched_token = _contains_indic_token(password)
    return CheckResult(
        name="indic_password",
        label="Avoid common Indic password patterns",
        passed=matched_token is None,
        detail=(
            f"Contains a high-risk Indic token or predictable mutation ({matched_token})"
            if matched_token
            else "No high-risk Indic token pattern detected"
        ),
        points=15 if matched_token is None else 0,
        max_points=15,
    )


# ---------------------------------------------------------------------------
# Convenience: run all checks
# ---------------------------------------------------------------------------

ALL_CHECKS = [
    check_length,
    check_uppercase,
    check_lowercase,
    check_digits,
    check_symbols,
    check_repeated_chars,
    check_sequential,
    check_keyboard_walks,
    check_common_password,
    check_indic_password,
]


def run_all_checks(password: str) -> list[CheckResult]:
    """Run every check and return the list of results."""
    return [check(password) for check in ALL_CHECKS]
