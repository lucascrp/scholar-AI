"""Document processing service for PDF files."""
from pathlib import Path
from typing import List
from langchain.schema import Document
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from src.utils.config import config
from src.services.vector_store import VectorStoreService

class DocumentService:
    """Service for processing and managing PDF documents."""
    
    def __init__(self):
        """Initialize the document service."""
        self.vector_store = VectorStoreService()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=config.CHUNK_SIZE,
            chunk_overlap=config.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
    
    def process_pdf(self, file_path: Path) -> List[Document]:
        """Process a PDF file and split into chunks.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            List of Document chunks
        """
        loader = PyPDFLoader(str(file_path))
        documents = loader.load()
        
        # Add metadata
        for doc in documents:
            doc.metadata["source"] = file_path.name
            
        # Split into chunks
        chunks = self.text_splitter.split_documents(documents)
        return chunks
    
    def add_theory_document(self, file_path: Path) -> int:
        """Process and add a theory document to the vector store.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Number of chunks processed
        """
        chunks = self.process_pdf(file_path)
        # Add document type to metadata
        for chunk in chunks:
            chunk.metadata["document_type"] = "theory"
        
        num_chunks = self.vector_store.add_documents_to_theory(chunks)
        return num_chunks
    
    def add_exercise_document(self, file_path: Path) -> int:
        """Process and add an exercise document to the vector store.
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Number of chunks processed
        """
        chunks = self.process_pdf(file_path)
        # Add document type to metadata
        for chunk in chunks:
            chunk.metadata["document_type"] = "exercise"
        
        num_chunks = self.vector_store.add_documents_to_exercises(chunks)
        return num_chunks
    
    def save_uploaded_file(self, file_content: bytes, filename: str) -> Path:
        """Save an uploaded file to disk.
        
        Args:
            file_content: File content as bytes
            filename: Name of the file
            
        Returns:
            Path to the saved file
        """
        config.ensure_directories()
        file_path = config.UPLOAD_FOLDER / filename
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        return file_path
