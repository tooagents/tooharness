from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    aws_region: str = "us-east-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    dynamodb_endpoint: str | None = None  # for local dev (e.g. http://localhost:8000)
    table_prefix: str = "tooharness_"

    model_config = {"env_file": ".env"}


settings = Settings()
