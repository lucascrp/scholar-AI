import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trash2, 
  Settings, 
  GraduationCap,
  Cpu,
  ChevronRight
} from 'lucide-react';
import type { ViewType, ModelProgress } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  trashCount: number;
  modelStatus: ModelProgress;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  onNavigate, 
  trashCount,
  modelStatus 
}) => {
  const navItems = [
    { id: 'dashboard' as ViewType, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'courses' as ViewType, icon: BookOpen, label: 'I miei Corsi' },
  ];

  const getStatusColor = () => {
    switch (modelStatus.status) {
      case 'ready': return 'bg-green-500';
      case 'loading': return 'bg-yellow-500 animate-pulse';
      case 'generating': return 'bg-indigo-500 animate-pulse';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (modelStatus.status) {
      case 'ready': return 'Pronto';
      case 'loading': return `${modelStatus.progress}%`;
      case 'generating': return 'Generando...';
      case 'error': return 'Errore';
      default: return 'Non caricato';
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Scholar AI</h1>
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
              Study Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeView === item.id
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <item.icon size={20} />
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        ))}

        <div className="pt-4 pb-2 px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Sistema
          </p>
        </div>

        <button
          onClick={() => onNavigate('trash')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeView === 'trash'
              ? 'bg-red-50 text-red-700 font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Trash2 size={20} />
          <span className="flex-1 text-left">Cestino</span>
          {trashCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {trashCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeView === 'settings'
              ? 'bg-gray-100 text-gray-900 font-semibold'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings size={20} />
          <span className="flex-1 text-left">Impostazioni</span>
        </button>
      </nav>

      {/* Model Status */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Cpu size={18} className="text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">Modello AI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-xs text-gray-500">{getStatusText()}</span>
          </div>
          {modelStatus.status === 'loading' && (
            <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${modelStatus.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
