from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    DATABASE_URL: str = "sqlite:///./lex_dev.db"  # fallback para dev sem PostgreSQL

    ESCAVADOR_API_KEY: str = ""
    ESCAVADOR_BASE_URL: str = "https://api.escavador.com/api/v2"

    FRONT_URL: str = "http://localhost:5173"


settings = Settings()
