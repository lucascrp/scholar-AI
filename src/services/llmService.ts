import * as webllm from '@mlc-ai/web-llm';
import type { ModelProgress, AvailableModel, Course, Exercise } from '../types';

// Modello predefinito - Llama 3.2 3B (il migliore per qualità)
export const DEFAULT_MODEL_ID = 'Llama-3.2-3B-Instruct-q4f16_1-MLC';
export const DEFAULT_MODEL_NAME = 'Llama 3.2 3B';
export const DEFAULT_MODEL_SIZE = '~2GB';

// Manteniamo la lista per compatibilità
export const AVAILABLE_MODELS: AvailableModel[] = [
  {
    id: DEFAULT_MODEL_ID,
    name: DEFAULT_MODEL_NAME,
    size: DEFAULT_MODEL_SIZE,
    description: 'Modello AI per generazione esercizi',
    contextSize: 131072,
    recommended: true
  }
];

// ============== CONVERSIONE MATEMATICA ==============

// Converte notazioni matematiche comuni in LaTeX
function convertToLaTeX(text: string): string {
  let result = text;
  
  // Mappa lettere greche
  const greekLetters: Record<string, string> = {
    'alfa': '\\alpha', 'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma', 'Gamma': '\\Gamma',
    'delta': '\\delta', 'Delta': '\\Delta',
    'epsilon': '\\epsilon', 'eps': '\\epsilon',
    'zeta': '\\zeta',
    'eta': '\\eta',
    'theta': '\\theta', 'Theta': '\\Theta',
    'iota': '\\iota',
    'kappa': '\\kappa',
    'lambda': '\\lambda', 'Lambda': '\\Lambda',
    'mu': '\\mu',
    'nu': '\\nu',
    'xi': '\\xi', 'Xi': '\\Xi',
    'pi': '\\pi', 'Pi': '\\Pi',
    'rho': '\\rho',
    'sigma': '\\sigma', 'Sigma': '\\Sigma',
    'tau': '\\tau',
    'upsilon': '\\upsilon',
    'phi': '\\phi', 'Phi': '\\Phi',
    'chi': '\\chi',
    'psi': '\\psi', 'Psi': '\\Psi',
    'omega': '\\omega', 'Omega': '\\Omega'
  };
  
  // Converti pedici e apici con lettere greche: t_alfa -> $t_{\alpha}$
  for (const [name, latex] of Object.entries(greekLetters)) {
    // Pedici: x_alfa, t_alpha
    const subRegex = new RegExp(`([a-zA-Z])_(${name})\\b`, 'gi');
    result = result.replace(subRegex, (_, letter, greek) => {
      const latexGreek = greekLetters[greek.toLowerCase()] || greek;
      return `$${letter}_{${latexGreek}}$`;
    });
    
    // Apici: x^alfa
    const supRegex = new RegExp(`([a-zA-Z])\\^(${name})\\b`, 'gi');
    result = result.replace(supRegex, (_, letter, greek) => {
      const latexGreek = greekLetters[greek.toLowerCase()] || greek;
      return `$${letter}^{${latexGreek}}$`;
    });
    
    // Lettere greche standalone: alfa -> $\alpha$ (solo se non già in $)
    const standaloneRegex = new RegExp(`(?<!\\$[^$]*)\\b(${name})\\b(?![^$]*\\$)`, 'gi');
    result = result.replace(standaloneRegex, `$${latex}$`);
  }
  
  // Converti pedici numerici: x_1, x_12, H_0
  result = result.replace(/([a-zA-Z])_(\d+)/g, '$$$1_{$2}$$');
  
  // Converti apici numerici: x^2, y^3 (non già in $)
  result = result.replace(/(?<!\$)([a-zA-Z])(\^)(\d+)(?!\$)/g, '$$$1^{$3}$$');
  
  // Converti frazioni semplici: a/b -> $\frac{a}{b}$ (solo se sembra matematico)
  result = result.replace(/\b([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g, (match, num, den) => {
    // Solo se entrambi sono brevi (singoli caratteri o numeri)
    if (num.length <= 3 && den.length <= 3) {
      return `$\\frac{${num}}{${den}}$`;
    }
    return match;
  });
  
  // Converti sqrt: sqrt(x) -> $\sqrt{x}$
  result = result.replace(/sqrt\(([^)]+)\)/gi, '$\\sqrt{$1}$');
  
  // Converti sommatorie: sum, Sum
  result = result.replace(/\bsum\b/gi, '$\\sum$');
  
  // Converti integrali: integral, int
  result = result.replace(/\b(integral|int)\b/gi, '$\\int$');
  
  // Converti infinito
  result = result.replace(/\binfinity\b/gi, '$\\infty$');
  result = result.replace(/\binfinito\b/gi, '$\\infty$');
  
  // Converti !=, <=, >= in simboli
  result = result.replace(/!=/g, '$\\neq$');
  result = result.replace(/<=/g, '$\\leq$');
  result = result.replace(/>=/g, '$\\geq$');
  
  // Converti +/- e -/+
  result = result.replace(/\+\/-/g, '$\\pm$');
  result = result.replace(/-\/\+/g, '$\\mp$');
  
  // Pulisci doppi $$ che non sono display math
  result = result.replace(/\$\$([^$]+)\$\$/g, (match, content) => {
    // Se è molto corto, probabilmente è inline
    if (content.length < 30 && !content.includes('\n')) {
      return `$${content}$`;
    }
    return match;
  });
  
  // Unisci $ adiacenti: $x$ $y$ -> $x \, y$ (opzionale, può essere rimosso)
  result = result.replace(/\$\s*\$\s*\$/g, '$ $');
  
  return result;
}

// ============== SISTEMA RAG SEMPLICE ==============

// Divide il testo in chunks sovrapposti
function chunkText(text: string, chunkSize: number = 500, overlap: number = 100): string[] {
  const chunks: string[] = [];
  
  // Prima dividi per paragrafi/sezioni naturali
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  
  for (const para of paragraphs) {
    if (currentChunk.length + para.length < chunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + para;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // Se il paragrafo è troppo lungo, spezzalo
      if (para.length > chunkSize) {
        const words = para.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          if (currentChunk.length + word.length + 1 < chunkSize) {
            currentChunk += (currentChunk ? ' ' : '') + word;
          } else {
            if (currentChunk) chunks.push(currentChunk);
            currentChunk = word;
          }
        }
      } else {
        currentChunk = para;
      }
    }
  }
  if (currentChunk) chunks.push(currentChunk);
  
  return chunks;
}

