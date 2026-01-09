"""Test configuration and fixtures."""
import pytest
import os
from pathlib import Path

# Set test environment
os.environ["OPENAI_API_KEY"] = "test-key"

@pytest.fixture
def test_data_dir():
    """Fixture for test data directory."""
    return Path(__file__).parent / "test_data"

@pytest.fixture
def mock_pdf_path(test_data_dir):
    """Fixture for mock PDF path."""
    return test_data_dir / "test_theory.pdf"
