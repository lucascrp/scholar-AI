"""Tests for the schemas."""
import pytest
from src.models.schemas import (
    ExerciseRequest, DifficultyLevel, SolutionRequest,
    TheoryQueryRequest
)

class TestSchemas:
    """Test cases for Pydantic schemas."""
    
    def test_exercise_request_valid(self):
        """Test valid exercise request."""
        request = ExerciseRequest(
            topic="algoritmi di ordinamento",
            difficulty=DifficultyLevel.MEDIUM
        )
        assert request.topic == "algoritmi di ordinamento"
        assert request.difficulty == DifficultyLevel.MEDIUM
    
    def test_exercise_request_default_difficulty(self):
        """Test exercise request with default difficulty."""
        request = ExerciseRequest(topic="strutture dati")
        assert request.difficulty == DifficultyLevel.MEDIUM
    
    def test_solution_request_valid(self):
        """Test valid solution request."""
        request = SolutionRequest(
            exercise="Implementa un BST",
            solution="class BST: pass"
        )
        assert request.exercise == "Implementa un BST"
        assert request.solution == "class BST: pass"
    
    def test_theory_query_request_valid(self):
        """Test valid theory query request."""
        request = TheoryQueryRequest(question="Cos'è un grafo?")
        assert request.question == "Cos'è un grafo?"
