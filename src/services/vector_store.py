"""Vector store management using ChromaDB."""
from typing import List, Optional
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain.schema import Document
from src.utils.config import config

class VectorStoreService:
    """Service for managing vector stores for theory and exercises."""
    
    def __init__(self):
        """Initialize the vector store service."""
        self.embeddings = OpenAIEmbeddings(
            model=config.EMBEDDING_MODEL,
            openai_api_key=config.OPENAI_API_KEY
        )
        config.ensure_directories()
        
    def add_documents_to_theory(self, documents: List[Document]) -> int:
        """Add documents to the theory collection.
        
        Args:
            documents: List of Document objects to add
            
        Returns:
            Number of documents added
        """
        vector_store = Chroma(
            collection_name=config.THEORY_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        vector_store.add_documents(documents)
        return len(documents)
    
    def add_documents_to_exercises(self, documents: List[Document]) -> int:
        """Add documents to the exercises collection.
        
        Args:
            documents: List of Document objects to add
            
        Returns:
            Number of documents added
        """
        vector_store = Chroma(
            collection_name=config.EXERCISES_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        vector_store.add_documents(documents)
        return len(documents)
    
    def search_theory(self, query: str, k: int = 4) -> List[Document]:
        """Search theory documents.
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of relevant documents
        """
        vector_store = Chroma(
            collection_name=config.THEORY_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        return vector_store.similarity_search(query, k=k)
    
    def search_exercises(self, query: str, k: int = 3) -> List[Document]:
        """Search exercise documents.
        
        Args:
            query: Search query
            k: Number of results to return
            
        Returns:
            List of relevant documents
        """
        vector_store = Chroma(
            collection_name=config.EXERCISES_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        return vector_store.similarity_search(query, k=k)
    
    def get_theory_retriever(self, k: int = 4):
        """Get a retriever for theory documents.
        
        Args:
            k: Number of documents to retrieve
            
        Returns:
            Retriever object
        """
        vector_store = Chroma(
            collection_name=config.THEORY_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        return vector_store.as_retriever(search_kwargs={"k": k})
    
    def get_exercises_retriever(self, k: int = 3):
        """Get a retriever for exercise documents.
        
        Args:
            k: Number of documents to retrieve
            
        Returns:
            Retriever object
        """
        vector_store = Chroma(
            collection_name=config.EXERCISES_COLLECTION,
            embedding_function=self.embeddings,
            persist_directory=str(config.VECTOR_STORE_PATH)
        )
        return vector_store.as_retriever(search_kwargs={"k": k})
