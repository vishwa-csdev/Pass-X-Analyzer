"""
Pass-X-Analyzer — Core password analysis package.

Provides scoring, entropy calculation, crack-time estimation,
pattern detection, dictionary checks, and password generation.
"""

from packages.core.analyzer import analyze
from packages.core.generator import generate_password
from packages.core.models import AnalysisResult, CheckResult, GeneratorOptions, GeneratedPassword

__all__ = [
    "analyze",
    "generate_password",
    "AnalysisResult",
    "CheckResult",
    "GeneratorOptions",
    "GeneratedPassword",
]
