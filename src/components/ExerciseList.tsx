import React from 'react';
import { CheckCircle2, Circle, Clock, ChevronRight } from 'lucide-react';
import type { Exercise } from '../types';

interface ExerciseListProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
}

const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onSelect }) => {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="text-gray-500">
          Nessun esercizio generato. Carica dei documenti e creane uno!
        </p>
      </div>
    );
  }

  const sortedExercises = [...exercises].sort((a, b) => b.createdAt - a.createdAt);

  const getDifficultyBadge = (difficulty: string) => {
    const classes = {
      easy: 'bg-green-50 text-green-600',
      medium: 'bg-orange-50 text-orange-600',
      hard: 'bg-red-50 text-red-600'
    };
    const labels = {
      easy: 'Facile',
      medium: 'Medio',
      hard: 'Difficile'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${classes[difficulty as keyof typeof classes]}`}>
        {labels[difficulty as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-3">
      {sortedExercises.map(ex => (
        <button
          key={ex.id}
          onClick={() => onSelect(ex)}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all text-left group"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {ex.status === 'reviewed' ? (
              <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
            ) : (
              <Circle size={24} className="text-gray-300 flex-shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                {ex.title}
              </h4>
              <div className="flex items-center gap-3 mt-1 text-xs">
                {getDifficultyBadge(ex.difficulty)}
                <span className="text-gray-400 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(ex.createdAt).toLocaleDateString('it-IT')}
                </span>
                {ex.topic && (
                  <span className="text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                    {ex.topic}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400 group-hover:text-indigo-600 transition-colors" />
        </button>
      ))}
    </div>
  );
};

export default ExerciseList;