// Calcola la similarità TF-IDF semplificata tra query e chunk
function calculateRelevance(chunk: string, query: string): number {
  const chunkLower = chunk.toLowerCase();
  const queryWords = query.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2)
    .filter(w => !['per', 'con', 'che', 'del', 'della', 'delle', 'dei', 'degli', 'una', 'uno'].includes(w));
  
  let score = 0;
  
  // Conta occorrenze delle parole chiave
  for (const word of queryWords) {
    const regex = new RegExp(word, 'gi');
    const matches = chunkLower.match(regex);
    if (matches) {
      score += matches.length * 2;
    }
    // Bonus per match esatto di frasi
    if (chunkLower.includes(query.toLowerCase())) {
      score += 10;
    }
  }
  
  // Bonus per chunks con formule matematiche (rilevanti per esercizi)
  if (chunk.match(/\$[^$]+\$|\\[a-z]+{|[=+\-*/^]/i)) {
    score += 1;
  }
  
  // Bonus per chunks con numeri (probabilmente esempi)
  if (chunk.match(/\d+(\.\d+)?/)) {
    score += 0.5;
  }
  
  return score;
}

// Recupera i chunks più rilevanti (RAG)
function retrieveRelevantChunks(text: string, query: string, maxChars: number): string {
  if (text.length <= maxChars) {
    return text;
  }
  
  // Chunking
  const chunks = chunkText(text, 400, 50);
  console.log(`RAG: ${chunks.length} chunks creati dal documento`);
  
  // Calcola rilevanza per ogni chunk
  const scored = chunks.map((chunk, idx) => ({
    chunk,
    idx,
    score: calculateRelevance(chunk, query)
  }));
  
  // Ordina per rilevanza
  scored.sort((a, b) => b.score - a.score);
  
  // Prendi i chunks più rilevanti mantenendo un po' di ordine originale
  const topChunks = scored.slice(0, 10); // Top 10 più rilevanti
  topChunks.sort((a, b) => a.idx - b.idx); // Riordina per posizione originale
  
  // Concatena fino al limite
  let result = '';
  for (const { chunk, score } of topChunks) {
    if (result.length + chunk.length + 10 <= maxChars) {
      result += (result ? '\n\n---\n\n' : '') + chunk;
      console.log(`RAG: Aggiunto chunk (score: ${score.toFixed(1)})`);
    }
  }
  
  // Se non abbiamo trovato nulla di rilevante, prendi l'inizio
  if (!result) {
    result = text.slice(0, maxChars);
    console.log('RAG: Nessun chunk rilevante trovato, uso inizio documento');
  }
  
  return result;
}

