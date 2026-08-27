"""
Pass-X-Analyzer — Unified FastAPI Server & Vercel Serverless Entrypoint

Stateless API wrapping the core password analysis package.
Every request is independent; no state is held between calls.
"""

from __future__ import annotations

import sys
import os
import time
from collections import defaultdict, deque
from threading import Lock
from dataclasses import asdict

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from packages.core.analyzer import analyze
from packages.core.breach import breach_check_for_hash
from packages.core.generator import generate_password
from packages.core.models import GeneratorOptions

app = FastAPI(
    title="Pass-X-Analyzer API",
    description="Stateless password strength analysis and generation service.",
    version="1.0.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "PASS_X_ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

# CORS — keep the API callable from the local frontend and configured deployments.
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

_rate_limit_window = 60.0
_rate_limit_requests = 60
_request_times: dict[str, deque[float]] = defaultdict(deque)
_rate_limit_lock = Lock()


@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Apply basic response hardening and a per-client API request limit."""
    if request.url.path.rstrip("/") in {
        "/analyze", "/api/analyze", "/generate", "/api/generate",
        "/breach-check", "/api/breach-check",
    }:
        client_id = request.client.host if request.client else "unknown"
        now = time.monotonic()
        with _rate_limit_lock:
            requests = _request_times[client_id]
            while requests and now - requests[0] >= _rate_limit_window:
                requests.popleft()
            if len(requests) >= _rate_limit_requests:
                raise HTTPException(status_code=429, detail="Too many requests. Try again shortly.")
            requests.append(now)

    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; connect-src 'self' https://api.pwnedpasswords.com; "
        "font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "img-src 'self' data:; frame-ancestors 'none'"
    )
    return response


# ---------------------------------------------------------------------------
# Request / Response models (Pydantic)
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    password: str = Field(..., max_length=256, description="The password to analyze")


class GenerateRequest(BaseModel):
    length: int = Field(default=16, ge=4, le=128, description="Password length")
    use_uppercase: bool = Field(default=True)
    use_lowercase: bool = Field(default=True)
    use_digits: bool = Field(default=True)
    use_symbols: bool = Field(default=True)
    exclude_ambiguous: bool = Field(default=False)


class BreachCheckRequest(BaseModel):
    prefix: str = Field(..., min_length=5, max_length=5, description="First five characters of the SHA-1 digest")
    suffix: str = Field(..., min_length=35, max_length=35, description="Remaining SHA-1 digest characters")


# ---------------------------------------------------------------------------
# Endpoints (Dual-routed for local dev & Vercel serverless /api prefix)
# ---------------------------------------------------------------------------


@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "service": "pass-x-analyzer"}


@app.get("/api/index.py/health")
async def rewritten_health():
    """Compatibility route for Vercel rewrites targeting the function file."""
    return {"status": "ok", "service": "pass-x-analyzer"}


@app.post("/analyze")
@app.post("/api/analyze")
async def analyze_password(req: AnalyzeRequest):
    """
    Analyze a password and return the full strength report.
    Returns score, category, individual check results, entropy,
    crack-time estimates, suggestions, and a stronger version hint.
    """
    result = analyze(req.password)
    return asdict(result)


@app.post("/generate")
@app.post("/api/generate")
async def generate(req: GenerateRequest):
    """
    Generate a random password with the given options and return
    both the password and its analysis.
    """
    options = GeneratorOptions(
        length=req.length,
        use_uppercase=req.use_uppercase,
        use_lowercase=req.use_lowercase,
        use_digits=req.use_digits,
        use_symbols=req.use_symbols,
        exclude_ambiguous=req.exclude_ambiguous,
    )

    gen_result = generate_password(options)
    analysis = analyze(gen_result.password)
    gen_result.analysis = analysis

    return asdict(gen_result)


@app.post("/breach-check")
@app.post("/api/breach-check")
async def breach_check(req: BreachCheckRequest):
    """Check a k-anonymous SHA-1 query without accepting a raw password."""
    return breach_check_for_hash(req.prefix, req.suffix)
