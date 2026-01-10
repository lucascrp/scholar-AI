import React from 'react';
import { FileText, BrainCircuit, ArrowRight, CheckCircle2, PlayCircle, Trash2 } from 'lucide-react';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick }) => {
  const docsCount = course.documents.length;
  const exercisesCount = course.exercises.length;
  const completedCount = course.exercises.filter(e => e.status === 'reviewed').length;
  
  const getStatus = () => {
    if (course.deletedAt) return 'deleted';
    if (course.isCompleted) return 'completed';
    return 'active';
  };
  
  const status = getStatus();
  
  const StatusBadge = () => {
    switch (status) {
      case 'deleted':
        return (
          <span className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Trash2 size={10} /> Eliminato
          </span>
        );
      case 'completed':
        return (
          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={10} /> Completato
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <PlayCircle size={10} /> Attivo
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onClick(course)}
      className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <StatusBadge />
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {course.name}
      </h3>
      
      {course.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {course.description}
        </p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
          <FileText size={14} />
          <span>{docsCount} doc</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
          <BrainCircuit size={14} />
          <span>{completedCount}/{exercisesCount} esercizi</span>
        </div>
      </div>
      
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-1 text-indigo-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
          {status === 'deleted' ? 'Vedi dettagli' : 'Apri corso'} 
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
