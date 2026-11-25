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
} from 'lucide-react';
import { UploadedDocument } from '../types';

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
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const sampleStarters = [
    {
      title: 'CRISPR-Cas9 Efficacy vs Off-Target Risks',
      query: 'What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?',
      sampleFile: 'CRISPR_Clinical_Trial_Audit_Notes.txt',
    },
    {
      title: 'AI in Radiology: Accuracy vs Demographic Bias',
      query: 'How does artificial intelligence diagnostic accuracy compare to clinical radiologists, and what disparities or bias exist across demographic cohorts?',
      sampleFile: 'Radiology_AI_MultiHospital_Audit.txt',
    },
    {
      title: 'Microplastics Trophic Transfer in Marine Chains',
      query: 'How do micro- and nanoplastics transfer across marine trophic levels, and what are the toxicological implications for human ingestion?',
      sampleFile: 'Microplastics_Marine_Trophic_Transfer.txt',
    },
    {
      title: 'Renewable Grid Inertia & Frequency Stability',
      query: 'How does high penetration of solar and wind inverter-based resources affect rotational inertia and grid frequency stability?',
    },
  ];

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

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      {/* Hero Heading */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Theme 4: Research & Knowledge Agents
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          What would you like to investigate today?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          StudyScout acts as your personal research scientist. Enter your research question, stage your course documents, and let the agent plan, search, fact-check, and synthesize a structured academic report.
        </p>
      </div>

      {/* Main Research Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Research Question or Thesis
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={question}
              onChange={(e) => onChangeQuestion(e.target.value)}
              placeholder="e.g. What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?"
              className="w-full p-4 rounded-xl text-sm sm:text-base bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 font-serif leading-relaxed placeholder:font-sans placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Quick Starters */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Recommended Research Starters:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sampleStarters.map((starter, i) => (
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
              Stage Student Documents (PDF, TXT, DOCX)
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

        {/* Generate Plan Action */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!question.trim() || isGeneratingPlan}
            onClick={onGeneratePlan}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
              !question.trim() || isGeneratingPlan
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20 hover:shadow-teal-500/30'
            }`}
          >
            {isGeneratingPlan ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Agent Decomposing Question & Synthesizing Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Editable Research Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
