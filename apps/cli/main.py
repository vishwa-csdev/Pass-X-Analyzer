#!/usr/bin/env python3
"""
Pass-X-Analyzer CLI — a thin wrapper around the core analysis package.

Usage:
    python -m apps.cli.main analyze [--password PASSWORD]
    python -m apps.cli.main generate [--length N] [--no-upper] [--no-lower]
                                      [--no-digits] [--no-symbols]
                                      [--exclude-ambiguous]
"""

from __future__ import annotations

import argparse
import getpass
import sys
import os

# Ensure project root is on the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from packages.core.analyzer import analyze
from packages.core.generator import generate_password
from packages.core.models import GeneratorOptions


# ---------------------------------------------------------------------------
# ANSI color helpers
# ---------------------------------------------------------------------------

class Colors:
    RED = "\033[91m"
    YELLOW = "\033[93m"
    GREEN = "\033[92m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"


def _color_category(category: str) -> str:
    colors = {
        "Weak": Colors.RED,
        "Medium": Colors.YELLOW,
        "Strong": Colors.GREEN,
    }
    color = colors.get(category, "")
    return f"{color}{Colors.BOLD}{category}{Colors.RESET}"


def _check_icon(passed: bool) -> str:
    if passed:
        return f"{Colors.GREEN}✓{Colors.RESET}"
    return f"{Colors.RED}✗{Colors.RESET}"


# ---------------------------------------------------------------------------
# Analyze command
# ---------------------------------------------------------------------------


def cmd_analyze(args: argparse.Namespace) -> None:
    """Analyze a password and print the report."""
    if args.password:
        password = args.password
    else:
        password = getpass.getpass("Enter password to analyze: ")

    result = analyze(password)

    # Header
    print()
    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")
    print(f"{Colors.BOLD}  Pass-X Analyzer — Password Strength Report{Colors.RESET}")
    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")
    print()

    # Score & category
    bar_filled = int(result.score / 100 * 30)
    bar_empty = 30 - bar_filled
    if result.category == "Strong":
        bar_color = Colors.GREEN
    elif result.category == "Medium":
        bar_color = Colors.YELLOW
    else:
        bar_color = Colors.RED

    print(f"  Score: {Colors.BOLD}{result.score}/100{Colors.RESET}  "
          f"[{bar_color}{'█' * bar_filled}{Colors.DIM}{'░' * bar_empty}{Colors.RESET}]  "
          f"{_color_category(result.category)}")
    print()

    # Checks
    print(f"  {Colors.BOLD}Checks:{Colors.RESET}")
    for check in result.checks:
        icon = _check_icon(check.passed)
        points_str = f"{Colors.DIM}({check.points}/{check.max_points} pts){Colors.RESET}"
        print(f"    {icon} {check.label}  {points_str}")
        print(f"      {Colors.DIM}{check.detail}{Colors.RESET}")
    print()

    # Entropy
    print(f"  {Colors.BOLD}Entropy:{Colors.RESET}")
    print(f"    {Colors.CYAN}{result.entropy_bits} bits{Colors.RESET}")
    print(f"    {Colors.DIM}{result.entropy_formula}{Colors.RESET}")
    print()

    # Crack time
    print(f"  {Colors.BOLD}Estimated Crack Time:{Colors.RESET}")
    for ct in result.crack_times:
        print(f"    • {ct.scenario}: {Colors.CYAN}{ct.display}{Colors.RESET}")
    print()

    # Suggestions
    if result.suggestions:
        print(f"  {Colors.BOLD}Suggestions:{Colors.RESET}")
        for s in result.suggestions:
            print(f"    → {s}")
        print()

    # Stronger version
    if result.stronger_version:
        print(f"  {Colors.BOLD}Suggested stronger version:{Colors.RESET}")
        print(f"    {Colors.GREEN}{result.stronger_version}{Colors.RESET}")
        print()

    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")


# ---------------------------------------------------------------------------
# Generate command
# ---------------------------------------------------------------------------


def cmd_generate(args: argparse.Namespace) -> None:
    """Generate a password and print it."""
    options = GeneratorOptions(
        length=args.length,
        use_uppercase=not args.no_upper,
        use_lowercase=not args.no_lower,
        use_digits=not args.no_digits,
        use_symbols=not args.no_symbols,
        exclude_ambiguous=args.exclude_ambiguous,
    )

    result = generate_password(options)

    print()
    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")
    print(f"{Colors.BOLD}  Pass-X Analyzer — Generated Password{Colors.RESET}")
    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")
    print()
    print(f"  Password:  {Colors.GREEN}{Colors.BOLD}{result.password}{Colors.RESET}")
    print(f"  Length:     {result.length}")
    print(f"  Classes:   {', '.join(result.character_sets)}")
    print()

    # Also analyze the generated password
    analysis = analyze(result.password)
    print(f"  Score:     {Colors.BOLD}{analysis.score}/100{Colors.RESET}  "
          f"{_color_category(analysis.category)}")
    print(f"  Entropy:   {Colors.CYAN}{analysis.entropy_bits} bits{Colors.RESET}")
    print()
    print(f"{Colors.BOLD}{'═' * 50}{Colors.RESET}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pass-x-analyzer",
        description="Password Strength Analyzer — CLI",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # analyze
    analyze_parser = subparsers.add_parser("analyze", help="Analyze a password")
    analyze_parser.add_argument(
        "--password", "-p",
        type=str,
        default=None,
        help="Password to analyze (will prompt if not provided)",
    )

    # generate
    gen_parser = subparsers.add_parser("generate", help="Generate a password")
    gen_parser.add_argument("--length", "-l", type=int, default=16, help="Password length (default 16)")
    gen_parser.add_argument("--no-upper", action="store_true", help="Exclude uppercase letters")
    gen_parser.add_argument("--no-lower", action="store_true", help="Exclude lowercase letters")
    gen_parser.add_argument("--no-digits", action="store_true", help="Exclude digits")
    gen_parser.add_argument("--no-symbols", action="store_true", help="Exclude symbols")
    gen_parser.add_argument("--exclude-ambiguous", action="store_true", help="Exclude ambiguous characters (O, 0, l, 1, I, |)")

    args = parser.parse_args()

    if args.command == "analyze":
        cmd_analyze(args)
    elif args.command == "generate":
        cmd_generate(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
