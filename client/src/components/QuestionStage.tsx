import React from 'react';
import {
  Sparkles,
  Upload,
  FileText,
  X,
  Plus,
  BookOpen,
  ArrowRight,
  Database,
  Loader2,
  FileCheck,
  Search,
  Zap,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { UploadedDocument, QuickAnswerResult } from '../types';
import { QuickAnswerCard } from './QuickAnswerCard';

interface QuestionStageProps {
  question: string;
  onChangeQuestion: (q: string) => void;
  documents: UploadedDocument[];
  onUploadFiles: (files: FileList) => void;
  onRemoveDocument: (docId: string) => void;
  onLoadSampleDoc: (filename: string) => void;
  sampleDocs: Array<{ filename: string; title: string; sizeBytes: number }>;
  onGeneratePlan: () => void;
  isGeneratingPlan: boolean;
  geminiKey?: string;
  openaiKey?: string;
}

export const QuestionStage: React.FC<QuestionStageProps> = ({
  question,
  onChangeQuestion,
  documents,
  onUploadFiles,
  onRemoveDocument,
  onLoadSampleDoc,
  sampleDocs,
  onGeneratePlan,
  isGeneratingPlan,
  geminiKey,
  openaiKey,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  // Quick Answer State
  const [quickAnswer, setQuickAnswer] = React.useState<QuickAnswerResult | null>(null);
  const [isQuickAnswering, setIsQuickAnswering] = React.useState(false);
  const [quickAnswerError, setQuickAnswerError] = React.useState<string | null>(null);

  // Active Category Filter
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Topics' },
    { id: 'biomedical', label: '🧬 Biomedical & Genetics' },
    { id: 'ai', label: '🤖 AI & Computing' },
    { id: 'environmental', label: '🌊 Climate & Marine' },
    { id: 'energy', label: '⚡ Energy & Physics' },
    { id: 'humanities', label: '🏛️ History & Policy' },
  ];

  const sampleStarters = [
    {
      category: 'biomedical',
      title: 'CRISPR-Cas9 Efficacy vs Off-Target Risks',
      query: 'What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?',
      sampleFile: 'CRISPR_Clinical_Trial_Audit_Notes.txt',
    },
    {
      category: 'ai',
      title: 'AI in Radiology: Accuracy vs Demographic Bias',
      query: 'How does artificial intelligence diagnostic accuracy compare to clinical radiologists, and what disparities or bias exist across demographic cohorts?',
      sampleFile: 'Radiology_AI_MultiHospital_Audit.txt',
    },
    {
      category: 'environmental',
      title: 'Microplastics Trophic Transfer in Marine Chains',
      query: 'How do micro- and nanoplastics transfer across marine trophic levels, and what are the toxicological implications for human ingestion?',
      sampleFile: 'Microplastics_Marine_Trophic_Transfer.txt',
    },
    {
      category: 'energy',
      title: 'Renewable Grid Inertia & Frequency Stability',
      query: 'How does high penetration of solar and wind inverter-based resources affect rotational inertia and grid frequency stability?',
    },
    {
      category: 'humanities',
      title: 'Late Bronze Age Collapse in the Mediterranean',
      query: 'What archaeological and climatic factors caused the Late Bronze Age Collapse in the Eastern Mediterranean around 1200 BCE?',
    },
    {
      category: 'ai',
      title: 'Transformers vs State-Space Models (Mamba)',
      query: 'How does transformer self-attention computational complexity scale with context window compared to selective state-space models?',
    },
  ];

  const filteredStarters =
    activeCategory === 'all'
      ? sampleStarters
      : sampleStarters.filter((s) => s.category === activeCategory);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
    }
  };

  // Execute Quick Answer API
  const handleGetQuickAnswer = async (overrideQuestion?: string) => {
    const q = (overrideQuestion || question).trim();
    if (!q) return;

    setIsQuickAnswering(true);
    setQuickAnswerError(null);
    if (overrideQuestion) onChangeQuestion(overrideQuestion);

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
        setQuickAnswer(data);
      } else {
        setQuickAnswerError(data.error || 'Failed to retrieve quick answer.');
      }
    } catch (err) {
      setQuickAnswerError('Could not connect to answer agent service.');
    } finally {
      setIsQuickAnswering(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      {/* Hero Heading */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Theme 4: Research & Knowledge Agents
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Search or Investigate Any Research Question
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          StudyScout acts as your personal AI research scientist. Ask any question for an instant direct answer, or stage your course documents to generate an autonomous, multi-source academic report with citations and conflict analysis.
        </p>
      </div>

      {/* Main Research & Search Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-teal-600" />
              Ask or Search Any Question
            </label>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium hidden sm:inline">
              Instant Answer & Deep Research Modes
            </span>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => onChangeQuestion(e.target.value)}
              placeholder="e.g. What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?"
              className="w-full p-4 rounded-xl text-sm sm:text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-serif leading-relaxed placeholder:font-sans placeholder:text-slate-400"
            />
          </div>

          {/* Dual Action Buttons: Quick Answer vs Deep Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            <button
              type="button"
              disabled={!question.trim() || isQuickAnswering}
              onClick={() => handleGetQuickAnswer()}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm border flex items-center justify-center gap-2 transition-all ${
                !question.trim() || isQuickAnswering
                  ? 'border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40'
                  : 'border-teal-500/60 bg-teal-50/70 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-200 shadow-sm'
              }`}
            >
              {isQuickAnswering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                  <span>Searching Live Web Knowledge...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Get Quick Verified Answer</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!question.trim() || isGeneratingPlan}
              onClick={onGeneratePlan}
              className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                !question.trim() || isGeneratingPlan
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20 hover:shadow-teal-500/30'
              }`}
            >
              {isGeneratingPlan ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Multi-Source Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Deep Research Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Answer Error Message */}
        {quickAnswerError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
            {quickAnswerError}
          </div>
        )}

        {/* Inline Quick Answer Display */}
        {quickAnswer && (
          <QuickAnswerCard
            result={quickAnswer}
            onConvertDeepResearch={() => {
              onGeneratePlan();
            }}
            onAskRelatedQuestion={(rq) => handleGetQuickAnswer(rq)}
            onClose={() => setQuickAnswer(null)}
          />
        )}

        {/* Topic Category Explorer */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Explore Questions by Domain:
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  activeCategory === cat.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {filteredStarters.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChangeQuestion(starter.query);
                  if (starter.sampleFile && documents.length === 0) {
                    onLoadSampleDoc(starter.sampleFile);
                  }
                }}
                className="text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-teal-50/40 dark:hover:bg-teal-950/20 transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                  <span>{starter.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {starter.query}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Document Upload & Pre-loaded Samples Staging */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              Stage Student Documents for Cross-Referencing (PDF, TXT, DOCX)
            </span>

            {/* Load Sample Dropdown */}
            {sampleDocs.length > 0 && (
              <div className="relative group">
                <button
                  type="button"
                  className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium flex items-center gap-1"
                >
                  <Database className="w-3 h-3" />
                  Load Sample Document...
                </button>
                <div className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs hidden group-hover:block z-40">
                  {sampleDocs.map((s) => (
                    <button
                      key={s.filename}
                      type="button"
                      onClick={() => onLoadSampleDoc(s.filename)}
                      className="w-full text-left px-3 py-2 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drag & Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.docx,.md"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Drop course readings, lab reports, or syllabus files here, or <span className="text-teal-600 dark:text-teal-400 underline">browse</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Supports PDF, DOCX, TXT, Markdown (Max 15MB each)
            </p>
          </div>

          {/* Uploaded Documents List */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-semibold text-slate-400">
                Staged for Research ({documents.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-medium truncate max-w-xs">{doc.originalName}</span>
                    <span className="text-[10px] text-teal-600/80">
                      ({doc.pageCount} pgs, {doc.chunks.length} chunks)
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDocument(doc.id);
                      }}
                      className="p-0.5 text-teal-500 hover:text-rose-600 transition-colors"
                      title="Remove document"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default QuestionStage;
