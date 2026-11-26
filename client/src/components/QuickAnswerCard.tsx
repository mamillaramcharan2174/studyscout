import React from 'react';
import {
  Sparkles,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  HelpCircle,
  BookOpen,
  X,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { QuickAnswerResult } from '../types';

interface QuickAnswerCardProps {
  result: QuickAnswerResult;
  onConvertDeepResearch: (question: string) => void;
  onAskRelatedQuestion: (question: string) => void;
  onClose?: () => void;
}

export const QuickAnswerCard: React.FC<QuickAnswerCardProps> = ({
  result,
  onConvertDeepResearch,
  onAskRelatedQuestion,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    const text = `Question: ${result.question}\n\nAnswer:\n${result.directAnswer}\n\nKey Takeaways:\n${result.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\nSources:\n${result.sources.map((s) => `- ${s.title} (${s.url})`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-teal-200 dark:border-teal-800/80 p-5 sm:p-7 space-y-6 animate-in fade-in slide-in-from-top-3 duration-300 relative overflow-hidden">
      {/* Top Banner Accents */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              <Sparkles className="w-3 h-3 text-teal-600" />
              Verified Direct Answer
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              Answered via Live Web & Scholar Synthesis
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {result.question}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy answer to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close answer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Direct Answer Body */}
      <div className="space-y-3">
        <div className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-line bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-800">
          {result.directAnswer}
        </div>
      </div>

      {/* Key Takeaways */}
      {result.keyTakeaways && result.keyTakeaways.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            Core Empirical Takeaways
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {result.keyTakeaways.map((takeaway, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-teal-50/40 dark:bg-teal-950/20 border border-teal-100 dark:border-teal-900/50 text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verified Live Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              Verified Sources ({result.sources.length})
            </span>
            <span className="text-[10px] text-slate-400">Click to open reference</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {result.sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-white dark:bg-slate-850 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:text-teal-600">
                      {src.domain}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-teal-500 transition-colors shrink-0" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 line-clamp-1">
                    {src.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {src.snippet}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Related Questions Pills */}
      {result.relatedQuestions && result.relatedQuestions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Follow-Up Investigations:
          </span>
          <div className="flex flex-wrap gap-2">
            {result.relatedQuestions.map((rq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onAskRelatedQuestion(rq)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-teal-400 text-slate-700 dark:text-slate-300 hover:text-teal-600 flex items-center gap-1.5 transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-teal-500" />
                <span>{rq}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Convert to Deep Research Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Need a multi-source academic report with document parsing and conflict resolution?
        </p>

        <button
          type="button"
          onClick={() => onConvertDeepResearch(result.question)}
          className="w-full sm:w-auto py-2.5 px-5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Deep Agent Research on This Question</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
export default QuickAnswerCard;
