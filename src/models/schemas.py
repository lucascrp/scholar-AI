"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class DifficultyLevel(str, Enum):
    """Exercise difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class UploadResponse(BaseModel):
    """Response after uploading a document."""
    success: bool
    message: str
    filename: str
    chunks_processed: int

class ExerciseRequest(BaseModel):
    """Request to generate an exercise."""
    topic: str = Field(..., description="Topic for the exercise")
    difficulty: DifficultyLevel = Field(default=DifficultyLevel.MEDIUM, description="Difficulty level")
    context: Optional[str] = Field(default=None, description="Additional context or requirements")

class ExerciseResponse(BaseModel):
    """Generated exercise response."""
    exercise: str
    topic: str
    difficulty: str
    hints: Optional[List[str]] = None
    related_theory: Optional[str] = None

class SolutionRequest(BaseModel):
    """Request to check a solution."""
    exercise: str = Field(..., description="The exercise text")
    solution: str = Field(..., description="Student's proposed solution")

class SolutionResponse(BaseModel):
    """Solution verification response."""
    is_correct: bool
    feedback: str
    score: Optional[float] = Field(default=None, ge=0, le=100, description="Score from 0 to 100")
    suggestions: Optional[List[str]] = None
    correct_approach: Optional[str] = None

class TheoryQueryRequest(BaseModel):
    """Request to query theory documents."""
    question: str = Field(..., description="Question about the theory")
    
class TheoryQueryResponse(BaseModel):
    """Theory query response."""
    answer: str
    sources: List[str] = Field(default_factory=list, description="Source documents used")
    related_topics: Optional[List[str]] = None
