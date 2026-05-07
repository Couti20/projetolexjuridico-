from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    SECRET_KEY: str = "dev-secret-key-troque-em-producao"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # MySQL via XAMPP (PyMySQL — sem precisar compilar nada)
    # Formato: mysql+pymysql://usuario:senha@host:porta/banco
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/lex_db"

    # API Escavador — será usada na próxima fase
    ESCAVADOR_API_KEY: str = ""  # TODO: preencher quando for integrar
    ESCAVADOR_BASE_URL: str = "https://api.escavador.com/api/v2"

    FRONT_URL: str = "http://localhost:5173"


settings = Settings()
