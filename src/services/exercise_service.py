"""Exercise generation and solution checking service."""
from typing import List, Optional, Dict
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from src.utils.config import config
from src.services.vector_store import VectorStoreService
from src.models.schemas import DifficultyLevel

# Constants
MAX_EXERCISE_EXAMPLES = 2  # Maximum number of exercise examples to retrieve

class ExerciseService:
    """Service for generating exercises and checking solutions."""
    
    def __init__(self):
        """Initialize the exercise service."""
        self.vector_store = VectorStoreService()
        self.llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            openai_api_key=config.OPENAI_API_KEY,
            temperature=0.7
        )
    
    def generate_exercise(
        self, 
        topic: str, 
        difficulty: DifficultyLevel,
        context: Optional[str] = None
    ) -> Dict[str, any]:
        """Generate an exercise based on topic and difficulty.
        
        Args:
            topic: Topic for the exercise
            difficulty: Difficulty level
            context: Additional context or requirements
            
        Returns:
            Dictionary containing exercise and metadata
        """
        # Retrieve relevant theory
        theory_docs = self.vector_store.search_theory(topic, k=3)
        theory_context = "\n\n".join([doc.page_content for doc in theory_docs])
        
        # Retrieve similar exercises for inspiration
        exercise_docs = self.vector_store.search_exercises(topic, k=MAX_EXERCISE_EXAMPLES)
        exercise_examples = "\n\n".join([doc.page_content for doc in exercise_docs[:MAX_EXERCISE_EXAMPLES]]) if exercise_docs else "Nessun esempio disponibile."
        
        # Build prompt
        prompt = f"""Sei un professore esperto di ingegneria informatica. Devi creare un esercizio per studenti.

CONTESTO TEORICO:
{theory_context}

ESEMPI DI ESERCIZI SIMILI:
{exercise_examples}

REQUISITI:
- Argomento: {topic}
- Difficoltà: {difficulty.value}
{f'- Contesto aggiuntivo: {context}' if context else ''}

Crea un esercizio completo che:
1. Sia chiaro e ben formulato
2. Sia appropriato per il livello di difficoltà richiesto
3. Includa tutti i dati necessari
4. Sia basato sulla teoria fornita

Fornisci anche 2-3 suggerimenti utili per risolvere l'esercizio (senza dare la soluzione completa).

Formato della risposta:
ESERCIZIO:
[testo dell'esercizio]

SUGGERIMENTI:
- [suggerimento 1]
- [suggerimento 2]
- [suggerimento 3]

TEORIA CORRELATA:
[breve riassunto della teoria necessaria]
"""
        
        response = self.llm.invoke(prompt)
        response_text = response.content
        
        # Parse response
        exercise_text = ""
        hints = []
        related_theory = ""
        
        sections = response_text.split("SUGGERIMENTI:")
        if len(sections) > 1:
            exercise_text = sections[0].replace("ESERCIZIO:", "").strip()
            remaining = sections[1]
            
            theory_split = remaining.split("TEORIA CORRELATA:")
            if len(theory_split) > 1:
                hints_text = theory_split[0].strip()
                related_theory = theory_split[1].strip()
            else:
                hints_text = remaining.strip()
            
            # Extract hints
            for line in hints_text.split("\n"):
                line = line.strip()
                if line.startswith("-") or line.startswith("•"):
                    hints.append(line.lstrip("-•").strip())
        else:
            exercise_text = response_text.strip()
        
        return {
            "exercise": exercise_text,
            "topic": topic,
            "difficulty": difficulty.value,
            "hints": hints if hints else None,
            "related_theory": related_theory if related_theory else None
        }
    
    def check_solution(self, exercise: str, solution: str) -> Dict[str, any]:
        """Check a student's solution to an exercise.
        
        Args:
            exercise: The exercise text
            solution: Student's proposed solution
            
        Returns:
            Dictionary containing feedback and evaluation
        """
        # Get relevant theory for verification
        theory_docs = self.vector_store.search_theory(exercise, k=3)
        theory_context = "\n\n".join([doc.page_content for doc in theory_docs])
        
        # Get similar exercises with solutions
        exercise_docs = self.vector_store.search_exercises(exercise, k=2)
        reference_context = "\n\n".join([doc.page_content for doc in exercise_docs]) if exercise_docs else ""
        
        prompt = f"""Sei un professore esperto di ingegneria informatica. Devi valutare la soluzione di uno studente.

ESERCIZIO:
{exercise}

SOLUZIONE DELLO STUDENTE:
{solution}

TEORIA DI RIFERIMENTO:
{theory_context}

{f'ESEMPI DI RIFERIMENTO:{reference_context}' if reference_context else ''}

Analizza la soluzione e fornisci:
1. Se la soluzione è corretta o meno
2. Un punteggio da 0 a 100
3. Feedback dettagliato su cosa funziona e cosa no
4. Suggerimenti per migliorare (se necessario)
5. L'approccio corretto (se la soluzione è errata)

Formato della risposta:
VALUTAZIONE: [CORRETTA/PARZIALMENTE CORRETTA/ERRATA]
PUNTEGGIO: [numero da 0 a 100]

FEEDBACK:
[analisi dettagliata]

SUGGERIMENTI:
- [suggerimento 1]
- [suggerimento 2]

APPROCCIO CORRETTO:
[spiegazione dell'approccio corretto, se necessario]
"""
        
        response = self.llm.invoke(prompt)
        response_text = response.content
        
        # Parse response
        is_correct = "CORRETTA" in response_text.split("\n")[0]
        score = None
        feedback = ""
        suggestions = []
        correct_approach = ""
        
        # Extract score
        for line in response_text.split("\n"):
            if "PUNTEGGIO:" in line:
                try:
                    score = float(line.split("PUNTEGGIO:")[1].strip().split()[0])
                except (ValueError, IndexError):
                    score = 50.0 if is_correct else 30.0
                break
        
        # Extract sections
        sections = response_text.split("FEEDBACK:")
        if len(sections) > 1:
            remaining = sections[1]
            
            sugg_split = remaining.split("SUGGERIMENTI:")
            if len(sugg_split) > 1:
                feedback = sugg_split[0].strip()
                remaining = sugg_split[1]
                
                approach_split = remaining.split("APPROCCIO CORRETTO:")
                if len(approach_split) > 1:
                    suggestions_text = approach_split[0].strip()
                    correct_approach = approach_split[1].strip()
                else:
                    suggestions_text = remaining.strip()
                
                # Extract suggestions
                for line in suggestions_text.split("\n"):
                    line = line.strip()
                    if line.startswith("-") or line.startswith("•"):
                        suggestions.append(line.lstrip("-•").strip())
            else:
                feedback = remaining.strip()
        
        return {
            "is_correct": is_correct,
            "feedback": feedback or response_text,
            "score": score,
            "suggestions": suggestions if suggestions else None,
            "correct_approach": correct_approach if correct_approach else None
        }
