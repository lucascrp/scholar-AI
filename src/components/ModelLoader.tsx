import React from 'react';
import { AlertTriangle, Download, RefreshCw } from 'lucide-react';
import { AVAILABLE_MODELS } from '../services/llmService';
import type { ModelProgress } from '../types';

interface ModelLoaderProps {
  modelProgress: ModelProgress;
  selectedModelId: string;
  onSelectModel: (modelId: string) => void;
  onLoadModel: () => void;
  onRetry: () => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({
  modelProgress,
  selectedModelId,
  onSelectModel,
  onLoadModel,
  onRetry
}) => {
  const isLoading = modelProgress.status === 'loading';
  const isReady = modelProgress.status === 'ready';
  const isError = modelProgress.status === 'error';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-indigo-50 rounded-xl">
          <Download className="text-indigo-600" size={24} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Modello AI</h3>
          <p className="text-sm text-gray-500 mt-1">
            Seleziona e carica un modello per iniziare a generare esercizi
          </p>
        </div>
      </div>

      {/* Model selection */}
      <div className="space-y-3 mb-6">
        {AVAILABLE_MODELS.map(model => (
          <button
            key={model.id}
            onClick={() => !isLoading && onSelectModel(model.id)}
            disabled={isLoading}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedModelId === model.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-100 hover:border-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{model.name}</span>
                  {model.recommended && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                      CONSIGLIATO
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{model.description}</p>
              </div>
              <span className="text-sm font-medium text-gray-400">{model.size}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Progress / Status */}
      {isLoading && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-900">
              Download in corso...
            </span>
            <span className="text-sm font-bold text-indigo-600">
              {modelProgress.progress}%
            </span>
          </div>
          <div className="h-2 bg-indigo-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${modelProgress.progress}%` }}
            />
          </div>
          <p className="text-xs text-indigo-600 mt-2">{modelProgress.message}</p>
        </div>
      )}

      {isError && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl animate-fade-in">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={20} />
            <div>
              <p className="font-medium text-red-900">Errore durante il caricamento</p>
              <p className="text-sm text-red-600">{modelProgress.message}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="mt-3 flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            <RefreshCw size={14} /> Riprova
          </button>
        </div>
      )}

      {isReady && (
        <div className="mb-6 p-4 bg-green-50 rounded-xl animate-fade-in">
          <p className="font-medium text-green-900">✓ Modello caricato e pronto!</p>
        </div>
      )}

      {/* Load button */}
      {!isReady && !isLoading && (
        <button
          onClick={onLoadModel}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <Download size={20} />
          Carica Modello
        </button>
      )}

      {/* WebGPU warning */}
      <p className="text-xs text-gray-400 text-center mt-4">
        Richiede browser con WebGPU (Chrome 113+, Edge 113+).
        Il modello viene scaricato una sola volta.
      </p>
    </div>
  );
};

export default ModelLoader;
