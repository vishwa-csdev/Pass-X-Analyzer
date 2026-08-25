"""
Comprehensive tests for the password analyzer.

Covers edge cases: empty input, short input, digits-only, letters-only,
repeated chars, known leaked passwords, sequential/keyboard patterns,
entropy math, generator constraints.
"""

import re
import math
import pytest

from packages.core.analyzer import analyze
from packages.core.checks import (
    check_length,
    check_uppercase,
    check_lowercase,
    check_digits,
    check_symbols,
    check_repeated_chars,
    check_sequential,
    check_keyboard_walks,
    check_common_password,
)
from packages.core.entropy import calculate_entropy, entropy_score_bonus
from packages.core.crack_time import estimate_crack_time
from packages.core.generator import generate_password
from packages.core.models import GeneratorOptions


# ============================================================================
# Edge cases — empty and very short
# ============================================================================


class TestEdgeCases:
    def test_empty_password(self):
        result = analyze("")
        assert result.score == 0
        assert result.category == "Weak"
        assert result.password_length == 0
        assert result.entropy_bits == 0.0

    def test_single_character(self):
        result = analyze("a")
        assert result.category == "Weak"
        assert result.password_length == 1
        assert result.score < 40

    def test_two_characters(self):
        result = analyze("Ab")
        assert result.category == "Weak"
        assert result.password_length == 2

    def test_whitespace_only(self):
        result = analyze("   ")
        assert result.category == "Weak"


# ============================================================================
# Character-class-only passwords
# ============================================================================


class TestSingleClass:
    def test_digits_only(self):
        result = analyze("12345678")
        # Should fail: no uppercase, no lowercase, no symbols
        # Should also fail sequential check
        assert not any(c.passed for c in result.checks if c.name == "uppercase")
        assert not any(c.passed for c in result.checks if c.name == "lowercase")
        assert not any(c.passed for c in result.checks if c.name == "symbols")

    def test_lowercase_only(self):
        result = analyze("abcdefgh")
        assert not any(c.passed for c in result.checks if c.name == "uppercase")
        assert not any(c.passed for c in result.checks if c.name == "digits")
        assert not any(c.passed for c in result.checks if c.name == "symbols")

    def test_uppercase_only(self):
        result = analyze("ABCDEFGH")
        assert not any(c.passed for c in result.checks if c.name == "lowercase")
        assert not any(c.passed for c in result.checks if c.name == "digits")


# ============================================================================
# Repeated characters
# ============================================================================


class TestRepeatedChars:
    def test_fully_repeated(self):
        result = check_repeated_chars("aaaaaaa")
        assert not result.passed

    def test_triple_repeat(self):
        result = check_repeated_chars("abcccdef")
        assert not result.passed

    def test_double_is_ok(self):
        result = check_repeated_chars("aabbccdd")
        assert result.passed

    def test_no_repeats(self):
        result = check_repeated_chars("abcdefgh")
        assert result.passed


# ============================================================================
# Sequential patterns
# ============================================================================


class TestSequential:
    def test_ascending_letters(self):
        result = check_sequential("abcdef")
        assert not result.passed

    def test_descending_letters(self):
        result = check_sequential("fedcba")
        assert not result.passed

    def test_ascending_digits(self):
        result = check_sequential("123456")
        assert not result.passed

    def test_descending_digits(self):
        result = check_sequential("654321")
        assert not result.passed

    def test_no_sequence(self):
        result = check_sequential("axbycz")
        assert result.passed

    def test_short_sequence_ok(self):
        """Two sequential chars (ab) should NOT trigger the check."""
        result = check_sequential("ab")
        assert result.passed


# ============================================================================
# Keyboard-walk patterns
# ============================================================================


class TestKeyboardWalks:
    def test_qwerty(self):
        result = check_keyboard_walks("qwerty")
        assert not result.passed

    def test_asdf(self):
        result = check_keyboard_walks("asdf")
        assert not result.passed

    def test_zxcv(self):
        result = check_keyboard_walks("zxcv")
        assert not result.passed

    def test_qwertyuiop(self):
        result = check_keyboard_walks("qwertyuiop")
        assert not result.passed

    def test_no_walk(self):
        result = check_keyboard_walks("jfkdla")
        assert result.passed


# ============================================================================
# Common passwords
# ============================================================================


class TestCommonPasswords:
    def test_password(self):
        result = check_common_password("password")
        assert not result.passed

    def test_123456(self):
        result = check_common_password("123456")
        assert not result.passed

    def test_case_insensitive(self):
        result = check_common_password("PASSWORD")
        assert not result.passed

    def test_uncommon(self):
        result = check_common_password("xK9#mP2$vL7!")
        assert result.passed


# ============================================================================
# Length checks
# ============================================================================


class TestLength:
    def test_too_short(self):
        result = check_length("abc")
        assert not result.passed
        assert result.points == 0

    def test_min_length(self):
        result = check_length("12345678")
        assert result.passed
        assert result.points == 10

    def test_bonus_12(self):
        result = check_length("a" * 12)
        assert result.points == 15

    def test_bonus_16(self):
        result = check_length("a" * 16)
        assert result.points == 20


