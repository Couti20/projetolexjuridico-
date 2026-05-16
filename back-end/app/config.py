from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

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

if settings.APP_ENV.lower() == "production" and settings.SECRET_KEY == "dev-secret-key-troque-em-producao":
    raise RuntimeError("SECRET_KEY insegura para produção. Configure uma chave forte no ambiente.")
