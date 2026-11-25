import React from 'react';
import {
  BookOpen,
  FolderOpen,
  PlusCircle,
  Settings,
  Share2,
  FileDown,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ResearchSession } from '../types';

interface NavbarProps {
  activeSession: ResearchSession | null;
  onOpenDrawer: () => void;
  onNewResearch: () => void;
  onOpenSettings: () => void;
  onExportMarkdown: () => void;
  onExportJSON: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSession,
  onOpenDrawer,
  onNewResearch,
  onOpenSettings,
  onExportMarkdown,
  onExportJSON,
}) => {
  const [exportOpen, setExportOpen] = React.useState(false);

  const handlePrint = () => {
    window.print();
    setExportOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Active Session Title */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            onClick={onNewResearch}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-teal-700 via-emerald-600 to-teal-800 dark:from-teal-300 dark:to-emerald-400 bg-clip-text text-transparent">
                  StudyScout
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                  Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                AI Research & Knowledge System for Students
              </p>
            </div>
          </div>

          {activeSession && (
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4 min-w-0">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Current:
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-xs xl:max-w-md">
                {activeSession.title}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  activeSession.status === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : activeSession.status === 'researching'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                    : activeSession.status === 'plan_ready'
                    ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {activeSession.status === 'plan_ready'
                  ? 'Plan Ready'
                  : activeSession.status.charAt(0).toUpperCase() + activeSession.status.slice(1)}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onNewResearch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Research</span>
          </button>

          <button
            onClick={onOpenDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Saved Research Sessions"
          >
            <FolderOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden sm:inline">Sessions</span>
          </button>

          {activeSession?.report && (
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {exportOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setExportOpen(false)}
                >
                  <button
                    onClick={() => {
                      onExportMarkdown();
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <FileDown className="w-3.5 h-3.5 text-teal-600" />
                    Download Markdown (.md)
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Printer className="w-3.5 h-3.5 text-teal-600" />
                    Print / Save as PDF
                  </button>
                  <button
                    onClick={() => {
                      onExportJSON();
                      setExportOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <Share2 className="w-3.5 h-3.5 text-teal-600" />
                    Export Full Session JSON
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Settings & AI Keys"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
