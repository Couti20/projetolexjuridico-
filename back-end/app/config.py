import re
from urllib.parse import urlparse

from pydantic_settings import BaseSettings, SettingsConfigDict


_WEAK_SECRET_PATTERNS = (
    r"dev[-_]?secret",
    r"troque",
    r"change[-_]?me",
    r"senha",
    r"secret123",
    r"123456",
    r"qwerty",
)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # MySQL via XAMPP (PyMySQL)
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/lex_db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE_SECONDS: int = 300
    DB_POOL_PRE_PING: bool = True

    # API Escavador
    ESCAVADOR_API_KEY: str = ""
    ESCAVADOR_BASE_URL: str = "https://api.escavador.com/api/v2"

    ESCAVADOR_CALLBACK_SECRET: str = ""  # token de validação de callbacks

    # E-mail transacional (Brevo) para recuperação de senha
    BREVO_API_KEY: str = ""
    BREVO_SENDER_EMAIL: str = ""
    BREVO_SENDER_NAME: str = "Lex"

    # URL do front-end que receberá o token no fluxo de reset
    FRONT_RESET_PASSWORD_URL: str = "http://localhost:3000/redefinir-senha"
    PASSWORD_RESET_TOKEN_TTL_MINUTES: int = 15

    # CORS
    FRONT_URL: str = "http://localhost:3000"

    # Rate limiting (formato SlowAPI: "N/period")
    # Exemplos: "6/minute", "100/hour", "1000/day"
    RATE_LIMIT_LOGIN: str = "6/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"
    RATE_LIMIT_FORGOT_PASSWORD: str = "3/minute"
    RATE_LIMIT_RESET_PASSWORD: str = "5/minute"

    def is_production(self) -> bool:
        return self.APP_ENV.strip().lower() == "production"

    def validate_startup_security(self) -> None:
        if not self.is_production():
            return

        errors: list[str] = []
        secret = self.SECRET_KEY.strip()

        if len(secret) < 48:
            errors.append("SECRET_KEY deve ter pelo menos 48 caracteres em produção.")
        if secret.isalnum():
            errors.append("SECRET_KEY deve conter caracteres especiais em produção.")
        for pattern in _WEAK_SECRET_PATTERNS:
            if re.search(pattern, secret, flags=re.IGNORECASE):
                errors.append("SECRET_KEY parece fraca ou padrão de exemplo. Gere uma nova chave.")
                break

        algorithm = self.ALGORITHM.strip().upper()
        if algorithm != "HS256":
            errors.append("ALGORITHM inválido. Use HS256.")

        if self.ACCESS_TOKEN_EXPIRE_MINUTES <= 0 or self.ACCESS_TOKEN_EXPIRE_MINUTES > 60:
            errors.append("ACCESS_TOKEN_EXPIRE_MINUTES deve ficar entre 1 e 60 em produção.")
        if self.REFRESH_TOKEN_EXPIRE_DAYS <= 0 or self.REFRESH_TOKEN_EXPIRE_DAYS > 30:
            errors.append("REFRESH_TOKEN_EXPIRE_DAYS deve ficar entre 1 e 30 em produção.")

        front_url_values = [item.strip() for item in self.FRONT_URL.split(",") if item.strip()]
        if not front_url_values:
            errors.append("FRONT_URL não pode ficar vazio em produção.")
        for front_url in front_url_values:
            if front_url.startswith("http://"):
                errors.append("FRONT_URL deve usar HTTPS em produção.")
                break

        reset_url = self.FRONT_RESET_PASSWORD_URL.strip()
        parsed_reset = urlparse(reset_url)
        if parsed_reset.scheme != "https":
            errors.append("FRONT_RESET_PASSWORD_URL deve usar HTTPS em produção.")
        if not parsed_reset.netloc:
            errors.append("FRONT_RESET_PASSWORD_URL inválida em produção.")

        if errors:
            joined = " | ".join(errors)
            raise RuntimeError(f"Configuração insegura para produção: {joined}")

    def cors_origins(self) -> list[str]:
        raw_values = [origin.strip() for origin in self.FRONT_URL.split(",") if origin.strip()]

        defaults = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ]

        origins = raw_values + defaults
        unique: list[str] = []
        for origin in origins:
            if origin not in unique:
                unique.append(origin)
        return unique


settings = Settings()
