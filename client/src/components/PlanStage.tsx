import React from 'react';
import {
  ListChecks,
  Plus,
  Trash2,
  ArrowRight,
  Globe,
  FileText,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ResearchPlan, SubQuestion } from '../types';

interface PlanStageProps {
  plan: ResearchPlan;
  onUpdatePlan: (updatedPlan: ResearchPlan) => void;
  onStartResearch: () => void;
  onBackToInput: () => void;
  hasDocuments: boolean;
}

export const PlanStage: React.FC<PlanStageProps> = ({
  plan,
  onUpdatePlan,
  onStartResearch,
  onBackToInput,
  hasDocuments,
}) => {
  const [subQuestions, setSubQuestions] = React.useState<SubQuestion[]>(plan.subQuestions);
  const [title, setTitle] = React.useState(plan.title);
  const [strategy, setStrategy] = React.useState(plan.strategy);

  const handleQuestionChange = (id: string, text: string) => {
    const updated = subQuestions.map((sq) => (sq.id === id ? { ...sq, question: text } : sq));
    setSubQuestions(updated);
    onUpdatePlan({ ...plan, title, strategy, subQuestions: updated });
  };

  const handleToggleSource = (
    id: string,
    source: 'web' | 'document' | 'academic'
  ) => {
    const updated = subQuestions.map((sq) => {
      if (sq.id !== id) return sq;
      const exists = sq.targetSources.includes(source);
      const newSources = exists
        ? sq.targetSources.filter((s) => s !== source)
        : [...sq.targetSources, source];
      return { ...sq, targetSources: newSources.length > 0 ? newSources : [source] };
    });
    setSubQuestions(updated);
    onUpdatePlan({ ...plan, title, strategy, subQuestions: updated });
  };

  const handleDeleteSubQuestion = (id: string) => {
    if (subQuestions.length <= 1) {
      alert('Your research plan must have at least one sub-question.');
      return;
    }
    const updated = subQuestions.filter((sq) => sq.id !== id);
    setSubQuestions(updated);
    onUpdatePlan({ ...plan, title, strategy, subQuestions: updated });
  };

  const handleAddSubQuestion = () => {
    const newId = `sub-q-${Date.now()}`;
    const newSq: SubQuestion = {
      id: newId,
      question: 'New investigative research sub-question...',
      rationale: 'Addresses specific student inquiry regarding methodology or conflicting observations.',
      targetSources: hasDocuments ? ['web', 'document'] : ['web', 'academic'],
      suggestedKeywords: ['empirical inquiry'],
      status: 'pending',
    };
    const updated = [...subQuestions, newSq];
    setSubQuestions(updated);
    onUpdatePlan({ ...plan, title, strategy, subQuestions: updated });
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToInput}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Question & Documents
        </button>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
          Step 2 of 3: Plan Review & Edit
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
            <ListChecks className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Agent-Generated Research Plan
            </span>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onUpdatePlan({ ...plan, title: e.target.value, strategy, subQuestions });
            }}
            className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none pb-1"
          />
        </div>

        {/* Strategy Description */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
            Autonomous Research Strategy
          </span>
          <textarea
            rows={2}
            value={strategy}
            onChange={(e) => {
              setStrategy(e.target.value);
              onUpdatePlan({ ...plan, title, strategy: e.target.value, subQuestions });
            }}
            className="w-full bg-transparent border-0 text-slate-700 dark:text-slate-300 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Sub-Questions Review & Editable List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Sub-Questions & Target Sources ({subQuestions.length})
            </h3>
            <button
              type="button"
              onClick={handleAddSubQuestion}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sub-Question
            </button>
          </div>

          <div className="space-y-3">
            {subQuestions.map((sq, index) => (
              <div
                key={sq.id}
                className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-teal-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={sq.question}
                      onChange={(e) => handleQuestionChange(sq.id, e.target.value)}
                      className="w-full text-sm font-semibold text-slate-900 dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-teal-500 focus:outline-none pb-0.5"
                    />
                    <p className="text-[11px] text-slate-500 mt-1 italic">
                      Rationale: {sq.rationale}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubQuestion(sq.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete sub-question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Target Source Selectors */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Sources to Query:
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSource(sq.id, 'web')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                        sq.targetSources.includes('web')
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700'
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                      }`}
                    >
                      <Globe className="w-3 h-3" />
                      Web Search
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSource(sq.id, 'document')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                        sq.targetSources.includes('document')
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      Uploaded Docs
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleSource(sq.id, 'academic')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border ${
                        sq.targetSources.includes('academic')
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700'
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-600'
                      }`}
                    >
                      <GraduationCap className="w-3 h-3" />
                      Academic DOIs
                    </button>
                  </div>

                  {sq.suggestedKeywords.length > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <span>Keywords:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-300">
                        {sq.suggestedKeywords.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Start Execution Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Review completed. The agent will execute native tool calls with Zod schema validation across all selected sources.
          </p>
          <button
            type="button"
            onClick={onStartResearch}
            className="px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 flex items-center gap-2 shrink-0 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Approve Plan & Launch Agent</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
