"""
Entropy calculation for passwords.

Uses Shannon entropy based on the character pool size and password length:
    entropy = length × log₂(pool_size)

Pool size is determined by which character classes appear in the password:
    - Lowercase letters: 26
    - Uppercase letters: 26
    - Digits: 10
    - Symbols: 32
"""

from __future__ import annotations

import math
import re


def calculate_entropy(password: str) -> tuple[float, str]:
    """
    Calculate the entropy of a password in bits.

    Returns:
        (entropy_bits, formula_string)
        e.g. (71.45, "log₂(62¹²) = 71.45 bits")
    """
    if not password:
        return 0.0, "Empty password — 0 bits"

    length = len(password)

    # Determine pool size based on character classes present
    pool_size = 0
    classes_used = []

    if re.search(r'[a-z]', password):
        pool_size += 26
        classes_used.append("lowercase(26)")
    if re.search(r'[A-Z]', password):
        pool_size += 26
        classes_used.append("uppercase(26)")
    if re.search(r'[0-9]', password):
        pool_size += 10
        classes_used.append("digits(10)")
    if re.search(r'[^a-zA-Z0-9\s]', password):
        pool_size += 32
        classes_used.append("symbols(32)")

    # Fallback for whitespace-only or other edge cases
    if pool_size == 0:
        pool_size = 1

    entropy = length * math.log2(pool_size)
    entropy = round(entropy, 2)

    # Build a human-readable formula string
    classes_str = " + ".join(classes_used) if classes_used else "1"
    formula = f"log₂({pool_size}^{length}) = {entropy} bits  [{classes_str}]"

    return entropy, formula


def entropy_score_bonus(entropy_bits: float) -> int:
    """
    Convert entropy bits to a bonus score (0–20).

    Linearly scaled:
        ≤ 20 bits → 0 points
        ≥ 80 bits → 20 points
    """
    if entropy_bits <= 20:
        return 0
    if entropy_bits >= 80:
        return 20

    # Linear interpolation between 20 and 80 bits
    return round((entropy_bits - 20) / (80 - 20) * 20)
