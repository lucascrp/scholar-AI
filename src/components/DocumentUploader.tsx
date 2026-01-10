import React, { useRef } from 'react';
import { Upload, FileText, FileCheck, X, Loader2 } from 'lucide-react';
import type { StudyDocument, DocumentType } from '../types';

interface DocumentUploaderProps {
  documents: StudyDocument[];
  type: DocumentType;
  onUpload: (doc: Omit<StudyDocument, 'id' | 'uploadedAt'>) => void;
  onRemove: (id: string) => void;
  isExtracting: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  type,
  onUpload,
  onRemove,
  isExtracting
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = {
    theory: {
      title: 'Materiali Teorici',
      subtitle: 'Appunti, slide, libri',
      icon: FileText,
      color: 'indigo',
      accept: '.pdf,.txt'
    },
    exercise: {
      title: 'Esercizi di Esempio',
      subtitle: 'Esami passati, esercitazioni',
      icon: FileCheck,
      color: 'emerald',
      accept: '.pdf,.txt'
    },
    exam: {
      title: 'Temi d\'esame',
      subtitle: 'Prove precedenti',
      icon: FileCheck,
      color: 'amber',
      accept: '.pdf,.txt'
    }
  };

  const currentConfig = config[type];
  const Icon = currentConfig.icon;

  const filteredDocs = documents.filter(d => d.type === type);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg bg-${currentConfig.color}-50`}>
          <Icon size={20} className={`text-${currentConfig.color}-600`} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{currentConfig.title}</h3>
          <p className="text-xs text-gray-500">{currentConfig.subtitle}</p>
        </div>
      </div>

      {/* Document list */}
      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700 truncate">
                {doc.name}
              </span>
            </div>
            <button
              onClick={() => onRemove(doc.id)}
              className="p-1 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={14} className="text-red-500" />
            </button>
          </div>
        ))}
        {filteredDocs.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-4">
            Nessun documento caricato
          </p>
        )}
      </div>

      {/* Upload button */}
      <label className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
        isExtracting 
          ? 'border-gray-200 bg-gray-50 cursor-wait' 
          : `border-${currentConfig.color}-200 hover:border-${currentConfig.color}-400 hover:bg-${currentConfig.color}-50`
      }`}>
        {isExtracting ? (
          <Loader2 className="animate-spin text-gray-400 mb-2" size={24} />
        ) : (
          <Upload className={`text-gray-400 mb-2`} size={24} />
        )}
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          {isExtracting ? 'Elaborazione...' : 'Carica documento'}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={currentConfig.accept}
          disabled={isExtracting}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Import dinamico per evitare problemi con il bundler
              const { extractTextFromPDF } = await import('../services/pdfService');
              
              try {
                const content = file.name.endsWith('.txt')
                  ? await file.text()
                  : await extractTextFromPDF(file);
                
                onUpload({
                  name: file.name,
                  type,
                  content,
                  mimeType: file.type
                });
              } catch (error) {
                console.error('Errore upload:', error);
                alert('Errore durante l\'elaborazione del file');
              }
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />
      </label>
    </div>
  );
};

export default DocumentUploader;
