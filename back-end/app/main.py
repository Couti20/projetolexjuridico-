"""Ponto de entrada da Lex API.

Ordem de registro dos middlewares (LIFO — último registrado, primeiro executado):
1. SecurityHeadersMiddleware   → adiciona headers de segurança em TODAS as respostas
2. PayloadSizeLimitMiddleware  → bloqueia payloads acima do limite configurado
3. ConcurrencyLimitMiddleware  → limita concorrência global de requisições
4. RequestTimeoutMiddleware    → encerra requisições lentas com timeout
5. CORSMiddleware              → trata preflight e valida origens
"""
import re
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.middleware import (
    ConcurrencyLimitMiddleware,
    PayloadSizeLimitMiddleware,
    RequestTimeoutMiddleware,
    SecurityHeadersMiddleware,
)
from app.rate_limit import limiter
from app.routers import auth, processes, dashboard, tasks, users
from app.routers import escavador_webhook

def _rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Retorna 429 com retryAfter em segundos e mensagem legível.

    O SlowAPI preenche exc.retry_after (int, segundos) quando disponível.
    Também tenta extrair o número de segundos do texto do limite (ex: '5/minute').
    """
    retry_after: int = 0

    # 1. Tenta pelo atributo do SlowAPI
    raw = getattr(exc, 'retry_after', None)
    if isinstance(raw, int) and raw > 0:
        retry_after = raw
    elif isinstance(raw, str):
        try:
            retry_after = int(raw)
        except ValueError:
            pass

    # 2. Fallback: extrai segundos do detail (ex: "5 per 1 minute")
    if retry_after == 0:
        detail_str = str(exc.detail) if hasattr(exc, 'detail') else ''
        m = re.search(r'(\d+)\s*(?:per\s*1\s*)?minute', detail_str, re.IGNORECASE)
        if m:
            retry_after = int(m.group(1)) * 60
        else:
            retry_after = 60  # fallback genérico de 1 minuto

    if retry_after >= 60:
        minutes = retry_after // 60
        secs    = retry_after % 60
        if secs > 0:
            tempo = f"{minutes} minuto(s) e {secs} segundo(s)"
        else:
            tempo = f"{minutes} minuto(s)"
    else:
        tempo = f"{retry_after} segundo(s)"

    return JSONResponse(
        status_code=429,
        content={
            "detail": f"Muitas tentativas. Tente novamente em {tempo}.",
            "retryAfter": retry_after,
            "lockedUntil": None,
        },
        headers={"Retry-After": str(retry_after)},
    )


app = FastAPI(
    title="Lex API",
    description="Back-end do Lex — SaaS jurídico para advogados solo.",
    version="1.0.0",
    docs_url="/docs" if settings.APP_ENV != "production" else None,
    redoc_url="/redoc" if settings.APP_ENV != "production" else None,
)


@app.on_event("startup")
def validate_security_configuration() -> None:
    settings.validate_startup_security()


# ── Estado do rate limiter ────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_handler)

# ── Middlewares (ordem importa: último adicionado = primeiro executado) ────────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(PayloadSizeLimitMiddleware, max_body_bytes=settings.MAX_REQUEST_BODY_BYTES)
app.add_middleware(
    ConcurrencyLimitMiddleware,
    max_concurrent_requests=settings.MAX_CONCURRENT_REQUESTS,
    acquire_timeout_seconds=settings.REQUEST_QUEUE_TIMEOUT_SECONDS,
)
app.add_middleware(RequestTimeoutMiddleware, timeout_seconds=settings.REQUEST_TIMEOUT_SECONDS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Request-ID"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router,      prefix="/auth",      tags=["Auth"])
app.include_router(users.router,     prefix="/users",     tags=["Users"])
app.include_router(processes.router, prefix="/processes", tags=["Processes"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(tasks.router,     prefix="/tasks",     tags=["Tasks"])
app.include_router(escavador_webhook.router)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "lex-api", "env": settings.APP_ENV}
