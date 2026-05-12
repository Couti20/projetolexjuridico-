"""Ponto de entrada da Lex API.

Ordem de registro dos middlewares (LIFO — último registrado, primeiro executado):
1. SecurityHeadersMiddleware  → adiciona headers de segurança em TODAS as respostas
2. CORSMiddleware             → trata preflight e valida origens
3. SlowAPI state              → disponibiliza o limiter para os routers
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware import SecurityHeadersMiddleware
from app.routers import auth, processes, dashboard, tasks, users
<<<<<<< HEAD
=======
from app.routers import escavador_webhook  # integração Escavador
>>>>>>> develop

# ── SlowAPI (rate limiting global) ────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Lex API",
    description="Back-end do Lex — SaaS jurídico para advogados solo.",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
)

# ── Estado do rate limiter ────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    lambda request, exc: JSONResponse(
        status_code=429,
        content={
            "detail": "Muitas tentativas. Aguarde um momento e tente novamente."
        },
    ),
)

# ── Middlewares (ordem importa: último adicionado = primeiro executado) ───────
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
<<<<<<< HEAD
app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
app.include_router(users.router,     prefix="/users",     tags=["Users"])
app.include_router(processes.router, prefix="/processes", tags=["Processes"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(tasks.router,     prefix="/tasks",     tags=["Tasks"])
=======
app.include_router(auth.router,               prefix="/auth",      tags=["Auth"])
app.include_router(users.router,              prefix="/users",     tags=["Users"])
app.include_router(processes.router,          prefix="/processes", tags=["Processes"])
app.include_router(dashboard.router,          prefix="/dashboard", tags=["Dashboard"])
app.include_router(tasks.router,              prefix="/tasks",     tags=["Tasks"])
app.include_router(escavador_webhook.router)  # prefixo próprio: /api/v1/escavador
>>>>>>> develop


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "lex-api", "env": settings.APP_ENV}
