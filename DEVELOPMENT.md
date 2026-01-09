# Scholar-AI Development Guide

## Project Structure

```
scholar-AI/
├── src/                    # Source code
│   ├── agent/             # AI agent implementation
│   │   ├── study_agent.py # Main study agent
│   │   └── prompts.py     # Prompt templates
│   ├── services/          # Business logic services
│   │   ├── document_service.py
│   │   ├── vector_store.py
│   │   └── exercise_service.py
│   ├── models/            # Data models
│   │   └── schemas.py
│   ├── utils/             # Utilities
│   │   └── config.py
│   └── main.py            # FastAPI application
├── tests/                 # Test suite
├── data/                  # Data directory
│   └── uploads/           # Uploaded PDFs
├── requirements.txt       # Python dependencies
└── .env                   # Environment variables
```

## Key Components

### 1. Study Agent (`src/agent/study_agent.py`)

The main AI agent that orchestrates interactions with students. Key features:
- Theory query using RAG
- Exercise generation
- Study plan creation
- Concept explanation

### 2. Document Service (`src/services/document_service.py`)

Handles PDF processing:
- Loads PDF files
- Splits text into chunks
- Stores in vector database

### 3. Exercise Service (`src/services/exercise_service.py`)

Manages exercises:
- Generates exercises based on theory and examples
- Evaluates student solutions
- Provides feedback

### 4. Vector Store (`src/services/vector_store.py`)

ChromaDB integration:
- Stores document embeddings
- Semantic search
- Separate collections for theory and exercises

## Development Workflow

### Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your OpenAI API key

# Run the server
python src/main.py
```

### Running Tests

```bash
# Run all tests
pytest tests/

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/test_schemas.py -v
```

### Adding New Features

1. **New API Endpoint**:
   - Add schema in `src/models/schemas.py`
   - Implement logic in appropriate service
   - Add endpoint in `src/main.py`
   - Add tests

2. **New Agent Capability**:
   - Add method in `src/agent/study_agent.py`
   - Create prompt template in `src/agent/prompts.py`
   - Expose via API if needed

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `OPENAI_MODEL`: GPT model to use (default: gpt-4-turbo-preview)
- `EMBEDDING_MODEL`: Embedding model (default: text-embedding-3-small)
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)

### Vector Store

The application uses ChromaDB with two collections:
- `theory_documents`: Theory materials
- `exercise_documents`: Exercise and exam materials

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Best Practices

### Code Style

- Follow PEP 8
- Use type hints
- Write docstrings for all functions
- Keep functions focused and small

### Error Handling

- Use try-except blocks for external calls
- Return meaningful error messages
- Log errors for debugging

### Testing

- Write tests for new features
- Mock external dependencies (OpenAI, ChromaDB)
- Aim for >80% code coverage

## Troubleshooting

### Common Issues

1. **"ChromaDB not found"**
   - Ensure ChromaDB is installed: `pip install chromadb`
   - Check vector store path exists

2. **"OpenAI API Error"**
   - Verify API key in .env
   - Check API quota/limits
   - Ensure network connectivity

3. **"PDF processing failed"**
   - Verify PDF is not corrupted
   - Check file size limits
   - Ensure pypdf is installed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Future Enhancements

Potential features to add:
- User authentication
- Multi-language support
- Progress tracking
- Spaced repetition system
- Integration with learning platforms
- Mobile app
- Collaborative features
- Advanced analytics
