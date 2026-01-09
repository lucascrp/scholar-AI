# Quick Start Guide - Scholar-AI

## 🚀 Get Started in 5 Minutes

### Step 1: Clone and Setup

```bash
# Clone the repository
git clone https://github.com/lucascrp/scholar-AI.git
cd scholar-AI

# Run the setup script (creates venv and installs dependencies)
chmod +x setup.sh
./setup.sh

# Or manually:
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Configure API Key

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
nano .env  # or use your preferred editor

# In .env, set:
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

### Step 3: Start the Server

```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Start the server
python src/main.py

# The server will start on http://localhost:8000
# API docs available at http://localhost:8000/docs
```

### Step 4: Test the API

#### Option A: Using cURL

```bash
# Check health
curl http://localhost:8000/health

# Generate an exercise
curl -X POST http://localhost:8000/generate/exercise \
  -H "Content-Type: application/json" \
  -d '{"topic": "algoritmi di ordinamento", "difficulty": "medium"}'
```

#### Option B: Using Python Client

```python
# In a new terminal (with venv activated)
python client_example.py
```

#### Option C: Using the Interactive API Docs

1. Open your browser to http://localhost:8000/docs
2. Try out the endpoints directly from the Swagger UI
3. Click "Try it out" on any endpoint

## 📚 Basic Usage Flow

### 1. Upload Theory Documents

```bash
# Upload a PDF with theory/lecture notes
curl -X POST -F "file=@your_theory_notes.pdf" \
  http://localhost:8000/upload/theory
```

### 2. Upload Exercise Documents

```bash
# Upload a PDF with past exams or exercises
curl -X POST -F "file=@past_exams.pdf" \
  http://localhost:8000/upload/exercises
```

### 3. Generate a Practice Exercise

```bash
curl -X POST http://localhost:8000/generate/exercise \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "strutture dati",
    "difficulty": "medium",
    "context": "Focus on binary trees"
  }'
```

### 4. Submit Your Solution for Checking

```bash
curl -X POST http://localhost:8000/check/solution \
  -H "Content-Type: application/json" \
  -d '{
    "exercise": "Implement a binary search tree",
    "solution": "class BST:\n    def __init__(self):\n        self.root = None"
  }'
```

### 5. Ask Questions About Theory

```bash
curl -X POST http://localhost:8000/query/theory \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the time complexity of merge sort?"
  }'
```

## 🔧 Troubleshooting

### "Module not found" errors
```bash
# Make sure you activated the virtual environment
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "OpenAI API Error"
```bash
# Check your .env file has the correct API key
cat .env | grep OPENAI_API_KEY

# Make sure the key starts with sk-
# Get your key from https://platform.openai.com/api-keys
```

### "ChromaDB error"
```bash
# ChromaDB might need SQLite3
# On Ubuntu/Debian:
sudo apt-get install sqlite3

# On macOS:
brew install sqlite3
```

### Port 8000 already in use
```bash
# Change the port in .env file
echo "PORT=8080" >> .env

# Or kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

## 📖 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEVELOPMENT.md](DEVELOPMENT.md) for development guidelines
- Run the example scripts: `bash examples.sh`
- Explore the API docs: http://localhost:8000/docs

## 💡 Tips

1. **Start with small PDF files** (< 5MB) to test the system
2. **Use Italian** for best results since the prompts are in Italian
3. **Check the logs** if something goes wrong - they're printed to console
4. **Use the Swagger UI** at /docs for easy testing
5. **Try different difficulty levels**: easy, medium, hard

## 🆘 Need Help?

- Open an issue on GitHub
- Check the [DEVELOPMENT.md](DEVELOPMENT.md) guide
- Review the example code in `client_example.py`

Happy studying! 🎓
