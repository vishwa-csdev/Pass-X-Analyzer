from __future__ import annotations

import os
from dataclasses import asdict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from packages.core.analyzer import analyze
from packages.core.breach import breach_check_for_hash
from packages.core.generator import generate_password
from packages.core.models import GeneratorOptions


class AnalyzeRequest(BaseModel):
    password: str = Field(..., min_length=1, max_length=512)


class GenerateRequest(BaseModel):
    length: int = Field(16, ge=4, le=128)
    use_uppercase: bool = True
    use_lowercase: bool = True
    use_digits: bool = True
    use_symbols: bool = True
    exclude_ambiguous: bool = False


class BreachCheckRequest(BaseModel):
    prefix: str = Field(..., min_length=5, max_length=5)
    suffix: str = Field(..., min_length=35, max_length=35)


def _allowed_origins() -> list[str]:
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    env_value = os.getenv("FRONTEND_ORIGINS", "").strip()
    if env_value:
        origins.extend(
            origin.strip()
            for origin in env_value.split(",")
            if origin.strip()
        )
    # De-duplicate while preserving order.
    unique: list[str] = []
    for origin in origins:
        if origin not in unique:
            unique.append(origin)
    return unique


app = FastAPI(
    title="Pass-X Analyzer API",
    version="1.0.0",
    description="REST API for password analysis, generation, and breach checks.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api")
@app.get("/")
def read_root() -> dict[str, str]:
    return {"status": "ok", "service": "pass-x-analyzer"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "pass-x-analyzer"}


@app.post("/api/analyze")
def analyze_password(request: AnalyzeRequest) -> dict:
    result = analyze(request.password)
    return asdict(result)


@app.post("/api/generate")
def generate_password_route(request: GenerateRequest) -> dict:
    options = GeneratorOptions(
        length=request.length,
        use_uppercase=request.use_uppercase,
        use_lowercase=request.use_lowercase,
        use_digits=request.use_digits,
        use_symbols=request.use_symbols,
        exclude_ambiguous=request.exclude_ambiguous,
    )
    generated = generate_password(options)
    generated.analysis = analyze(generated.password)
    return asdict(generated)


@app.post("/api/breach-check")
def breach_check_route(request: BreachCheckRequest) -> dict:
    if len(request.prefix) != 5 or len(request.suffix) != 35:
        raise HTTPException(status_code=400, detail="invalid k-anonymous hash query")
    if not all(character in "0123456789ABCDEFabcdef" for character in request.prefix + request.suffix):
        raise HTTPException(status_code=400, detail="invalid k-anonymous hash query")
    return breach_check_for_hash(request.prefix, request.suffix)
