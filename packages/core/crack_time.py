"""
Crack-time estimation.

Estimates how long it would take to brute-force a password given its entropy,
under two attack scenarios:

1. Online (throttled):  10³ guesses/second
   (rate-limited login endpoint, captchas, lockouts)

2. Offline (GPU):       10⁹ guesses/second
   (attacker has the hashed password database, using a modern GPU rig)

The total keyspace is 2^entropy_bits, and on average an attacker needs
to try half the keyspace: time = 2^(entropy-1) / guesses_per_second
"""

from __future__ import annotations

import math
from packages.core.models import CrackTimeEstimate


# Attack scenarios: (name, guesses_per_second)
ATTACK_SCENARIOS = [
    ("Online (throttled — 1K guesses/sec)", 1e3),
    ("Offline (GPU — 1B guesses/sec)", 1e9),
]


def _format_duration(seconds: float) -> str:
    """Format a duration in seconds to a human-readable string."""
    if seconds < 0.001:
        return "instant"
    if seconds < 1:
        return f"{seconds * 1000:.0f} milliseconds"
    if seconds < 60:
        return f"{seconds:.1f} seconds"
    if seconds < 3600:
        minutes = seconds / 60
        return f"{minutes:.1f} minutes"
    if seconds < 86400:
        hours = seconds / 3600
        return f"{hours:.1f} hours"
    if seconds < 86400 * 365.25:
        days = seconds / 86400
        if days < 30:
            return f"{days:.0f} days"
        months = days / 30.44
        if months < 12:
            return f"{months:.0f} months"
        return f"{days / 365.25:.1f} years"

    years = seconds / (86400 * 365.25)
    if years < 1000:
        return f"{years:.0f} years"
    if years < 1e6:
        return f"{years / 1000:.0f} thousand years"
    if years < 1e9:
        return f"{years / 1e6:.0f} million years"
    if years < 1e12:
        return f"{years / 1e9:.0f} billion years"
    return f"{years / 1e12:.0f} trillion years"


def estimate_crack_time(entropy_bits: float) -> list[CrackTimeEstimate]:
    """
    Estimate crack time under each attack scenario.

    Uses: time = 2^(entropy - 1) / guesses_per_second
    (half the keyspace on average).
    """
    if entropy_bits <= 0:
        return [
            CrackTimeEstimate(
                scenario=name,
                guesses_per_second=gps,
                seconds=0.0,
                display="instant",
            )
            for name, gps in ATTACK_SCENARIOS
        ]

    results = []
    for name, gps in ATTACK_SCENARIOS:
        # 2^(entropy - 1) / gps
        try:
            log_seconds = (entropy_bits - 1) * math.log(2) - math.log(gps)
            seconds = math.exp(log_seconds)
        except OverflowError:
            seconds = float("inf")

        results.append(
            CrackTimeEstimate(
                scenario=name,
                guesses_per_second=gps,
                seconds=seconds,
                display=_format_duration(seconds),
            )
        )

    return results
