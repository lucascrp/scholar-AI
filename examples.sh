# Example usage script for Scholar-AI API

# This file contains example cURL commands to interact with the Scholar-AI API
# Make sure the server is running on http://localhost:8000

# 1. Health check
curl -X GET http://localhost:8000/health

# 2. Upload a theory document (replace with actual PDF path)
# curl -X POST -F "file=@/path/to/your/theory.pdf" http://localhost:8000/upload/theory

# 3. Upload an exercise document (replace with actual PDF path)
# curl -X POST -F "file=@/path/to/your/exercises.pdf" http://localhost:8000/upload/exercises

# 4. Generate an easy exercise on "algoritmi di ordinamento"
curl -X POST http://localhost:8000/generate/exercise \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "algoritmi di ordinamento",
    "difficulty": "easy"
  }'

# 5. Generate a medium difficulty exercise on "strutture dati"
curl -X POST http://localhost:8000/generate/exercise \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "strutture dati",
    "difficulty": "medium",
    "context": "Focus su alberi binari"
  }'

# 6. Check a solution
curl -X POST http://localhost:8000/check/solution \
  -H "Content-Type: application/json" \
  -d '{
    "exercise": "Implementa una funzione che calcola il fattoriale di un numero",
    "solution": "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n-1)"
  }'

# 7. Query theory
curl -X POST http://localhost:8000/query/theory \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Qual è la complessità temporale del QuickSort?"
  }'

# 8. Get related exercises for a topic
curl -X GET "http://localhost:8000/exercises/related/grafi?limit=3"

# 9. Explain a concept
curl -X POST http://localhost:8000/explain/albero-binario-di-ricerca
