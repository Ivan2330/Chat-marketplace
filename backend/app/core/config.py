from pydantic import BaseSettings


class Settings(BaseSettings):
    frontend_url: str = ""
    mongo_url: str = ""
    secret_key: str = ""
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
