"""
Suggestion engine.

Takes the list of check results and generates actionable improvement
suggestions, including a "stronger version" of the entered password.
"""

from __future__ import annotations

import re
import secrets
import string
from packages.core.models import CheckResult


# Mapping from check name → suggestion text
_SUGGESTION_MAP = {
    "length": "Make your password at least 8 characters long — ideally 12 or more.",
    "uppercase": "Add at least one uppercase letter (A–Z).",
    "lowercase": "Add at least one lowercase letter (a–z).",
    "digits": "Include at least one number (0–9).",
    "symbols": "Add a special character like !@#$%^&* for extra strength.",
    "repeated_chars": "Avoid repeating the same character 3 or more times in a row (e.g. 'aaa').",
    "sequential": "Avoid sequential characters like 'abc', '123', or 'cba'.",
    "keyboard_walk": "Avoid keyboard patterns like 'qwerty', 'asdf', or 'zxcv'.",
    "common_password": "This password is too common — choose something more unique and personal.",
}


def generate_suggestions(checks: list[CheckResult]) -> list[str]:
    """Return a list of actionable suggestions based on which checks failed."""
    suggestions = []
    for check in checks:
        if not check.passed and check.name in _SUGGESTION_MAP:
            suggestions.append(_SUGGESTION_MAP[check.name])
    return suggestions


def suggest_stronger_version(password: str) -> str | None:
    """
    Generate a stronger version of the given password by adding missing
    character classes and extending length if needed.

    Returns None for empty passwords.
    """
    if not password:
        return None

    result = list(password)

    # Track what's missing
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_symbol = bool(re.search(r'[^a-zA-Z0-9\s]', password))

    # Add missing character classes at random positions
    additions = []
    if not has_upper:
        additions.append(secrets.choice(string.ascii_uppercase))
    if not has_lower:
        additions.append(secrets.choice(string.ascii_lowercase))
    if not has_digit:
        additions.append(secrets.choice(string.digits))
    if not has_symbol:
        additions.append(secrets.choice("!@#$%^&*"))

    for char in additions:
        pos = secrets.randbelow(len(result) + 1)
        result.insert(pos, char)

    # Extend to at least 12 characters
    while len(result) < 12:
        pool = string.ascii_letters + string.digits + "!@#$%^&*"
        result.append(secrets.choice(pool))

    return "".join(result)
