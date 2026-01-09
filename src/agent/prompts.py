"""Prompt templates for the study agent."""

THEORY_QUERY_TEMPLATE = """Sei un assistente AI esperto in ingegneria informatica. 
Usa il seguente contesto per rispondere alla domanda dello studente in modo chiaro e preciso.

Contesto:
{context}

Domanda: {question}

Fornisci una risposta dettagliata ma concisa, citando i concetti chiave dalla teoria.
Se la domanda non può essere risposta con il contesto fornito, dillo chiaramente.

Risposta:"""

EXERCISE_GENERATION_TEMPLATE = """Sei un professore esperto di ingegneria informatica.
Crea un esercizio completo basato su:

Teoria disponibile:
{theory_context}

Esempi di esercizi:
{exercise_examples}

Requisiti:
- Argomento: {topic}
- Difficoltà: {difficulty}
{context_str}

L'esercizio deve essere:
1. Chiaro e ben formulato
2. Appropriato per il livello
3. Basato sulla teoria fornita
4. Completo di tutti i dati necessari

Genera l'esercizio in italiano."""

SOLUTION_CHECK_TEMPLATE = """Sei un professore che valuta soluzioni di esercizi di ingegneria informatica.

Esercizio:
{exercise}

Soluzione proposta:
{solution}

Teoria di riferimento:
{theory}

Valuta la soluzione considerando:
1. Correttezza
2. Completezza
3. Efficienza
4. Stile e chiarezza

Fornisci feedback costruttivo e un punteggio."""

THEORY_SUMMARY_TEMPLATE = """Riassumi i seguenti concetti teorici in modo chiaro e conciso:

{content}

Riassunto:"""
