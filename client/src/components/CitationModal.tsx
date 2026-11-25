import React from 'react';
import { X, ExternalLink, BookOpen, Globe, FileText, Calendar } from 'lucide-react';
import { Citation } from '../types';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              [{citation.citationIndex}]
            </span>
            <div>
              <span
                className={`inline-block text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full mb-1 ${
                  citation.type === 'academic'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                    : citation.type === 'document'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    : 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300'
                }`}
              >
                {citation.type} Source
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {citation.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {citation.authors && (
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                Authors / Contributors
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5">
                {citation.authors}
              </p>
            </div>
          )}

          {citation.pageNumber && (
            <div>
              <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block">
                Document Location
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium mt-0.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                {citation.docName} &bull; Page {citation.pageNumber}
              </p>
            </div>
          )}

          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold text-[10px] block mb-1">
              Verbatim Evidence Snippet
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-serif italic text-xs leading-relaxed">
              "{citation.snippet}"
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Accessed: {citation.accessedAt}
            </span>

            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium hover:underline"
              >
                <span>Visit Source URL</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
