import React from 'react';
import {
  Search,
  Sparkles,
  X,
  Loader2,
  ArrowRight,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { QuickAnswerResult } from '../types';
import { QuickAnswerCard } from './QuickAnswerCard';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvertDeepResearch: (question: string) => void;
  geminiKey?: string;
  openaiKey?: string;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onConvertDeepResearch,
  geminiKey,
  openaiKey,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [answerResult, setAnswerResult] = React.useState<QuickAnswerResult | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sampleSearchQueries = [
    { label: '🧬 CRISPR Efficacy', q: 'What are the demonstrated therapeutic efficiencies of CRISPR-Cas9 vs off-target risks?' },
    { label: '🤖 AI Transformers', q: 'How does transformer self-attention scale computationally with sequence length?' },
    { label: '🌊 Marine Microplastics', q: 'How do microplastics bioaccumulate across marine food chains and impact humans?' },
    { label: '⚡ Renewable Grid Stability', q: 'How does high penetration of solar and wind inverters affect grid rotational inertia?' },
    { label: '🏛️ Bronze Age Collapse', q: 'What archaeological evidence explains the Late Bronze Age collapse in the Mediterranean?' },
    { label: '📊 Yield Curve Inversions', q: 'How do inverted treasury yield curves predict macroeconomic recessions?' },
  ];

  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSearchQuery(q);

    try {
      const res = await fetch('/api/quick-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          geminiKey,
          openaiKey,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnswerResult(data);
      } else {
        setErrorMsg(data.error || 'Failed to retrieve answer. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error connecting to search agent service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = (question: string) => {
    onClose();
    onConvertDeepResearch(question);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-20 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-3xl w-full p-5 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Universal Question Search & Instant Answers
              </h2>
              <p className="text-xs text-slate-500">
                Ask any question across science, engineering, history, humanities, or policy.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="relative flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search or ask any question (e.g. 'How does mRNA prompt cellular immunity?')..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Suggestions */}
        {!answerResult && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Suggested Sample Inquiries:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleSearchQueries.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSearch(item.q)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-teal-400 text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Answer Result View */}
        {answerResult && (
          <QuickAnswerCard
            result={answerResult}
            onConvertDeepResearch={handleConvert}
            onAskRelatedQuestion={(rq) => handleSearch(rq)}
            onClose={() => setAnswerResult(null)}
          />
        )}
      </div>
    </div>
  );
};
export default QuickSearchModal;
