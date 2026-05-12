from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # MySQL via XAMPP (PyMySQL)
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/lex_db"

    # API Escavador
    ESCAVADOR_API_KEY: str = ""
    ESCAVADOR_BASE_URL: str = "https://api.escavador.com/api/v2"
<<<<<<< HEAD
=======
    ESCAVADOR_CALLBACK_SECRET: str = ""  # token de validação de callbacks
>>>>>>> develop

    # CORS
    FRONT_URL: str = "http://localhost:3000"

    # Rate limiting (formato SlowAPI: "N/period")
    # Exemplos: "5/minute", "100/hour", "1000/day"
    RATE_LIMIT_LOGIN: str = "5/minute"
    RATE_LIMIT_REGISTER: str = "3/minute"

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
