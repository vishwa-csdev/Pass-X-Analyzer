"""
Password generator.

Uses the `secrets` module for cryptographically secure random generation.
Guarantees at least one character from each selected character class.
"""

from __future__ import annotations

import secrets
import string
from packages.core.models import GeneratorOptions, GeneratedPassword


# Characters considered ambiguous
AMBIGUOUS_CHARS = set("O0l1I|")


def generate_password(options: GeneratorOptions | None = None) -> GeneratedPassword:
    """
    Generate a strong random password.

    Args:
        options: Generator configuration. Uses sensible defaults if None.

    Returns:
        GeneratedPassword with the password and metadata.
    """
    if options is None:
        options = GeneratorOptions()

    # Build character pool
    pool = ""
    required_chars: list[str] = []  # One guaranteed char per class
    classes_used: list[str] = []

    if options.use_lowercase:
        chars = string.ascii_lowercase
        if options.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARS)
        pool += chars
        required_chars.append(secrets.choice(chars))
        classes_used.append("lowercase")

    if options.use_uppercase:
        chars = string.ascii_uppercase
        if options.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARS)
        pool += chars
        required_chars.append(secrets.choice(chars))
        classes_used.append("uppercase")

    if options.use_digits:
        chars = string.digits
        if options.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARS)
        pool += chars
        required_chars.append(secrets.choice(chars))
        classes_used.append("digits")

    if options.use_symbols:
        chars = string.punctuation
        if options.exclude_ambiguous:
            chars = "".join(c for c in chars if c not in AMBIGUOUS_CHARS)
        pool += chars
        required_chars.append(secrets.choice(chars))
        classes_used.append("symbols")

    # Edge case: no character classes selected → fall back to lowercase
    if not pool:
        pool = string.ascii_lowercase
        required_chars.append(secrets.choice(pool))
        classes_used.append("lowercase")

    # Ensure length is at least enough to hold required chars
    length = max(options.length, len(required_chars))

    # Fill remaining slots randomly from the full pool
    remaining = length - len(required_chars)
    random_chars = [secrets.choice(pool) for _ in range(remaining)]

    # Combine and shuffle
    all_chars = required_chars + random_chars
    # Fisher-Yates shuffle using secrets for uniform randomness
    for i in range(len(all_chars) - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        all_chars[i], all_chars[j] = all_chars[j], all_chars[i]

    password = "".join(all_chars)

    return GeneratedPassword(
        password=password,
        length=len(password),
        character_sets=classes_used,
        analysis=None,  # Caller can attach analysis if desired
    )
