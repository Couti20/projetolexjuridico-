from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, processes, dashboard, tasks

app = FastAPI(
    title="Lex API",
    description="Back-end do Lex — SaaS jurídico para advogados solo.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(processes.router, prefix="/processes", tags=["Processes"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "lex-api"}
