from __future__ import annotations

import json
import time
from collections import defaultdict
from dataclasses import asdict
from http.server import BaseHTTPRequestHandler
from typing import Any, Callable

from packages.core.analyzer import analyze
from packages.core.breach import breach_check_for_hash
from packages.core.generator import generate_password
from packages.core.models import GeneratorOptions

_REQUESTS: dict[str, list[float]] = defaultdict(list)
_RATE_LIMIT = 60
_RATE_WINDOW = 60


def write_json(handler: BaseHTTPRequestHandler, status: int, payload: Any) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def request_allowed(handler: BaseHTTPRequestHandler) -> bool:
    address = handler.client_address[0] if handler.client_address else "unknown"
    now = time.monotonic()
    recent = [stamp for stamp in _REQUESTS[address] if now - stamp < _RATE_WINDOW]
    if len(recent) >= _RATE_LIMIT:
        return False
    recent.append(now)
    _REQUESTS[address] = recent
    return True


def parse_body(handler: BaseHTTPRequestHandler) -> dict[str, Any] | None:
    try:
        content_length = int(handler.headers.get("Content-Length", "0"))
    except ValueError:
        return None
    if content_length <= 0 or content_length > 16_384:
        return None
    try:
        payload = json.loads(handler.rfile.read(content_length))
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


def handle_post(handler: BaseHTTPRequestHandler, operation: Callable[[dict[str, Any]], Any]) -> None:
    if not request_allowed(handler):
        write_json(handler, 429, {"detail": "Too many requests. Please try again shortly."})
        return
    payload = parse_body(handler)
    if payload is None:
        write_json(handler, 400, {"detail": "Request body must be valid JSON."})
        return
    try:
        write_json(handler, 200, operation(payload))
    except ValueError as exc:
        write_json(handler, 422, {"detail": str(exc)})
    except Exception:
        write_json(handler, 500, {"detail": "Service temporarily unavailable."})


def analyze_operation(payload: dict[str, Any]) -> dict[str, Any]:
    password = payload.get("password")
    if not isinstance(password, str) or len(password) > 512:
        raise ValueError("password must be a string of 512 characters or fewer")
    return asdict(analyze(password))


def generate_operation(payload: dict[str, Any]) -> dict[str, Any]:
    options = GeneratorOptions(
        length=payload.get("length", 16),
        use_uppercase=payload.get("use_uppercase", True),
        use_lowercase=payload.get("use_lowercase", True),
        use_digits=payload.get("use_digits", True),
        use_symbols=payload.get("use_symbols", True),
        exclude_ambiguous=payload.get("exclude_ambiguous", False),
    )
    generated = generate_password(options)
    generated.analysis = analyze(generated.password)
    return asdict(generated)


def breach_operation(payload: dict[str, Any]) -> dict[str, Any]:
    prefix = payload.get("prefix")
    suffix = payload.get("suffix")
    if not isinstance(prefix, str) or not isinstance(suffix, str):
        raise ValueError("prefix and suffix are required")
    if len(prefix) != 5 or len(suffix) != 35:
        raise ValueError("invalid k-anonymous hash query")
    if not all(character in "0123456789abcdefABCDEF" for character in prefix + suffix):
        raise ValueError("invalid k-anonymous hash query")
    return breach_check_for_hash(prefix, suffix)


class JsonHandler(BaseHTTPRequestHandler):
    operation: Callable[[dict[str, Any]], Any] | None = None

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_POST(self) -> None:
        if self.operation is None:
            write_json(self, 404, {"detail": "Not found"})
            return
        handle_post(self, self.operation)

    def log_message(self, format: str, *args: Any) -> None:
        return


class HealthHandler(JsonHandler):
    def do_GET(self) -> None:
        write_json(self, 200, {"status": "ok", "service": "pass-x-analyzer"})


class AnalyzeHandler(JsonHandler):
    operation = analyze_operation


class GenerateHandler(JsonHandler):
    operation = generate_operation


class BreachHandler(JsonHandler):
    operation = breach_operation
