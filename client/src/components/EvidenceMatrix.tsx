import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Scale,
  ArrowRight,
  ExternalLink,
  BookOpen,
  FileText,
  Globe,
} from 'lucide-react';
import { ResearchReport, Citation } from '../types';

interface EvidenceMatrixProps {
  report: ResearchReport;
  onSelectCitation: (citation: Citation) => void;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  report,
  onSelectCitation,
}) => {
  const { conflictsAndNuances, keyFindings, sources, limitationsAndGaps } = report;

  const findCitation = (idx: number) => sources.find((s) => s.citationIndex === idx);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Overview Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-indigo-500/10 border border-teal-200 dark:border-teal-800/60">
        <div className="flex items-center gap-2.5 mb-2">
          <Scale className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Multi-Source Evidence Matrix & Triangulation
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          The agent systematically cross-examines claims across <strong>Live Web Search</strong>, <strong>Student Documents</strong>, and <strong>Peer-Reviewed Academic Repositories</strong> to isolate high-confidence consensus from conflicting empirical claims.
        </p>
      </div>

      {/* Section 1: Conflicting Information & Discrepancies */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Identified Contradictions & Nuance Analysis ({conflictsAndNuances.length})
            </h3>
          </div>
          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/50">
            Empirical Divergence Flagged
          </span>
        </div>

        {conflictsAndNuances.map((c) => {
          const citA = findCitation(c.viewA.citationIndex);
          const citB = findCitation(c.viewB.citationIndex);

          return (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/60 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block mb-0.5">
                  Point of Contention
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {c.topic}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {c.description}
                </p>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* View A */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-teal-600" />
                      Perspective A ({c.viewA.sourceType.toUpperCase()})
                    </span>
                    {citA && (
                      <button
                        onClick={() => onSelectCitation(citA)}
                        className="text-[11px] font-mono text-teal-600 hover:underline"
                      >
                        [{c.viewA.citationIndex}] View Source
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-serif italic">
                    "{c.viewA.claim}"
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Source: {c.viewA.sourceTitle}
                  </p>
                </div>

                {/* View B */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <FileText className="w-3 h-3 text-amber-600" />
                      Perspective B ({c.viewB.sourceType.toUpperCase()})
                    </span>
                    {citB && (
                      <button
                        onClick={() => onSelectCitation(citB)}
                        className="text-[11px] font-mono text-amber-600 hover:underline"
                      >
                        [{c.viewB.citationIndex}] View Source
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-800 dark:text-slate-200 font-serif italic">
                    "{c.viewB.claim}"
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    Source: {c.viewB.sourceTitle}
                  </p>
                </div>
              </div>

              {/* Agent Synthesis and Verdict */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1">
                  Agent Evidentiary Synthesis & Nuance Resolution:
                </span>
                <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-sans">
                  {c.synthesisAndVerdict}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 2: Corroborated Agreements */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Corroborated High-Confidence Claims
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keyFindings.map((f, i) => (
            <div
              key={f.id || i}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-2.5 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {f.claim}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                  {f.confidence}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                {f.summary}
              </p>
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-400">Sources:</span>
                {f.citations.map((cIdx) => {
                  const cit = findCitation(cIdx);
                  return (
                    <button
                      key={cIdx}
                      onClick={() => cit && onSelectCitation(cit)}
                      className="px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold hover:bg-teal-100"
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

      {/* Section 3: Limitations & Gaps */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Critical Limitations & Knowledge Gaps
          </h3>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-2.5">
          {limitationsAndGaps.map((gap, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
              <span>{gap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
