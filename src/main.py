"""Main FastAPI application for Scholar-AI."""
import uvicorn
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from src.utils.config import config
from src.models.schemas import (
    UploadResponse, ExerciseRequest, ExerciseResponse,
    SolutionRequest, SolutionResponse, TheoryQueryRequest, TheoryQueryResponse
)
from src.services.document_service import DocumentService
from src.services.exercise_service import ExerciseService
from src.agent.study_agent import StudyAgent

# Initialize FastAPI app
app = FastAPI(
    title="Scholar-AI",
    description="AI Agent for helping engineering students prepare for exams",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
document_service = DocumentService()
exercise_service = ExerciseService()
study_agent = StudyAgent()

# Ensure directories exist
config.ensure_directories()

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Scholar-AI API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

@app.post("/upload/theory", response_model=UploadResponse)
async def upload_theory_document(file: UploadFile = File(...)):
    """Upload a theory document (PDF).
    
    Args:
        file: PDF file containing theory materials
        
    Returns:
        UploadResponse with processing details
    """
    # Validate file extension
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate content type
    if file.content_type not in ['application/pdf']:
        raise HTTPException(status_code=400, detail="Invalid file type. Expected PDF.")
    
    try:
        # Save uploaded file
        file_path = config.UPLOAD_FOLDER / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process and add to vector store
        num_chunks = document_service.add_theory_document(file_path)
        
        return UploadResponse(
            success=True,
            message="Theory document uploaded and processed successfully",
            filename=file.filename,
            chunks_processed=num_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/upload/exercises", response_model=UploadResponse)
async def upload_exercise_document(file: UploadFile = File(...)):
    """Upload an exercise document (PDF).
    
    Args:
        file: PDF file containing exercises and exam materials
        
    Returns:
        UploadResponse with processing details
    """
    # Validate file extension
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Validate content type
    if file.content_type not in ['application/pdf']:
        raise HTTPException(status_code=400, detail="Invalid file type. Expected PDF.")
    
    try:
        # Save uploaded file
        file_path = config.UPLOAD_FOLDER / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process and add to vector store
        num_chunks = document_service.add_exercise_document(file_path)
        
        return UploadResponse(
            success=True,
            message="Exercise document uploaded and processed successfully",
            filename=file.filename,
            chunks_processed=num_chunks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

@app.post("/generate/exercise", response_model=ExerciseResponse)
async def generate_exercise(request: ExerciseRequest):
    """Generate a new exercise based on topic and difficulty.
    
    Args:
        request: Exercise generation parameters
        
    Returns:
        Generated exercise with hints and related theory
    """
    try:
        result = exercise_service.generate_exercise(
            topic=request.topic,
            difficulty=request.difficulty,
            context=request.context
        )
        return ExerciseResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating exercise: {str(e)}")

@app.post("/check/solution", response_model=SolutionResponse)
async def check_solution(request: SolutionRequest):
    """Check a student's solution to an exercise.
    
    Args:
        request: Exercise and solution to check
        
    Returns:
        Evaluation with feedback and suggestions
    """
    try:
        result = exercise_service.check_solution(
            exercise=request.exercise,
            solution=request.solution
        )
        return SolutionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking solution: {str(e)}")

@app.post("/query/theory", response_model=TheoryQueryResponse)
async def query_theory(request: TheoryQueryRequest):
    """Answer questions about theory using uploaded documents.
    
    Args:
        request: Question about theory
        
    Returns:
        Answer with sources and related topics
    """
    try:
        result = study_agent.query_theory(request.question)
        return TheoryQueryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying theory: {str(e)}")

@app.get("/exercises/related/{topic}")
async def get_related_exercises(topic: str, limit: int = 3):
    """Get related exercises for a topic.
    
    Args:
        topic: Topic to search for
        limit: Maximum number of exercises to return
        
    Returns:
        List of related exercises
    """
    try:
        exercises = study_agent.get_related_exercises(topic, limit)
        return {
            "topic": topic,
            "exercises": exercises
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving exercises: {str(e)}")

@app.post("/explain/{concept}")
async def explain_concept(concept: str):
    """Get a detailed explanation of a concept.
    
    Args:
        concept: Concept to explain
        
    Returns:
        Detailed explanation
    """
    try:
        explanation = study_agent.explain_concept(concept)
        return {
            "concept": concept,
            "explanation": explanation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error explaining concept: {str(e)}")

def main():
    """Run the application."""
    uvicorn.run(
        "src.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True
    )

if __name__ == "__main__":
    main()
