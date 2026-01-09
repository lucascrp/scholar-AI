# Scholar-AI: Engineering Study Agent

Un agente AI intelligente per aiutare gli studenti di ingegneria informatica nella preparazione agli esami.

## 🎯 Caratteristiche

- **Caricamento Documenti PDF**: Carica appunti teorici ed esercizi d'esame in formato PDF
- **Generazione Esercizi**: Propone esercizi specifici basati sui documenti caricati
- **Verifica Soluzioni**: Controlla le soluzioni proposte dagli studenti usando la teoria fornita
- **Sistema RAG**: Utilizza Retrieval-Augmented Generation per risposte accurate
- **API REST**: Interfaccia semplice per integrare con altre applicazioni

## 🚀 Installazione

### Prerequisiti

- Python 3.9 o superiore
- Una chiave API OpenAI

### Setup

1. Clona il repository:
```bash
git clone https://github.com/lucascrp/scholar-AI.git
cd scholar-AI
```

2. Crea un ambiente virtuale:
```bash
python -m venv venv
source venv/bin/activate  # Su Windows: venv\Scripts\activate
```

3. Installa le dipendenze:
```bash
pip install -r requirements.txt
```

4. Configura le variabili d'ambiente:
```bash
cp .env.example .env
# Modifica .env con la tua chiave API OpenAI
```

## 📖 Utilizzo

### Avvio del Server

```bash
python src/main.py
```

Il server sarà disponibile su `http://localhost:8000`

### API Endpoints

#### 1. Carica Documenti Teorici
```bash
POST /upload/theory
Content-Type: multipart/form-data

file: <pdf-file>
```

#### 2. Carica Esercizi d'Esame
```bash
POST /upload/exercises
Content-Type: multipart/form-data

file: <pdf-file>
```

#### 3. Genera Esercizi
```bash
POST /generate/exercise
Content-Type: application/json

{
  "topic": "strutture dati",
  "difficulty": "medium"
}
```

#### 4. Verifica Soluzione
```bash
POST /check/solution
Content-Type: application/json

{
  "exercise": "Implementa un albero binario di ricerca",
  "solution": "class BST: ..."
}
```

#### 5. Interroga la Teoria
```bash
POST /query/theory
Content-Type: application/json

{
  "question": "Cos'è un grafo?"
}
```

### Esempio con cURL

```bash
# Carica un documento teorico
curl -X POST -F "file=@appunti_algoritmi.pdf" http://localhost:8000/upload/theory

# Genera un esercizio
curl -X POST http://localhost:8000/generate/exercise \
  -H "Content-Type: application/json" \
  -d '{"topic": "algoritmi di ordinamento", "difficulty": "medium"}'

# Verifica una soluzione
curl -X POST http://localhost:8000/check/solution \
  -H "Content-Type: application/json" \
  -d '{
    "exercise": "Implementa il QuickSort",
    "solution": "def quicksort(arr): ..."
  }'
```

## 🏗️ Architettura

```
scholar-AI/
├── src/
│   ├── main.py                 # Entry point dell'applicazione
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── study_agent.py      # Agente AI principale
│   │   └── prompts.py          # Template dei prompt
│   ├── services/
│   │   ├── __init__.py
│   │   ├── document_service.py # Gestione documenti PDF
│   │   ├── vector_store.py     # Database vettoriale
│   │   └── exercise_service.py # Generazione e verifica esercizi
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py          # Modelli Pydantic
│   └── utils/
│       ├── __init__.py
│       └── config.py           # Configurazione
├── data/
│   └── uploads/                # Directory per PDF caricati
├── tests/                      # Test unitari
├── requirements.txt
├── .env.example
└── README.md
```

## 🧪 Testing

```bash
# Esegui tutti i test
pytest tests/

# Con coverage
pytest tests/ --cov=src --cov-report=html
```

## 🔧 Configurazione Avanzata

Modifica il file `.env` per personalizzare:

- `OPENAI_MODEL`: Modello GPT da utilizzare (default: gpt-4-turbo-preview)
- `EMBEDDING_MODEL`: Modello per gli embeddings (default: text-embedding-3-small)
- `MAX_UPLOAD_SIZE`: Dimensione massima file PDF (default: 10MB)
- `VECTOR_STORE_PATH`: Path per il database vettoriale

## 📚 Esempi d'Uso

### Scenario 1: Preparazione Esame di Algoritmi

1. Carica gli appunti teorici di algoritmi
2. Carica esercizi d'esame precedenti
3. Richiedi la generazione di esercizi su "ordinamento"
4. Svolgi l'esercizio e sottometti la soluzione per la verifica

### Scenario 2: Revisione Teoria

1. Carica materiali del corso
2. Fai domande specifiche: "Qual è la complessità del MergeSort?"
3. L'agente risponderà basandosi sui documenti caricati

## 🤝 Contribuire

Contributi, issues e feature requests sono benvenuti!

## 📝 Licenza

Questo progetto è sotto licenza MIT.

## 👨‍💻 Autore

Lucas Carpi - [@lucascrp](https://github.com/lucascrp)

## 🙏 Ringraziamenti

- LangChain per il framework AI
- OpenAI per i modelli GPT
- ChromaDB per il vector store