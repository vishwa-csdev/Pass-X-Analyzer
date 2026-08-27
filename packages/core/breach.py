from __future__ import annotations

import hashlib
from typing import Any, Dict

import httpx

HIBP_RANGE_API = "https://api.pwnedpasswords.com/range"


def _sha1_digest(password: str) -> str:
    return hashlib.sha1(password.encode("utf-8")).hexdigest().upper()


def breach_check_for_password(password: str, timeout: float = 5.0) -> Dict[str, Any]:
    """Check a password against the HIBP range API.

    Returns a normalized dictionary with a user-facing status and count.
    """
    if not password:
        return {
            "found": False,
            "matches": 0,
            "count": 0,
            "status": "no_signal",
            "message": "No password provided for breach scan.",
        }

    digest = _sha1_digest(password)
    prefix = digest[:5]
    suffix = digest[5:]

    try:
        response = httpx.get(
            HIBP_RANGE_API,
            params={"prefix": prefix},
            timeout=timeout,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        return {
            "found": False,
            "matches": 0,
            "count": 0,
            "status": "scan_error",
            "message": "Breach database unavailable right now.",
            "error": str(exc),
        }

    for line in response.text.splitlines():
        if not line:
            continue
        hash_suffix, match_count = line.split(":", 1)
        if hash_suffix.strip() == suffix:
            matches = int(match_count.strip() or "0")
            return {
                "found": matches > 0,
                "matches": matches,
                "count": matches,
                "status": "breach_detected" if matches > 0 else "no_signal",
                "message": (
                    f"Found in {matches} known compromised datasets."
                    if matches > 0
                    else "No signal detected in known breach data."
                ),
            }

    return {
        "found": False,
        "matches": 0,
        "count": 0,
        "status": "no_signal",
        "message": "No signal detected in known breach data.",
    }
