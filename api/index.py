from __future__ import annotations

import sys
import os

# Ensure the root directory is on sys.path so packages.core and apps.server can be resolved
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apps.server.main import app as passx_app

# Vercel serverless entrypoint
app = FastAPI(title="Pass-X-Analyzer API", version="1.0.0")

# Allow CORS for all origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the main app at /api
app.mount("/api", passx_app)

# Also expose direct endpoints at root level for flexibility
@app.get("/")
async def root():
    return {"status": "ok", "service": "pass-x-analyzer-api"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "pass-x-analyzer"}

@app.post("/analyze")
async def analyze_proxy(req: dict):
    from apps.server.main import analyze_password, AnalyzeRequest
    return await analyze_password(AnalyzeRequest(**req))

@app.post("/generate")
async def generate_proxy(req: dict = None):
    from apps.server.main import generate, GenerateRequest
    req_obj = GenerateRequest(**(req or {}))
    return await generate(req_obj)
