"""Middlewares de segurança enterprise-grade para a Lex API."""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permite fontes do Typekit (Adobe Fonts) e data: URIs usados pelo Vite/Lucide
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline' https://use.typekit.net; "
            "font-src 'self' data: https://use.typekit.net https://p.typekit.net; "
            "img-src 'self' data: blob:; "
            "connect-src 'self' ws://localhost:* http://localhost:* https://use.typekit.net; "
            "frame-ancestors 'none';"
        )

        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(), geolocation=(), payment=()"
        )

        return response
