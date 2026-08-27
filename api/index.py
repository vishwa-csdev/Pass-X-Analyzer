"""
Pass-X-Analyzer — Unified FastAPI Server & Vercel Serverless Entrypoint

Stateless API wrapping the core password analysis package.
Every request is independent; no state is held between calls.
"""

from __future__ import annotations

import sys
import os
import time
from dataclasses import asdict
from collections import defaultdict

# Ensure project root is in sys.path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

_request_buckets: dict[tuple[str, str], list[float]] = defaultdict(list)
_RATE_LIMIT = 60
_RATE_WINDOW_SECONDS = 60


@app.middleware("http")
async def protect_public_endpoints(request: Request, call_next):
    """Apply a small per-instance abuse limit to computational endpoints."""
    if request.method == "POST" and request.url.path.rstrip("/") in {
        "/analyze", "/api/analyze", "/generate", "/api/generate",
        "/breach-check", "/api/breach-check",
    }:
        forwarded_for = request.headers.get("x-forwarded-for", "")
        client_ip = forwarded_for.split(",", 1)[0].strip() or (request.client.host if request.client else "unknown")
        bucket_key = (client_ip, request.url.path)
        now = time.monotonic()
        recent_requests = [stamp for stamp in _request_buckets[bucket_key] if now - stamp < _RATE_WINDOW_SECONDS]
        if len(recent_requests) >= _RATE_LIMIT:
            return JSONResponse({"detail": "Too many requests. Please try again shortly."}, status_code=429)
        recent_requests.append(now)
        _request_buckets[bucket_key] = recent_requests

    return await call_next(request)


# Production is same-origin; FRONTEND_ORIGINS is only needed for a separate UI.
configured_origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=configured_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models (Pydantic)
# ---------------------------------------------------------------------------


class AnalyzeRequest(BaseModel):
    password: str = Field(..., max_length=512, description="The password to analyze")


class GenerateRequest(BaseModel):
    length: int = Field(default=16, ge=4, le=128, description="Password length")
    use_uppercase: bool = Field(default=True)
    use_lowercase: bool = Field(default=True)
    use_digits: bool = Field(default=True)
    use_symbols: bool = Field(default=True)
    exclude_ambiguous: bool = Field(default=False)


class BreachCheckRequest(BaseModel):
    prefix: str = Field(..., min_length=5, max_length=5, pattern=r"^[0-9A-Fa-f]{5}$", description="First five characters of the SHA-1 digest")
    suffix: str = Field(..., min_length=35, max_length=35, pattern=r"^[0-9A-Fa-f]{35}$", description="Remaining SHA-1 digest characters")


# ---------------------------------------------------------------------------
# Endpoints (Dual-routed for local dev & Vercel serverless /api prefix)
# ---------------------------------------------------------------------------


@app.get("/")
@app.get("/health")
@app.get("/api/health")
async def health():
    """Health check endpoint."""
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
