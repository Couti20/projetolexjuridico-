"""Middlewares de segurança enterprise-grade para a Lex API."""
import asyncio

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class PayloadSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_body_bytes: int = 1024 * 1024) -> None:
        super().__init__(app)
        self.max_body_bytes = max_body_bytes

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.method in {"POST", "PUT", "PATCH"}:
            content_length = request.headers.get("content-length")
            if content_length and content_length.isdigit():
                if int(content_length) > self.max_body_bytes:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": (
                                f"Payload excede o limite permitido de {self.max_body_bytes} bytes."
                            )
                        },
                    )
            else:
                body = await request.body()
                if len(body) > self.max_body_bytes:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": (
                                f"Payload excede o limite permitido de {self.max_body_bytes} bytes."
                            )
                        },
                    )
        return await call_next(request)


class RequestTimeoutMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, timeout_seconds: int = 30) -> None:
        super().__init__(app)
        self.timeout_seconds = timeout_seconds

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await asyncio.wait_for(call_next(request), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            return JSONResponse(
                status_code=504,
                content={"detail": "Tempo limite da requisição excedido."},
            )


class ConcurrencyLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_concurrent_requests: int = 100, acquire_timeout_seconds: int = 5) -> None:
        super().__init__(app)
        self._semaphore = asyncio.Semaphore(max_concurrent_requests)
        self.acquire_timeout_seconds = acquire_timeout_seconds

    async def dispatch(self, request: Request, call_next) -> Response:
        acquired = False
        try:
            await asyncio.wait_for(self._semaphore.acquire(), timeout=self.acquire_timeout_seconds)
            acquired = True
            return await call_next(request)
        except asyncio.TimeoutError:
            return JSONResponse(
                status_code=503,
                content={"detail": "Servidor ocupado. Tente novamente em instantes."},
            )
        finally:
            if acquired:
                self._semaphore.release()


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
