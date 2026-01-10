import React from 'react';
import { Download, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { DEFAULT_MODEL_NAME, DEFAULT_MODEL_SIZE, llmService } from '../services/llmService';
import type { ModelProgress } from '../types';

interface ModelStatusProps {
  modelProgress: ModelProgress;
  onRetry: () => void;
}

const ModelStatus: React.FC<ModelStatusProps> = ({ modelProgress, onRetry }) => {
  // Usa lo stato reale del servizio, non solo il callback
  const actuallyReady = llmService.isReady();
  
  const isLoading = modelProgress.status === 'loading';
  const isReady = modelProgress.status === 'ready' && actuallyReady;
  const isError = modelProgress.status === 'error';
  const isIdle = modelProgress.status === 'idle' || (modelProgress.status === 'ready' && !actuallyReady);

  // Se il modello è pronto, mostra solo un badge compatto
  if (isReady) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fade-in">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600" size={24} />
          <div>
            <p className="font-bold text-emerald-900">Modello AI Pronto</p>
            <p className="text-sm text-emerald-600">{DEFAULT_MODEL_NAME} caricato correttamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-fade-in">
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-xl ${isError ? 'bg-red-50' : 'bg-indigo-50'}`}>
          {isLoading ? (
            <Loader2 className="text-indigo-600 animate-spin" size={24} />
          ) : isError ? (
            <AlertTriangle className="text-red-500" size={24} />
          ) : (
            <Download className="text-indigo-600" size={24} />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">
            {isError ? 'Errore Caricamento' : isLoading ? 'Download Modello AI' : 'Caricamento Modello AI'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {isError 
              ? 'Si è verificato un errore durante il download'
              : `${DEFAULT_MODEL_NAME} (${DEFAULT_MODEL_SIZE}) - Download una tantum`
            }
          </p>
        </div>
      </div>

      {/* Progress bar durante il caricamento */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
              style={{ width: `${modelProgress.progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{modelProgress.message}</span>
            <span className="font-bold text-indigo-600">{modelProgress.progress}%</span>
          </div>
          <p className="text-xs text-gray-400">
            ⚡ Il modello viene salvato nel browser. I prossimi avvii saranno istantanei!
          </p>
        </div>
      )}

      {/* Messaggio idle - in attesa o modello da caricare */}
      {isIdle && (
        <div className="space-y-4">
          <div className="text-center py-4">
            <Download className="mx-auto text-indigo-400 mb-3" size={32} />
            <p className="text-gray-600">Modello non caricato</p>
            <p className="text-sm text-gray-400 mt-1">Clicca per scaricare il modello AI</p>
          </div>
          <button
            onClick={onRetry}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Scarica Modello ({DEFAULT_MODEL_SIZE})
          </button>
        </div>
      )}

      {/* Errore */}
      {isError && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-red-700">{modelProgress.message}</p>
          </div>
          <button
            onClick={onRetry}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Riprova Download
          </button>
        </div>
      )}
    </div>
  );
};

export default ModelStatus;
