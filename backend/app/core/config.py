from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Configuración de la API
    APP_NAME: str = "Sebbi API"
    DEBUG: bool = True
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Configuración de Gemini
    GOOGLE_API_KEY: str = "AIzaSyCx8rHobpabwcTR-6Wmmh-J_1bqF5gJZ3M"
    
    # Configuración de Supabase
    SUPABASE_URL: str = "https://cpiznlfmqscoekcldgua.supabase.co"
    SUPABASE_KEY: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaXpubGZtcXNjb2VrY2xkZ3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MjQ0NzAsImV4cCI6MjAyNTQwMDQ3MH0.ZUuxwI6qTXCsGU8qEOWCaaE"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings() 