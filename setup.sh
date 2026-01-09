#!/bin/bash

# Setup script for Scholar-AI

echo "🎓 Scholar-AI Setup Script"
echo "=========================="
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | grep -oP '\d+\.\d+')
required_version="3.9"

if (( $(echo "$python_version < $required_version" | bc -l) )); then
    echo "❌ Error: Python 3.9 or higher is required"
    exit 1
fi

echo "✓ Python version: $(python3 --version)"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

echo "✓ Virtual environment created"
echo ""

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo "✓ Dependencies installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  Please edit .env and add your OpenAI API key"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Edit .env and add your OpenAI API key"
echo "3. Run the application: python src/main.py"
echo ""
