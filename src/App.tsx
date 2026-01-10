import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import CourseCard from './components/CourseCard';
import ExerciseList from './components/ExerciseList';
import DocumentUploader from './components/DocumentUploader';
import AnswerInput from './components/AnswerInput';
import MarkdownRenderer from './components/MarkdownRenderer';
import ModelStatus from './components/ModelStatus';
import { dbService, DEFAULT_SETTINGS } from './services/dbService';
import { llmService, DEFAULT_MODEL_ID } from './services/llmService';
import { generateId } from './services/pdfService';
import {
  Plus,
  ArrowLeft,
  Loader2,
  Wand2,
  BookOpen,
  Brain,
  Search,
  Clock,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Target,
  ClipboardList,
  AlertTriangle
} from 'lucide-react';
import type {
  Course,
  Exercise,
  ViewType,
  ModelProgress,
  StudyDocument,
  AppSettings,
  AnswerType
} from './types';

const TRASH_RETENTION_DAYS = 30;

const App: React.FC = () => {
  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [webGPUSupported, setWebGPUSupported] = useState<boolean | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  
  const [modelProgress, setModelProgress] = useState<ModelProgress>({
    status: 'not-loaded',
    progress: 0,
    message: ''
  });

  // Derived state
  const activeCourses = useMemo(() => 
    courses.filter(c => !c.deletedAt), [courses]
  );
  
  const trashedCourses = useMemo(() => 
    courses.filter(c => !!c.deletedAt), [courses]
  );
  
  const selectedCourse = useMemo(() => 
    courses.find(c => c.id === selectedCourseId) || null, 
    [courses, selectedCourseId]
  );
  
  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return activeCourses;
    const q = searchQuery.toLowerCase();
    return activeCourses.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q)
    );
  }, [activeCourses, searchQuery]);

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        // Check WebGPU support
        let supported = false;
        try {
          supported = await llmService.checkWebGPUSupport();
        } catch {
          supported = typeof navigator !== 'undefined' && 'gpu' in navigator;
        }
        setWebGPUSupported(supported);
        console.log('WebGPU supportato:', supported);

        // Load data from IndexedDB
        const savedCourses = await dbService.getAllCourses();
        const savedSettings = await dbService.getSettings();
        
        // Clean up old trash
        const now = Date.now();
        const expirationMs = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
        const cleanedCourses = savedCourses.filter(c => {
          if (!c.deletedAt) return true;
          return (now - c.deletedAt) < expirationMs;
        });
        
        setCourses(cleanedCourses);
        if (savedSettings) {
          setSettings(savedSettings);
        }

        // Setup LLM progress callback - aggiorna anche isModelReady
        llmService.setProgressCallback((progress) => {
          setModelProgress(progress);
          setIsModelReady(progress.status === 'ready');
        });

        // Verifica se il modello è già caricato (da sessione precedente in memoria)
        const alreadyReady = llmService.isReady();
        console.log('Modello già pronto?', alreadyReady);
        if (alreadyReady) {
          setIsModelReady(true);
          setModelProgress({
            status: 'ready',
            progress: 100,
            message: 'Modello pronto!'
          });
        } else if (supported) {
          // Auto-load the model if WebGPU is supported and model not loaded
          console.log('Avvio caricamento automatico modello...');
          // Small delay to let UI render first
          setTimeout(() => {
            llmService.loadModel(DEFAULT_MODEL_ID).catch(err => {
              console.error('Errore caricamento automatico:', err);
            });
          }, 500);
        }
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Save courses when changed
  useEffect(() => {
    if (!isLoading) {
      courses.forEach(course => dbService.saveCourse(course));
    }
  }, [courses, isLoading]);

  // Navigation
  const handleNavigate = useCallback((view: ViewType) => {
    setCurrentView(view);
    setSearchQuery('');
    if (view !== 'course-detail') {
      setSelectedCourseId(null);
    }
    if (view !== 'exercise') {
      setSelectedExercise(null);
    }
  }, []);

  // Course handlers
  const handleAddCourse = useCallback(() => {
    if (!newCourseName.trim()) return;
    
    const newCourse: Course = {
      id: generateId(),
      name: newCourseName.trim(),
      description: newCourseDescription.trim(),
      documents: [],
      exercises: [],
      isCompleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    setCourses(prev => [newCourse, ...prev]);
    setNewCourseName('');
    setNewCourseDescription('');
    setIsAddingCourse(false);
  }, [newCourseName, newCourseDescription]);

  const handleCourseClick = useCallback((course: Course) => {
    if (course.deletedAt) return;
    setSelectedCourseId(course.id);
    setCurrentView('course-detail');
  }, []);

  const handleDeleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.map(c => 
      c.id === id ? { ...c, deletedAt: Date.now() } : c
    ));
  }, []);

  const handleRestoreCourse = useCallback((id: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const { deletedAt, ...rest } = c;
        return rest as Course;
      }
      return c;
    }));
  }, []);

  const handlePermanentDelete = useCallback((id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    dbService.deleteCourse(id);
  }, []);

  // Document handlers
  const handleAddDocument = useCallback((doc: Omit<StudyDocument, 'id' | 'uploadedAt'>) => {
    if (!selectedCourseId) return;
    setIsExtracting(true);
    
    const newDoc: StudyDocument = {
      ...doc,
      id: generateId(),
      uploadedAt: Date.now()
    };
    
    setCourses(prev => prev.map(c => 
      c.id === selectedCourseId 
        ? { ...c, documents: [...c.documents, newDoc] }
        : c
    ));
    setIsExtracting(false);
  }, [selectedCourseId]);

  const handleRemoveDocument = useCallback((docId: string) => {
    if (!selectedCourseId) return;
    setCourses(prev => prev.map(c => 
      c.id === selectedCourseId 
        ? { ...c, documents: c.documents.filter(d => d.id !== docId) }
        : c
    ));
  }, [selectedCourseId]);

  // Exercise handlers
  const handleGenerateExercise = useCallback(async (topic?: string) => {
    if (!selectedCourse) {
      alert('Seleziona un corso prima di generare un esercizio.');
      return;
    }
    
    const modelReady = llmService.isReady();
    console.log('Tentativo generazione - Modello pronto:', modelReady);
    
    if (!modelReady) {
      alert('Il modello AI non è ancora caricato. Attendi il completamento del download o ricarica la pagina.');
      // Prova a ricaricare il modello
      llmService.loadModel(DEFAULT_MODEL_ID).catch(console.error);
      return;
    }
    
    if (selectedCourse.documents.length === 0) {
      alert('Carica almeno un documento prima di generare esercizi.');
      return;
    }
    
    setIsGenerating(true);
    try {
      console.log('Avvio generazione esercizio...');
      console.log('Corso:', selectedCourse.name);
      console.log('Documenti:', selectedCourse.documents.length);
      
      const partialEx = await llmService.generateExercise(selectedCourse, topic);
      console.log('Esercizio generato:', partialEx);
      
      const newExercise: Exercise = {
        id: generateId(),
        title: partialEx.title || 'Nuovo Esercizio',
        content: partialEx.content || '',
        difficulty: partialEx.difficulty || 'medium',
        topic: topic || undefined,
        status: 'pending',
        createdAt: Date.now()
      };
      
      setCourses(prev => prev.map(c => 
        c.id === selectedCourseId 
          ? { ...c, exercises: [...c.exercises, newExercise] }
          : c
      ));
      
      setSelectedExercise(newExercise);
      setCurrentView('exercise');
      setTopicInput('');
    } catch (error) {
      console.error('Errore generazione:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      alert(`Errore durante la generazione: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedCourse, selectedCourseId]);

  const handleExerciseSelect = useCallback((exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentView('exercise');
  }, []);

  const handleSubmitAnswer = useCallback(async (answer: { type: AnswerType; content: string }) => {
    if (!selectedCourse || !selectedExercise || !llmService.isReady()) return;
    
    setIsReviewing(true);
    try {
      const { feedback, solution } = await llmService.reviewAnswer(
        selectedCourse,
        selectedExercise,
        answer.content
      );
      
      const updatedExercise: Exercise = {
        ...selectedExercise,
        studentAnswer: {
          type: answer.type,
          content: answer.content,
          submittedAt: Date.now()
        },
        feedback,
        suggestedSolution: solution,
        status: 'reviewed',
        completedAt: Date.now()
      };
      
      setCourses(prev => prev.map(c => 
        c.id === selectedCourseId 
          ? { 
              ...c, 
              exercises: c.exercises.map(e => 
                e.id === selectedExercise.id ? updatedExercise : e
              )
            }
          : c
      ));
      
      setSelectedExercise(updatedExercise);
    } catch (error) {
      console.error('Errore correzione:', error);
      alert('Errore durante la correzione. Riprova.');
    } finally {
      setIsReviewing(false);
    }
  }, [selectedCourse, selectedExercise, selectedCourseId]);

  // Model handlers
  const handleLoadModel = useCallback(async () => {
    try {
      await llmService.loadModel(DEFAULT_MODEL_ID);
      // Forza aggiornamento stato dopo caricamento
      setIsModelReady(true);
      setModelProgress({
        status: 'ready',
        progress: 100,
        message: 'Modello pronto!'
      });
    } catch (error) {
      console.error('Errore caricamento modello:', error);
    }
  }, []);

  // Render views
  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
          <BookOpen className="mb-3 opacity-80" size={28} />
          <p className="text-indigo-100 text-sm font-medium">Corsi Attivi</p>
          <p className="text-4xl font-black mt-1">{activeCourses.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl text-white shadow-lg">
          <CheckCircle2 className="mb-3 opacity-80" size={28} />
          <p className="text-emerald-100 text-sm font-medium">Esercizi Completati</p>
          <p className="text-4xl font-black mt-1">
            {courses.reduce((acc, c) => acc + c.exercises.filter(e => e.status === 'reviewed').length, 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-2xl text-white shadow-lg">
          <Brain className="mb-3 opacity-80" size={28} />
          <p className="text-amber-100 text-sm font-medium">Totale Esercizi</p>
          <p className="text-4xl font-black mt-1">
            {courses.reduce((acc, c) => acc + c.exercises.length, 0)}
          </p>
        </div>
      </div>

      {/* WebGPU Warning */}
      {webGPUSupported === false && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-red-900">WebGPU non supportato</h3>
            <p className="text-sm text-red-700 mt-1">
              Il tuo browser non supporta WebGPU. Usa Chrome 113+, Edge 113+ o un browser compatibile per utilizzare l'AI.
            </p>
          </div>
        </div>
      )}

      {/* Model Status - Ready */}
      {modelProgress.status === 'ready' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-500" size={20} />
          <p className="text-green-800 font-medium">
            Modello AI caricato e pronto! Puoi generare esercizi.
          </p>
        </div>
      )}

      {/* Model Status */}
      {webGPUSupported !== false && (
        <ModelStatus
          modelProgress={modelProgress}
          onRetry={handleLoadModel}
        />
      )}

      {/* Recent Courses */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 mb-6">Corsi Recenti</h2>
        {activeCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.slice(0, 6).map(course => (
              <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Nessun corso creato. Inizia creandone uno!</p>
            <button
              onClick={() => {
                setCurrentView('courses');
                setIsAddingCourse(true);
              }}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              Crea il primo corso
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCourses = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">I Miei Corsi</h1>
          <p className="text-gray-500 mt-1">Gestisci i tuoi esami e materiali di studio</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cerca corso..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-48"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsAddingCourse(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            Nuovo
          </button>
        </div>
      </div>

      {/* Add Course Modal */}
      {isAddingCourse && (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 animate-slide-up">
          <h3 className="font-bold text-indigo-900 mb-4">Crea nuovo corso</h3>
          <div className="space-y-4">
            <input
              type="text"
              autoFocus
              placeholder="Nome dell'esame (es. Analisi Matematica I)"
              className="w-full px-4 py-3 rounded-xl border border-white focus:border-indigo-400 outline-none bg-white"
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCourse()}
            />
            <textarea
              placeholder="Descrizione del corso (opzionale)"
              className="w-full px-4 py-3 rounded-xl border border-white focus:border-indigo-400 outline-none bg-white resize-none h-24"
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddCourse}
                disabled={!newCourseName.trim()}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                Crea Corso
              </button>
              <button
                onClick={() => {
                  setIsAddingCourse(false);
                  setNewCourseName('');
                  setNewCourseDescription('');
                }}
                className="px-6 py-3 bg-white text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <CourseCard key={course.id} course={course} onClick={handleCourseClick} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">
            {searchQuery ? 'Nessun corso trovato' : 'Nessun corso creato'}
          </p>
        </div>
      )}
    </div>
  );

  const renderCourseDetail = () => {
    if (!selectedCourse) return null;

    return (
      <div className="space-y-8 animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => handleNavigate('courses')}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={20} />
          Torna ai corsi
        </button>

        {/* Course header */}
        <div>
          <h1 className="text-3xl font-black text-gray-900">{selectedCourse.name}</h1>
          {selectedCourse.description && (
            <p className="text-gray-500 mt-2">{selectedCourse.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exercise generator */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Brain className="text-indigo-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Genera Esercizio</h2>
                </div>
              </div>
              
              {!isModelReady ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl space-y-4">
                  {modelProgress.status === 'loading' ? (
                    <>
                      <Loader2 className="mx-auto text-indigo-500 animate-spin mb-3" size={32} />
                      <p className="text-gray-600 font-medium">Caricamento modello AI...</p>
                      <div className="max-w-xs mx-auto">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 transition-all" 
                            style={{ width: `${modelProgress.progress}%` }} 
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{modelProgress.progress}% - {modelProgress.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="mx-auto text-amber-500 mb-3" size={32} />
                      <p className="text-gray-600 font-medium">Modello AI non caricato</p>
                      <button
                        onClick={handleLoadModel}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                      >
                        Carica Modello
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="📚 Argomento (es: matrici, derivate, circuiti...)"
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={topicInput}
                      onChange={(e) => setTopicInput(e.target.value)}
                    />
                    <button
                      onClick={() => handleGenerateExercise(topicInput || undefined)}
                      disabled={isGenerating || selectedCourse.documents.length === 0}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isGenerating ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Wand2 size={18} />
                      )}
                      Genera
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    💡 <strong>Consiglio:</strong> Specifica un argomento per documenti lunghi (libri). Il sistema cercherà automaticamente le parti più rilevanti.
                  </p>
                  {selectedCourse.documents.length === 0 && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      ⚠️ Carica almeno un documento per generare esercizi
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Exercise list */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Esercizi</h2>
              <ExerciseList
                exercises={selectedCourse.exercises}
                onSelect={handleExerciseSelect}
              />
            </div>
          </div>

          {/* Sidebar - Documents */}
          <div className="space-y-6">
            <DocumentUploader
              documents={selectedCourse.documents}
              type="theory"
              onUpload={handleAddDocument}
              onRemove={handleRemoveDocument}
              isExtracting={isExtracting}
            />
            <DocumentUploader
              documents={selectedCourse.documents}
              type="exercise"
              onUpload={handleAddDocument}
              onRemove={handleRemoveDocument}
              isExtracting={isExtracting}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderExercise = () => {
    if (!selectedExercise || !selectedCourse) return null;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        {/* Back button */}
        <button
          onClick={() => setCurrentView('course-detail')}
          className="flex items-center gap-2 text-indigo-600 font-bold hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft size={20} />
          Torna al corso
        </button>

        {/* Exercise card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                selectedExercise.difficulty === 'hard' ? 'bg-red-100 text-red-600' :
                selectedExercise.difficulty === 'medium' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600'
              }`}>
                {selectedExercise.difficulty === 'easy' ? 'Facile' : 
                 selectedExercise.difficulty === 'medium' ? 'Medio' : 'Difficile'}
              </span>
              {selectedExercise.topic && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                  {selectedExercise.topic}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900">{selectedExercise.title}</h1>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            <MarkdownRenderer content={selectedExercise.content} />

            {/* Answer section */}
            {selectedExercise.status !== 'reviewed' && (
              <div className="pt-6 border-t border-gray-100">
                <AnswerInput
                  onSubmit={handleSubmitAnswer}
                  isProcessing={isReviewing}
                  disabled={modelProgress.status !== 'ready'}
                />
              </div>
            )}

            {/* Feedback section */}
            {selectedExercise.feedback && (
              <div className="space-y-8 pt-6 border-t border-gray-100">
                <div className="bg-indigo-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="text-indigo-600" size={20} />
                    <h3 className="font-bold text-indigo-900">Feedback</h3>
                  </div>
                  <MarkdownRenderer content={selectedExercise.feedback} />
                </div>

                <div className="bg-green-50 p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList className="text-green-600" size={20} />
                    <h3 className="font-bold text-green-900">Soluzione</h3>
                  </div>
                  <MarkdownRenderer content={selectedExercise.suggestedSolution || ''} />
                </div>

                <button
                  onClick={() => {
                    const resetExercise: Exercise = {
                      ...selectedExercise,
                      studentAnswer: undefined,
                      feedback: undefined,
                      suggestedSolution: undefined,
                      status: 'pending',
                      completedAt: undefined
                    };
                    setCourses(prev => prev.map(c =>
                      c.id === selectedCourseId
                        ? {
                            ...c,
                            exercises: c.exercises.map(e =>
                              e.id === selectedExercise.id ? resetExercise : e
                            )
                          }
                        : c
                    ));
                    setSelectedExercise(resetExercise);
                  }}
                  className="w-full py-3 text-indigo-600 font-bold border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors"
                >
                  Rifai esercizio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTrash = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Cestino</h1>
        <p className="text-gray-500 mt-1">
          I corsi vengono eliminati definitivamente dopo {TRASH_RETENTION_DAYS} giorni
        </p>
      </div>

      {trashedCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trashedCourses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2">{course.name}</h3>
              <p className="text-xs text-gray-400 mb-4">
                Eliminato il {new Date(course.deletedAt!).toLocaleDateString('it-IT')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestoreCourse(course.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
                >
                  <RotateCcw size={14} />
                  Ripristina
                </button>
                <button
                  onClick={() => handlePermanentDelete(course.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Elimina
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <Trash2 className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Il cestino è vuoto</p>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <h1 className="text-3xl font-black text-gray-900">Impostazioni</h1>
      
      <div className="bg-white p-6 rounded-2xl border border-gray-100">
        <h2 className="font-bold text-gray-900 mb-4">Modello AI</h2>
        <p className="text-sm text-gray-500 mb-4">
          Seleziona il modello da utilizzare per la generazione degli esercizi
        </p>
        <div className="space-y-3">
          {AVAILABLE_MODELS.map(model => (
            <button
              key={model.id}
              onClick={() => handleSelectModel(model.id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                settings.selectedModelId === model.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{model.name}</span>
                <span className="text-sm text-gray-400">{model.size}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{model.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-500 font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeView={currentView}
        onNavigate={handleNavigate}
        trashCount={trashedCourses.length}
        modelStatus={modelProgress}
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'courses' && renderCourses()}
          {currentView === 'course-detail' && renderCourseDetail()}
          {currentView === 'exercise' && renderExercise()}
          {currentView === 'trash' && renderTrash()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
};

export default App;