// Funzione legacy per compatibilità
function extractRelevantSections(text: string, topic: string | undefined, maxChars: number): string {
  if (!topic) {
    // Senza topic, usa l'inizio del documento
    return text.slice(0, maxChars);
  }
  
  // Usa il sistema RAG
  return retrieveRelevantChunks(text, topic, maxChars);
}

class LLMService {
  private engine: webllm.MLCEngine | null = null;
  private currentModelId: string | null = null;
  private onProgressCallback: ((progress: ModelProgress) => void) | null = null;
  private lastProgress: ModelProgress = { status: 'idle', progress: 0, message: '' };

  // Imposta callback per il progresso
  setProgressCallback(callback: (progress: ModelProgress) => void) {
    this.onProgressCallback = callback;
    // Notifica immediatamente lo stato corrente
    if (this.engine && this.currentModelId) {
      callback({
        status: 'ready',
        progress: 100,
        message: 'Modello pronto!',
        modelId: this.currentModelId
      });
    } else {
      callback(this.lastProgress);
    }
  }

  // Carica il modello
  async loadModel(modelId: string): Promise<void> {
    if (this.currentModelId === modelId && this.engine) {
      // Modello già caricato - notifica lo stato
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Modello già pronto!',
        modelId
      });
      return;
    }

    this.updateProgress({
      status: 'loading',
      progress: 0,
      message: 'Inizializzazione del modello...',
      modelId
    });

    try {
      console.log('Creazione engine WebLLM...');
      
      // Crea nuovo engine
      this.engine = new webllm.MLCEngine();
      
      // Imposta callback per il progresso del download
      this.engine.setInitProgressCallback((report) => {
        const progress = Math.round(report.progress * 100);
        console.log(`Download modello: ${progress}% - ${report.text}`);
        this.updateProgress({
          status: 'loading',
          progress,
          message: report.text,
          modelId
        });
      });

      // Carica il modello
      console.log('Caricamento modello:', modelId);
      await this.engine.reload(modelId);
      
      this.currentModelId = modelId;
      console.log('Modello caricato con successo!');
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Modello pronto!',
        modelId
      });
    } catch (error) {
      console.error('Errore caricamento modello:', error);
      this.engine = null;
      this.currentModelId = null;
      this.updateProgress({
        status: 'error',
        progress: 0,
        message: `Errore: ${error instanceof Error ? error.message : 'Sconosciuto'}`,
        modelId
      });
      throw error;
    }
  }

  // Genera un esercizio
  async generateExercise(course: Course, topic?: string): Promise<Partial<Exercise>> {
    if (!this.engine) {
      throw new Error('Modello non caricato. Vai alla Dashboard per caricare il modello.');
    }

    this.updateProgress({
      status: 'generating',
      progress: 0,
      message: 'Generazione esercizio...',
      modelId: this.currentModelId || undefined
    });

    // WebLLM usa context window di 4096 token di default
    // ~4 caratteri = 1 token, quindi max ~3000 caratteri per il contesto
    // lasciando spazio per prompt di sistema e risposta
    const MAX_CONTEXT_CHARS = 2500;
    const MAX_EXAMPLES_CHARS = 500;

    // Estrai contenuto teoria (usa chunking intelligente se c'è un topic)
    const fullTheory = course.documents
      .filter(d => d.type === 'theory')
      .map(d => d.content)
      .join('\n\n');
    
    const theoryContext = extractRelevantSections(fullTheory, topic, MAX_CONTEXT_CHARS);

    const exerciseExamples = course.documents
      .filter(d => d.type === 'exercise' || d.type === 'exam')
      .map(d => d.content)
      .join('\n\n')
      .slice(0, MAX_EXAMPLES_CHARS);

    console.log(`Usando contesto: ${theoryContext.length} chars teoria, ${exerciseExamples.length} chars esempi`);

    // Prompt minimale per risparmiare token
    const systemPrompt = `Professore di ${course.name}. Genera UN esercizio d'esame. Usa LaTeX: $formula$.`;

    const userPrompt = `${theoryContext ? `TEORIA:\n${theoryContext}\n\n` : ''}${exerciseExamples ? `ESEMPI:\n${exerciseExamples}\n\n` : ''}Genera esercizio${topic ? ` su: ${topic}` : ''}.
JSON: {"title":"...","content":"...","difficulty":"easy|medium|hard"}`;

    try {
      console.log('Generazione esercizio in corso...');
      console.log(`Lunghezza prompt totale: ~${systemPrompt.length + userPrompt.length} caratteri`);
      const response = await this.engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000  // Ridotto per lasciare spazio al prompt
      });

      const text = response.choices[0]?.message?.content || '';
      console.log('Risposta LLM:', text);
      
      // Estrai JSON dalla risposta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Fallback: usa la risposta come contenuto
        console.warn('JSON non trovato, uso fallback');
        this.updateProgress({
          status: 'ready',
          progress: 100,
          message: 'Esercizio generato!',
          modelId: this.currentModelId || undefined
        });
        return {
          title: topic || 'Esercizio',
          content: convertToLaTeX(text),
          difficulty: 'medium',
          topic: topic || undefined
        };
      }

      const data = JSON.parse(jsonMatch[0]);
      
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Esercizio generato!',
        modelId: this.currentModelId || undefined
      });

      return {
        title: data.title || 'Esercizio',
        content: convertToLaTeX(data.content || text),
        difficulty: data.difficulty || 'medium',
        topic: topic || undefined
      };
    } catch (error) {
      console.error('Errore generazione esercizio:', error);
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Errore generazione',
        modelId: this.currentModelId || undefined
      });
      throw error;
    }
  }

  // Correggi la risposta dello studente
  async reviewAnswer(
    course: Course,
    exercise: Exercise,
    studentAnswer: string
  ): Promise<{ feedback: string; solution: string }> {
    if (!this.engine) {
      throw new Error('Modello non caricato');
    }

    this.updateProgress({
      status: 'generating',
      progress: 0,
      message: 'Analisi risposta...',
      modelId: this.currentModelId || undefined
    });

    // Limiti fissi per stare nel context window di 4096 token
    const MAX_THEORY = 800;
    const MAX_ANSWER = 600;
    const MAX_EXERCISE = 400;

    // Contesto teorico per la correzione
    const fullTheory = course.documents
      .filter(d => d.type === 'theory')
      .map(d => d.content)
      .join('\n\n');
    
    // Estrai sezioni rilevanti basate sull'esercizio
    const theoryContext = extractRelevantSections(fullTheory, exercise.topic || exercise.title, MAX_THEORY);
    const trimmedAnswer = studentAnswer.slice(0, MAX_ANSWER);
    const trimmedExercise = exercise.content.slice(0, MAX_EXERCISE);

    console.log(`Review: ${theoryContext.length}+${trimmedExercise.length}+${trimmedAnswer.length} chars`);

    // Prompt più semplice e diretto
    const systemPrompt = `Sei un professore. Correggi la risposta dello studente in modo costruttivo.`;

    const userPrompt = `ESERCIZIO:
${trimmedExercise}

RISPOSTA STUDENTE:
${trimmedAnswer}

Fornisci:
1. FEEDBACK: cosa ha fatto bene e cosa no
2. SOLUZIONE: la soluzione corretta passo-passo`;

    try {
      const response = await this.engine.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1500
      });

      const text = response.choices[0]?.message?.content || '';
      console.log('Risposta correzione:', text);
      
      // Prova a estrarre JSON, altrimenti usa la risposta testuale
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[0]);
          this.updateProgress({
            status: 'ready',
            progress: 100,
            message: 'Correzione completata!',
            modelId: this.currentModelId || undefined
          });
          return {
            feedback: convertToLaTeX(data.feedback || 'Feedback non disponibile'),
            solution: convertToLaTeX(data.solution || 'Soluzione non disponibile')
          };
        } catch {
          // JSON non valido, continua con parsing testuale
        }
      }
      
      // Fallback: usa la risposta testuale direttamente
      // Cerca di separare feedback e soluzione
      let feedback = text;
      let solution = '';
      
      const solutionMatch = text.match(/soluzione[:\s]*([\s\S]*)/i);
      const feedbackMatch = text.match(/feedback[:\s]*([\s\S]*?)(?=soluzione|$)/i);
      
      if (feedbackMatch) {
        feedback = feedbackMatch[1].trim();
      }
      if (solutionMatch) {
        solution = solutionMatch[1].trim();
      }
      
      // Se non trova divisione, metti tutto nel feedback
      if (!solution) {
        feedback = text;
        solution = 'Vedi feedback sopra per la correzione completa.';
      }
      
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Correzione completata!',
        modelId: this.currentModelId || undefined
      });

      // Applica conversione LaTeX
      return { 
        feedback: convertToLaTeX(feedback), 
        solution: convertToLaTeX(solution) 
      };
    } catch (error) {
      console.error('Errore correzione:', error);
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Errore correzione',
        modelId: this.currentModelId || undefined
      });
      throw error;
    }
  }

  // Verifica supporto WebGPU (metodo istanza)
  async checkWebGPUSupport(): Promise<boolean> {
    return LLMService.checkWebGPUSupport();
  }

  // Verifica supporto WebGPU (metodo statico)
  static async checkWebGPUSupport(): Promise<boolean> {
    if (!(navigator as any).gpu) {
      return false;
    }
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      return adapter !== null;
    } catch {
      return false;
    }
  }

  // Helper per aggiornare il progresso
  private updateProgress(progress: ModelProgress) {
    this.lastProgress = progress;
    if (this.onProgressCallback) {
      this.onProgressCallback(progress);
    }
  }

  // Stato corrente
  isReady(): boolean {
    const ready = this.engine !== null && this.currentModelId !== null;
    return ready;
  }

  getCurrentModelId(): string | null {
    return this.currentModelId;
  }

  // Verifica e aggiorna lo stato del progresso
  syncProgressState(): void {
    if (this.isReady()) {
      this.updateProgress({
        status: 'ready',
        progress: 100,
        message: 'Modello pronto!',
        modelId: this.currentModelId || undefined
      });
    }
  }

  // Scarica il modello dalla memoria
  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.currentModelId = null;
    }
  }
}

// Singleton
export const llmService = new LLMService();
