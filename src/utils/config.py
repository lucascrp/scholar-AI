"""Configuration management for Scholar-AI application."""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration."""
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    # Application Settings
    BASE_DIR = Path(__file__).parent.parent.parent
    UPLOAD_FOLDER = BASE_DIR / "data" / "uploads"
    VECTOR_STORE_PATH = BASE_DIR / "vectorstore"
    MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", "10485760"))  # 10MB
    
    # Server Configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    
    # Vector Store Settings
    THEORY_COLLECTION = "theory_documents"
    EXERCISES_COLLECTION = "exercise_documents"
    
    # Chunk Settings for PDF Processing
    CHUNK_SIZE = 1000
    CHUNK_OVERLAP = 200
    
    @classmethod
    def ensure_directories(cls):
        """Create necessary directories if they don't exist."""
        cls.UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        cls.VECTOR_STORE_PATH.mkdir(parents=True, exist_ok=True)
        (cls.UPLOAD_FOLDER / ".gitkeep").touch(exist_ok=True)

config = Config()
