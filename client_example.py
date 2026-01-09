"""Python client example for Scholar-AI API."""
import requests
import json
from pathlib import Path

class ScholarAIClient:
    """Client for interacting with Scholar-AI API."""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize the client.
        
        Args:
            base_url: Base URL of the Scholar-AI API
        """
        self.base_url = base_url
    
    def upload_theory(self, pdf_path: Path) -> dict:
        """Upload a theory document.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Response dictionary
        """
        with open(pdf_path, "rb") as f:
            files = {"file": (pdf_path.name, f, "application/pdf")}
            response = requests.post(f"{self.base_url}/upload/theory", files=files)
            return response.json()
    
    def upload_exercises(self, pdf_path: Path) -> dict:
        """Upload an exercise document.
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Response dictionary
        """
        with open(pdf_path, "rb") as f:
            files = {"file": (pdf_path.name, f, "application/pdf")}
            response = requests.post(f"{self.base_url}/upload/exercises", files=files)
            return response.json()
    
    def generate_exercise(self, topic: str, difficulty: str = "medium", context: str = None) -> dict:
        """Generate an exercise.
        
        Args:
            topic: Topic for the exercise
            difficulty: Difficulty level (easy, medium, hard)
            context: Optional additional context
            
        Returns:
            Generated exercise dictionary
        """
        data = {
            "topic": topic,
            "difficulty": difficulty
        }
        if context:
            data["context"] = context
        
        response = requests.post(
            f"{self.base_url}/generate/exercise",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def check_solution(self, exercise: str, solution: str) -> dict:
        """Check a solution.
        
        Args:
            exercise: Exercise text
            solution: Proposed solution
            
        Returns:
            Evaluation dictionary
        """
        data = {
            "exercise": exercise,
            "solution": solution
        }
        response = requests.post(
            f"{self.base_url}/check/solution",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def query_theory(self, question: str) -> dict:
        """Query theory documents.
        
        Args:
            question: Question to ask
            
        Returns:
            Answer dictionary with sources
        """
        data = {"question": question}
        response = requests.post(
            f"{self.base_url}/query/theory",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        return response.json()
    
    def get_related_exercises(self, topic: str, limit: int = 3) -> dict:
        """Get related exercises.
        
        Args:
            topic: Topic to search for
            limit: Maximum number of exercises
            
        Returns:
            Dictionary with related exercises
        """
        response = requests.get(
            f"{self.base_url}/exercises/related/{topic}",
            params={"limit": limit}
        )
        return response.json()
    
    def explain_concept(self, concept: str) -> dict:
        """Get explanation of a concept.
        
        Args:
            concept: Concept to explain
            
        Returns:
            Dictionary with explanation
        """
        response = requests.post(f"{self.base_url}/explain/{concept}")
        return response.json()


def main():
    """Example usage of the Scholar-AI client."""
    # Initialize client
    client = ScholarAIClient()
    
    print("🎓 Scholar-AI Client Example\n")
    
    # Example 1: Generate an exercise
    print("1. Generating an exercise on 'algoritmi di ordinamento'...")
    exercise = client.generate_exercise(
        topic="algoritmi di ordinamento",
        difficulty="medium"
    )
    print(f"Exercise: {exercise.get('exercise', 'N/A')[:200]}...\n")
    
    # Example 2: Check a solution
    print("2. Checking a solution...")
    result = client.check_solution(
        exercise="Implementa una funzione che calcola il fattoriale",
        solution="def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)"
    )
    print(f"Correct: {result.get('is_correct')}")
    print(f"Score: {result.get('score')}\n")
    
    # Example 3: Query theory
    print("3. Querying theory...")
    answer = client.query_theory("Cos'è la complessità temporale?")
    print(f"Answer: {answer.get('answer', 'N/A')[:200]}...\n")
    
    # Example 4: Get related exercises
    print("4. Getting related exercises...")
    related = client.get_related_exercises("grafi", limit=2)
    print(f"Found {len(related.get('exercises', []))} related exercises\n")
    
    print("✅ Examples completed!")


if __name__ == "__main__":
    main()
