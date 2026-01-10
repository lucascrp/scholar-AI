# Scholar AI - Engineering Study Assistant

A web application that helps engineering students prepare for exams using local AI in the browser (no API key required!).

## ✨ Features

- 🧠 **100% Local AI** - Uses WebLLM to run LLM models directly in the browser
- 📄 **PDF Upload** - Upload notes, slides and course materials
- 📝 **Exercise Generation** - Creates personalized exercises based on your materials
- 📸 **Photo Answers** - Take a photo of your work or upload a PDF
- ✅ **AI Review** - Receive detailed feedback and solutions
- 🔒 **Privacy** - Everything works offline in your browser
- 🆓 **Free** - No API key or subscription required
- 📐 **Math Support** - LaTeX rendering for mathematical formulas

## 🚀 How to Use

### Online (GitHub Pages)
Visit: `https://[your-username].github.io/scholar-AI/`

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Requirements

- **Browser**: Chrome 113+, Edge 113+ or another browser with WebGPU support
- **GPU**: A discrete GPU is recommended for better performance
- **RAM**: At least 8GB (the model uses ~2-4GB)

## 🎯 How It Works

1. **Create a Course** - Add a new course/exam
2. **Upload Materials** - Upload your PDF notes or text files
3. **Load the Model** - Download the AI model (first time only)
4. **Generate Exercises** - AI creates exercises based on your materials
5. **Solve** - Write your solution or upload a photo/PDF of your work
6. **Get Feedback** - AI reviews and provides detailed solutions

## 🔧 AI Model

| Model | Size | Description |
|-------|------|-------------|
| Llama 3.2 3B | ~2GB | Recommended - Best quality/speed balance |

The model is downloaded once and cached in your browser for instant loading on future visits.

## 📦 Deploy to GitHub Pages

```bash
# Build and deploy
npm run build
npm run deploy
```

Or configure GitHub Actions for automatic deployment on push.

## 🛠️ Technologies

- **React 18** + **TypeScript** - UI Framework
- **Vite** - Build tool
- **WebLLM** - Browser-based AI inference
- **Tailwind CSS** - Styling
- **PDF.js** - PDF text extraction
- **Tesseract.js** - OCR for images
- **KaTeX** - Mathematical formula rendering
- **IndexedDB** - Local storage

## 🧮 Math Notation Support

The app automatically converts common math notation to LaTeX:

| Input | Rendered |
|-------|----------|
| `x^2` | x² |
| `x_1` | x₁ |
| `t_alpha` | t_α |
| `sigma`, `mu` | σ, μ |
| `sqrt(x)` | √x |
| `a/b` | fraction |

## 📄 License

MIT

---

Made with ❤️ for engineering students