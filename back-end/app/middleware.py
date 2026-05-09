"""Middlewares de segurança enterprise-grade para a Lex API.

SecurityHeadersMiddleware:
 - Strict-Transport-Security  (HSTS — força HTTPS)
 - X-Content-Type-Options     (bloqueia MIME sniffing)
 - X-Frame-Options            (bloqueia clickjacking)
 - X-XSS-Protection           (proteção XSS legada)
 - Referrer-Policy            (controla cabeçalho Referer)
 - Content-Security-Policy    (restringe origens de recursos)
 - Permissions-Policy         (desativa APIs de browser não usadas)
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Força HTTPS por 1 ano, incluindo subdomínios
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )

        # Impede o browser de "adivinhar" o Content-Type
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Bloqueia renderização em iframe (anti-clickjacking)
        response.headers["X-Frame-Options"] = "DENY"

        # Proteção XSS para browsers legados
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Não vaza URL completa no Referer para origens externas
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # CSP: permite fontes via data: URI (necessário para Vite/Lucide em dev)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "font-src 'self' data:; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' ws://localhost:* http://localhost:*; "
            "frame-ancestors 'none';"
        )

        # Desativa APIs de hardware desnecessárias
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )

        return response
