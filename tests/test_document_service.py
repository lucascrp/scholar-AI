"""Tests for the document service."""
import pytest
from pathlib import Path
from src.services.document_service import DocumentService
from unittest.mock import Mock, patch, MagicMock

class TestDocumentService:
    """Test cases for DocumentService."""
    
    def test_document_service_initialization(self):
        """Test that DocumentService initializes correctly."""
        service = DocumentService()
        assert service is not None
        assert service.vector_store is not None
        assert service.text_splitter is not None
    
    @patch('src.services.document_service.PyPDFLoader')
    def test_process_pdf(self, mock_loader):
        """Test PDF processing."""
        # Mock the PDF loader
        mock_doc = Mock()
        mock_doc.page_content = "Test content"
        mock_doc.metadata = {}
        
        mock_loader_instance = Mock()
        mock_loader_instance.load.return_value = [mock_doc]
        mock_loader.return_value = mock_loader_instance
        
        service = DocumentService()
        result = service.process_pdf(Path("test.pdf"))
        
        assert len(result) > 0
        mock_loader.assert_called_once()
    
    def test_save_uploaded_file(self, tmp_path):
        """Test saving uploaded files."""
        service = DocumentService()
        
        # Mock config to use tmp_path
        with patch('src.services.document_service.config') as mock_config:
            mock_config.UPLOAD_FOLDER = tmp_path
            mock_config.ensure_directories = Mock()
            
            content = b"Test PDF content"
            filename = "test.pdf"
            
            result_path = service.save_uploaded_file(content, filename)
            
            assert result_path.exists()
            assert result_path.read_bytes() == content
