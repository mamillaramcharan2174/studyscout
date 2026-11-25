import React from 'react';
import {
  X,
  Search,
  Trash2,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ResearchSession } from '../types';

interface SessionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ResearchSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export const SessionDrawer: React.FC<SessionDrawerProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!isOpen) return null;

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mainQuestion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                Saved Research Sessions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {sessions.length} recorded research workspace{sessions.length === 1 ? '' : 's'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/60">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search research topics or questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No research sessions match your search.</p>
              </div>
            ) : (
              filtered.map((s) => {
                const isActive = s.id === activeSessionId;
                const formattedDate = new Date(s.updatedAt || s.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    className={`group relative p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-teal-50/80 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-xs font-semibold line-clamp-2 ${
                          isActive
                            ? 'text-teal-900 dark:text-teal-200'
                            : 'text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400'
                        }`}
                      >
                        {s.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete session "${s.title}"?`)) {
                            onDeleteSession(s.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                      {s.mainQuestion}
                    </p>

                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                      <span>{formattedDate}</span>

                      <div className="flex items-center gap-1.5">
                        {s.documents.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            {s.documents.length} doc{s.documents.length > 1 ? 's' : ''}
                          </span>
                        )}
                        {s.report?.conflictsAndNuances && s.report.conflictsAndNuances.length > 0 && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/50 dark:border-amber-800/40">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {s.report.conflictsAndNuances.length} conflict
                          </span>
                        )}
                        {s.status === 'completed' && (
                          <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            Report
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
