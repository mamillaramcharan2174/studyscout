import React from 'react';
import {
  Terminal,
  Search,
  FileText,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Brain,
  Zap,
} from 'lucide-react';
import { ToolExecutionLog } from '../types';

interface AgentTraceViewProps {
  logs: ToolExecutionLog[];
  isResearching: boolean;
  activeRound?: number;
  totalRounds?: number;
  currentThought?: string;
}

export const AgentTraceView: React.FC<AgentTraceViewProps> = ({
  logs,
  isResearching,
  activeRound = 1,
  totalRounds = 3,
  currentThought,
}) => {
  const [expandedLogs, setExpandedLogs] = React.useState<Record<string, boolean>>({});
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isResearching) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs.length, isResearching, currentThought]);

  const toggleExpand = (id: string) => {
    setExpandedLogs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'web_search':
        return <Search className="w-3.5 h-3.5 text-teal-600" />;
      case 'document_retrieval':
        return <FileText className="w-3.5 h-3.5 text-amber-600" />;
      case 'academic_search':
        return <GraduationCap className="w-3.5 h-3.5 text-purple-600" />;
      case 'evidence_verifier':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Terminal className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header Status Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
              isResearching
                ? 'bg-amber-500 agent-active-glow'
                : 'bg-teal-600'
            }`}
          >
            {isResearching ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <Terminal className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Plan-Act-Observe Execution Trace
              {isResearching && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse">
                  Agent Active (Round {activeRound} of {totalRounds})
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500">
              Live verifiable tool invocations, Zod-validated schemas, observations, and error recoveries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">{logs.length} tool calls executed</span>
        </div>
      </div>

      {/* Live Thinking Banner (if currently running) */}
      {isResearching && currentThought && (
        <div className="p-4 bg-teal-50/80 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/50 flex items-start gap-3 animate-in fade-in">
          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Brain className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <div className="text-xs">
            <span className="font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider text-[10px] block mb-0.5">
              Agent Deliberation & Reasoning
            </span>
            <p className="text-teal-950 dark:text-teal-100 italic font-serif">
              "{currentThought}"
            </p>
          </div>
        </div>
      )}

      {/* Logs Feed */}
      <div className="p-4 sm:p-5 space-y-3 max-h-[540px] overflow-y-auto font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No tool executions yet. Waiting for agent initiation...</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isExpanded = !!expandedLogs[log.id];

            return (
              <div
                key={log.id || index}
                className={`rounded-xl border transition-all ${
                  log.status === 'retry'
                    ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : log.status === 'failed'
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                    : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Step Header */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-400 text-[10px] w-5 text-right shrink-0">
                      #{index + 1}
                    </span>
                    <div className="p-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {getToolIcon(log.toolName)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                          {log.toolName}
                        </span>
                        {log.retryCount > 0 && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <RotateCcw className="w-2.5 h-2.5" />
                            Retry #{log.retryCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans truncate">
                        {log.thought}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-sans">
                      <Clock className="w-3 h-3" />
                      {log.durationMs}ms
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : log.status === 'retry'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                      }`}
                    >
                      {log.status}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Observation Snippet */}
                <div className="px-3 pb-3 pt-0">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-[11px] font-sans text-slate-700 dark:text-slate-300 leading-relaxed">
                    <strong className="text-teal-700 dark:text-teal-400 font-semibold font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                      Observation:
                    </strong>
                    {log.observation}
                  </div>
                </div>

                {/* Expanded Details: Zod Schema Inputs & Outputs */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 space-y-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider font-bold block mb-1">
                        Validated Tool Inputs (Zod Schema):
                      </span>
                      <pre className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200">
                        {JSON.stringify(log.validatedInputs, null, 2)}
                      </pre>
                    </div>

                    {log.validatedOutputs && (
                      <div>
                        <span className="text-slate-400 uppercase tracking-wider font-bold block mb-1">
                          Validated Outputs:
                        </span>
                        <pre className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-x-auto text-slate-800 dark:text-slate-200">
                          {JSON.stringify(log.validatedOutputs, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
