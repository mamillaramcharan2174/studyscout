import React from 'react';
import {
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Layers,
  Scale,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ResearchReport, Citation, ToolExecutionLog } from '../types';
import { EvidenceMatrix } from './EvidenceMatrix';
import { AgentTraceView } from './AgentTraceView';

interface ReportViewProps {
  report: ResearchReport;
  logs: ToolExecutionLog[];
  onSelectCitation: (citation: Citation) => void;
  onRerunPlan: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  report,
  logs,
  onSelectCitation,
  onRerunPlan,
}) => {
  const [activeTab, setActiveTab] = React.useState<
    'report' | 'evidence' | 'logs' | 'sources'
  >('report');

  const {
    title,
    executiveSummary,
    keyFindings,
    subQuestionAnalyses,
    conflictsAndNuances,
    limitationsAndGaps,
    openQuestions,
    sources,
    metrics,
    generatedAt,
  } = report;

  const findCitation = (idx: number) => sources.find((s) => s.citationIndex === idx);

  // Helper to render text with clickable citation links [1], [2]
  const renderCitedText = (text: string) => {
    const parts = text.split(/(\[\d+\])/g);
    return parts.map((part, i) => {
      const match = part.match(/\[(\d+)\]/);
      if (match) {
        const cIdx = parseInt(match[1], 10);
        const cit = findCitation(cIdx);
        return (
          <button
            key={i}
            onClick={() => cit && onSelectCitation(cit)}
            className="inline-flex items-center px-1.5 py-0.2 mx-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-950 dark:hover:bg-teal-900 dark:text-teal-300 transition-colors"
            title={cit ? `${cit.title} (${cit.type})` : `Citation [${cIdx}]`}
          >
            {part}
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6 report-container animate-in fade-in duration-300">
      {/* Report Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5" />
            StudyScout Synthesized Research Report
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Generated {new Date(generatedAt).toLocaleDateString()} at{' '}
            {new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
          {title}
        </h1>

        {/* Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Sources</span>
            <span className="text-base font-extrabold text-teal-600">{metrics.totalSourcesAnalyzed}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Web Domains</span>
            <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">{metrics.webSourcesCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Doc Chunks</span>
            <span className="text-base font-extrabold text-amber-600">{metrics.documentChunksCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic DOIs</span>
            <span className="text-base font-extrabold text-purple-600">{metrics.academicPapersCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tool Calls</span>
            <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">{metrics.totalToolCalls}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Time</span>
            <span className="text-base font-extrabold text-slate-700 dark:text-slate-200">
              {(metrics.totalExecutionTimeMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto no-print">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'report'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Structured Report
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'evidence'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Evidence Matrix & Nuance ({conflictsAndNuances.length})
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Agent Audit Log ({logs.length})
          </button>

          <button
            onClick={() => setActiveTab('sources')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'sources'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Source Library ({sources.length})
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}

      {/* Tab 1: Structured Report */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              1. Executive Summary & Synthesis
            </h2>
            <div className="text-sm text-slate-800 dark:text-slate-200 font-serif leading-relaxed whitespace-pre-line space-y-3">
              {renderCitedText(executiveSummary)}
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              2. Key Findings & Empirical Claims
            </h2>

            <div className="space-y-3">
              {keyFindings.map((finding, idx) => (
                <div
                  key={finding.id || idx}
                  className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white font-mono text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{finding.claim}</span>
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                      {finding.confidence} Confidence
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 pl-7 leading-relaxed font-sans">
                    {renderCitedText(finding.summary)}
                  </p>

                  <div className="pl-7 flex items-center gap-2 pt-1">
                    <span className="text-[10px] text-slate-400">Cited Evidence:</span>
                    {finding.citations.map((cIdx) => {
                      const cit = findCitation(cIdx);
                      return (
                        <button
                          key={cIdx}
                          onClick={() => cit && onSelectCitation(cit)}
                          className="px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-mono font-bold hover:bg-teal-200"
                        >
                          [{cIdx}]
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sub-Question Deep Dives */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              3. Sub-Question Analysis & Evidence Logs
            </h2>

            <div className="space-y-4">
              {subQuestionAnalyses.map((sq, idx) => (
                <div
                  key={sq.subQuestionId || idx}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Q{idx + 1}: {sq.question}
                  </h3>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {renderCitedText(sq.answer)}
                  </p>

                  {sq.keyEvidence.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Direct Evidentiary Passages:
                      </span>
                      {sq.keyEvidence.map((ev, eIdx) => (
                        <div
                          key={eIdx}
                          className="text-[11px] font-serif italic text-slate-600 dark:text-slate-400 pl-3 border-l-2 border-teal-500"
                        >
                          {ev}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Conflicting Information Section (in structured report) */}
          {conflictsAndNuances.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/60 p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                4. Conflicting Information & Empirical Nuance
              </h2>

              <div className="space-y-3">
                {conflictsAndNuances.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2 text-xs"
                  >
                    <h3 className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      {c.topic}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{c.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-[10px] text-teal-700 uppercase block mb-1">
                          View A [{c.viewA.citationIndex}]
                        </span>
                        <p className="italic font-serif">"{c.viewA.claim}"</p>
                      </div>
                      <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="font-bold text-[10px] text-amber-700 uppercase block mb-1">
                          View B [{c.viewB.citationIndex}]
                        </span>
                        <p className="italic font-serif">"{c.viewB.claim}"</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 font-sans mt-2">
                      <strong>Synthesis:</strong> {c.synthesisAndVerdict}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Limitations & Open Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                5. Limitations & Evidentiary Gaps
              </h2>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {limitationsAndGaps.map((lim, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{lim}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-500" />
                6. Open Questions for Further Inquiry
              </h2>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                {openQuestions.map((oq, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                    <span>{oq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bibliography / Source List */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              7. Bibliography & Document Index ({sources.length} Sources)
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.map((s) => (
                <div
                  key={s.sourceId}
                  onClick={() => onSelectCitation(s)}
                  className="py-3 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/60 dark:hover:bg-slate-800/40 p-2 rounded-lg transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-md bg-teal-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      [{s.citationIndex}]
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                        {s.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 italic font-serif mt-0.5">
                        "{s.snippet}"
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="uppercase font-semibold">{s.type}</span>
                        {s.domain && <span>&bull; {s.domain}</span>}
                        {s.pageNumber && <span>&bull; Page {s.pageNumber}</span>}
                        <span>&bull; Accessed {s.accessedAt}</span>
                      </div>
                    </div>
                  </div>

                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 text-slate-400 hover:text-teal-600 transition-colors"
                      title="Open source link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Evidence Matrix */}
      {activeTab === 'evidence' && (
        <EvidenceMatrix report={report} onSelectCitation={onSelectCitation} />
      )}

      {/* Tab 3: Execution Logs */}
      {activeTab === 'logs' && (
        <AgentTraceView logs={logs} isResearching={false} />
      )}

      {/* Tab 4: Sources Library */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((s) => (
            <div
              key={s.sourceId}
              onClick={() => onSelectCitation(s)}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 cursor-pointer hover:border-teal-400 dark:hover:border-teal-600 transition-all shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-600 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                  [{s.citationIndex}]
                </span>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    s.type === 'academic'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : s.type === 'document'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                  }`}
                >
                  {s.type}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                {s.title}
              </h4>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-[11px] font-serif italic text-slate-600 dark:text-slate-300 line-clamp-3">
                "{s.snippet}"
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>{s.accessedAt}</span>
                {s.url && (
                  <span className="text-teal-600 hover:underline flex items-center gap-1">
                    Source Link <ExternalLink className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
