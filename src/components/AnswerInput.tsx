import React, { useState, useRef } from 'react';
import { FileText, Image, Send, Loader2, X, Camera } from 'lucide-react';
import { extractTextFromPDF } from '../services/pdfService';
import { extractTextFromImage, isImageFile, isPDFFile } from '../services/ocrService';
import type { AnswerType } from '../types';

interface AnswerInputProps {
  onSubmit: (answer: { type: AnswerType; content: string; fileName?: string }) => void;
  isProcessing: boolean;
  disabled: boolean;
}

const AnswerInput: React.FC<AnswerInputProps> = ({ onSubmit, isProcessing, disabled }) => {
  const [textAnswer, setTextAnswer] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: AnswerType; content: string } | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionProgress(0);

    try {
      let content = '';
      let type: AnswerType = 'text';

      if (isPDFFile(file)) {
        type = 'pdf';
        content = await extractTextFromPDF(file);
      } else if (isImageFile(file)) {
        type = 'image';
        content = await extractTextFromImage(file, setExtractionProgress);
      } else {
        throw new Error('Tipo di file non supportato');
      }

      setUploadedFile({
        name: file.name,
        type,
        content
      });
      setTextAnswer(content);
    } catch (error) {
      console.error('Errore estrazione:', error);
      alert('Errore durante l\'estrazione del testo. Riprova.');
    } finally {
      setIsExtracting(false);
      setExtractionProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = () => {
    if (!textAnswer.trim()) {
      alert('Scrivi o carica la tua risposta prima di inviare.');
      return;
    }

    onSubmit({
      type: uploadedFile?.type || 'text',
      content: textAnswer,
      fileName: uploadedFile?.name
    });
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setTextAnswer('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
          <Send size={16} />
          Inserisci la tua soluzione
        </div>
        
        {/* Upload buttons */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700">
            <FileText size={16} />
            <span className="hidden sm:inline">PDF</span>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isExtracting || isProcessing}
            />
          </label>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700">
            <Image size={16} />
            <span className="hidden sm:inline">Foto</span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isExtracting || isProcessing}
            />
          </label>
          
          <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium text-gray-700 sm:hidden">
            <Camera size={16} />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              disabled={isExtracting || isProcessing}
            />
          </label>
        </div>
      </div>

      {/* Extraction progress */}
      {isExtracting && (
        <div className="bg-indigo-50 rounded-xl p-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900">
                Estrazione testo in corso...
              </p>
              {extractionProgress > 0 && (
                <div className="mt-2 h-1.5 bg-indigo-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Uploaded file indicator */}
      {uploadedFile && !isExtracting && (
        <div className="bg-green-50 rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            {uploadedFile.type === 'pdf' ? (
              <FileText className="text-green-600" size={20} />
            ) : (
              <Image className="text-green-600" size={20} />
            )}
            <div>
              <p className="text-sm font-medium text-green-900">{uploadedFile.name}</p>
              <p className="text-xs text-green-600">Testo estratto correttamente</p>
            </div>
          </div>
          <button
            onClick={clearUpload}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
          >
            <X size={16} className="text-green-600" />
          </button>
        </div>
      )}

      {/* Text area */}
      <textarea
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder="Scrivi qui la tua soluzione, oppure carica un PDF o una foto del tuo svolgimento..."
        className="w-full h-64 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none font-mono text-sm resize-none transition-all"
        disabled={isExtracting || isProcessing}
      />

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={disabled || isProcessing || isExtracting || !textAnswer.trim()}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Analisi in corso...
          </>
        ) : (
          <>
            <Send size={20} />
            Invia per correzione
          </>
        )}
      </button>
    </div>
  );
};

export default AnswerInput;