# ============================================================================
# Entropy
# ============================================================================


class TestEntropy:
    def test_empty(self):
        bits, _ = calculate_entropy("")
        assert bits == 0.0

    def test_lowercase_only(self):
        bits, _ = calculate_entropy("abcdefgh")  # 8 chars, pool = 26
        expected = 8 * math.log2(26)
        assert abs(bits - round(expected, 2)) < 0.01

    def test_mixed_case_digits(self):
        bits, _ = calculate_entropy("Abc123")  # pool = 26+26+10 = 62
        expected = 6 * math.log2(62)
        assert abs(bits - round(expected, 2)) < 0.01

    def test_full_pool(self):
        bits, _ = calculate_entropy("Aa1!")  # pool = 26+26+10+32 = 94
        expected = 4 * math.log2(94)
        assert abs(bits - round(expected, 2)) < 0.01

    def test_entropy_bonus_low(self):
        assert entropy_score_bonus(10) == 0
        assert entropy_score_bonus(20) == 0

    def test_entropy_bonus_high(self):
        assert entropy_score_bonus(80) == 20
        assert entropy_score_bonus(100) == 20

    def test_entropy_bonus_mid(self):
        bonus = entropy_score_bonus(50)
        assert 0 < bonus < 20


# ============================================================================
# Crack time
# ============================================================================


class TestCrackTime:
    def test_zero_entropy(self):
        times = estimate_crack_time(0)
        assert all(ct.display == "instant" for ct in times)

    def test_high_entropy(self):
        times = estimate_crack_time(80)
        # 80 bits should take a very long time even offline
        offline = [ct for ct in times if "Offline" in ct.scenario][0]
        assert offline.seconds > 86400 * 365.25  # More than 1 year

    def test_two_scenarios(self):
        times = estimate_crack_time(40)
        assert len(times) == 2
        # Online should be slower (fewer guesses/sec)
        assert times[0].seconds > times[1].seconds


# ============================================================================
# Full analysis — integration
# ============================================================================


class TestFullAnalysis:
    def test_strong_password(self):
        result = analyze("X#9kL!mP2$vR7@qW")
        assert result.category == "Strong"
        assert result.score >= 70

    def test_weak_password(self):
        result = analyze("password")
        assert result.category == "Weak"
        assert result.score < 40

    def test_medium_password(self):
        result = analyze("Hello123")
        # Has length 8, upper, lower, digits, but no symbols
        assert result.category in ("Medium", "Weak")

    def test_known_leaked_password(self):
        result = analyze("qwerty")
        assert result.category == "Weak"
        # Should fail keyboard-walk AND common-password checks
        kb_check = next(c for c in result.checks if c.name == "keyboard_walk")
        common_check = next(c for c in result.checks if c.name == "common_password")
        assert not kb_check.passed
        assert not common_check.passed

    def test_suggestions_present_for_weak(self):
        result = analyze("abc")
        assert len(result.suggestions) > 0

    def test_stronger_version_for_weak(self):
        result = analyze("weak")
        assert result.stronger_version is not None
        assert len(result.stronger_version) >= 12

    def test_no_stronger_version_for_strong(self):
        result = analyze("X#9kL!mP2$vR7@qW")
        if result.category == "Strong":
            assert result.stronger_version is None


# ============================================================================
# Generator
# ============================================================================


class TestGenerator:
    def test_default_length(self):
        result = generate_password()
        assert result.length == 16
        assert len(result.password) == 16

    def test_custom_length(self):
        opts = GeneratorOptions(length=24)
        result = generate_password(opts)
        assert result.length == 24

    def test_all_classes_present(self):
        """Generated password should contain at least one char from each enabled class."""
        opts = GeneratorOptions(length=20)
        result = generate_password(opts)
        pw = result.password
        assert any(c.islower() for c in pw)
        assert any(c.isupper() for c in pw)
        assert any(c.isdigit() for c in pw)
        assert any(c in "!@#$%^&*()-_=+[]{}|;:',.<>?/`~" for c in pw)

    def test_exclude_ambiguous(self):
        opts = GeneratorOptions(length=100, exclude_ambiguous=True)
        result = generate_password(opts)
        ambiguous = set("O0l1I|")
        assert not any(c in ambiguous for c in result.password)

    def test_digits_only(self):
        opts = GeneratorOptions(
            use_uppercase=False,
            use_lowercase=False,
            use_digits=True,
            use_symbols=False,
            length=10,
        )
        result = generate_password(opts)
        assert all(c.isdigit() for c in result.password)
        assert result.length == 10

    def test_no_classes_fallback(self):
        """If all classes disabled, should fall back gracefully."""
        opts = GeneratorOptions(
            use_uppercase=False,
            use_lowercase=False,
            use_digits=False,
            use_symbols=False,
            length=8,
        )
        result = generate_password(opts)
        assert len(result.password) == 8

    def test_character_sets_reported(self):
        opts = GeneratorOptions(
            use_uppercase=True,
            use_lowercase=True,
            use_digits=False,
            use_symbols=False,
        )
        result = generate_password(opts)
        assert "uppercase" in result.character_sets
        assert "lowercase" in result.character_sets
        assert "digits" not in result.character_sets
