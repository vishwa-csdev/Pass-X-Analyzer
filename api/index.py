from fastapi import FastAPI
from apps.server.main import app as passx_app

# Vercel serverless entrypoint
app = FastAPI()

# Mount the main app at /api so routes match Vercel's /api/* forwarding
app.mount("/api", passx_app)
