"""Main study agent for Scholar-AI."""
from typing import List, Dict, Optional
from langchain_openai import ChatOpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from src.utils.config import config
from src.services.vector_store import VectorStoreService
from src.services.exercise_service import ExerciseService
from src.agent.prompts import THEORY_QUERY_TEMPLATE

class StudyAgent:
    """Main AI agent for helping students with exam preparation."""
    
    def __init__(self):
        """Initialize the study agent."""
        self.vector_store = VectorStoreService()
        self.exercise_service = ExerciseService()
        self.llm = ChatOpenAI(
            model=config.OPENAI_MODEL,
            openai_api_key=config.OPENAI_API_KEY,
            temperature=0.3  # Lower temperature for more consistent theory answers
        )
    
    def query_theory(self, question: str) -> Dict[str, any]:
        """Answer questions about theory using RAG.
        
        Args:
            question: Student's question
            
        Returns:
            Dictionary containing answer and sources
        """
        # Create retrieval QA chain
        retriever = self.vector_store.get_theory_retriever(k=4)
        
        prompt = PromptTemplate(
            template=THEORY_QUERY_TEMPLATE,
            input_variables=["context", "question"]
        )
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
            chain_type_kwargs={"prompt": prompt}
        )
        
        result = qa_chain.invoke({"query": question})
        
        # Extract sources
        sources = []
        source_docs = result.get("source_documents", [])
        seen_sources = set()
        
        for doc in source_docs:
            source = doc.metadata.get("source", "Unknown")
            if source not in seen_sources:
                sources.append(source)
                seen_sources.add(source)
        
        # Extract related topics from source documents
        related_topics = self._extract_related_topics(source_docs)
        
        return {
            "answer": result["result"],
            "sources": sources,
            "related_topics": related_topics
        }
    
    def _extract_related_topics(self, documents: List) -> List[str]:
        """Extract related topics from documents.
        
        Args:
            documents: List of source documents
            
        Returns:
            List of related topic strings
        """
        # This is a simplified implementation
        # Could be enhanced with NLP techniques
        topics = set()
        keywords = config.TOPIC_KEYWORDS
        
        for doc in documents[:3]:  # Check first 3 documents
            content = doc.page_content.lower()
            for keyword in keywords:
                if keyword in content:
                    topics.add(keyword.title())
        
        return list(topics)[:5]  # Return max 5 related topics
    
    def generate_study_plan(self, topics: List[str], exam_date: Optional[str] = None) -> str:
        """Generate a personalized study plan.
        
        Args:
            topics: List of topics to study
            exam_date: Optional exam date
            
        Returns:
            Study plan as text
        """
        topics_str = ", ".join(topics)
        date_str = f" L'esame è previsto per il {exam_date}." if exam_date else ""
        
        prompt = f"""Sei un tutor esperto. Crea un piano di studio personalizzato per i seguenti argomenti:

Argomenti: {topics_str}{date_str}

Il piano deve includere:
1. Ordine suggerito degli argomenti
2. Tempo stimato per ciascun argomento
3. Suggerimenti per lo studio efficace
4. Milestone intermedie

Fornisci un piano chiaro e strutturato."""

        response = self.llm.invoke(prompt)
        return response.content
    
    def get_related_exercises(self, topic: str, limit: int = 3) -> List[str]:
        """Get related exercises for a topic.
        
        Args:
            topic: Topic to search for
            limit: Maximum number of exercises to return
            
        Returns:
            List of exercise descriptions
        """
        docs = self.vector_store.search_exercises(topic, k=limit)
        
        exercises = []
        for doc in docs:
            # Extract first paragraph or first 200 chars
            content = doc.page_content.strip()
            if len(content) > 200:
                content = content[:200] + "..."
            exercises.append(content)
        
        return exercises
    
    def explain_concept(self, concept: str) -> str:
        """Provide a detailed explanation of a concept.
        
        Args:
            concept: Concept to explain
            
        Returns:
            Detailed explanation
        """
        result = self.query_theory(f"Spiega in dettaglio il concetto di {concept}")
        return result["answer"]
