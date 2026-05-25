from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    rabbitmq_url: str = "amqp://guest:guest@rabbitmq:5672/"
    browse_queue: str = "browse_tasks"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
