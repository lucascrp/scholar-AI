// Tipi di documento che l'utente può caricare
export type DocumentType = 'theory' | 'exercise' | 'exam';

// Documento caricato dallo studente
export interface StudyDocument {
  id: string;
  name: string;
  type: DocumentType;
  content: string; // Testo estratto dal PDF
  originalFile?: string; // Base64 del file originale (opzionale)
  mimeType: string;
  uploadedAt: number;
}

// Difficoltà dell'esercizio
export type Difficulty = 'easy' | 'medium' | 'hard';

// Stato dell'esercizio
export type ExerciseStatus = 'pending' | 'solving' | 'submitted' | 'reviewed';

// Tipo di risposta dello studente
export type AnswerType = 'text' | 'pdf' | 'image';

// Risposta dello studente
export interface StudentAnswer {
  type: AnswerType;
  content: string; // Testo estratto o scritto
  originalFile?: string; // Base64 del file originale
  fileName?: string;
  submittedAt: number;
}

// Esercizio generato
export interface Exercise {
  id: string;
  title: string;
  content: string; // Testo dell'esercizio in Markdown
  difficulty: Difficulty;
  topic?: string;
  status: ExerciseStatus;
  studentAnswer?: StudentAnswer;
  feedback?: string;
  suggestedSolution?: string;
  createdAt: number;
  completedAt?: number;
}

// Corso/Esame
export interface Course {
  id: string;
  name: string;
  description: string;
  documents: StudyDocument[];
  exercises: Exercise[];
  isCompleted: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

// Viste dell'applicazione
export type ViewType = 
  | 'dashboard' 
  | 'courses' 
  | 'course-detail' 
  | 'exercise' 
  | 'settings'
  | 'trash';

// Stato del modello LLM
export type ModelStatus = 
  | 'idle'
  | 'not-loaded' 
  | 'loading' 
  | 'ready' 
  | 'error' 
  | 'generating';

// Progresso del download del modello
export interface ModelProgress {
  status: ModelStatus;
  progress: number; // 0-100
  message: string;
  modelId?: string;
}

// Modelli disponibili
export interface AvailableModel {
  id: string;
  name: string;
  size: string;
  description: string;
  contextSize?: number; // Dimensione context window in token
  recommended?: boolean;
}

// Impostazioni dell'app
export interface AppSettings {
  selectedModelId: string;
  theme: 'light' | 'dark' | 'system';
  language: 'it' | 'en';
}

// Statistiche dashboard
export interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  completedExercises: number;
  totalExercises: number;
  averageScore?: number;
}
