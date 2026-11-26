import React from 'react';
import { AuthGate } from './components/AuthGate';
import { Navbar } from './components/Navbar';
import { SessionDrawer } from './components/SessionDrawer';
import { SettingsModal } from './components/SettingsModal';
import { CitationModal } from './components/CitationModal';
import { QuestionStage } from './components/QuestionStage';
import { PlanStage } from './components/PlanStage';
import { AgentTraceView } from './components/AgentTraceView';
import { ReportView } from './components/ReportView';
import { FollowUpChat } from './components/FollowUpChat';
import { QuickSearchModal } from './components/QuickSearchModal';
import {
  ResearchSession,
  ResearchPlan,
  Citation,
  AppSettings,
  ToolExecutionLog,
  UserProfile,
} from './types';

export const App: React.FC = () => {
  // User Authentication State
  const [currentUser, setCurrentUser] = React.useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem('studyscout_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Application State
  const [sessions, setSessions] = React.useState<ResearchSession[]>([]);
  const [activeSession, setActiveSession] = React.useState<ResearchSession | null>(null);
  const [sampleDocs, setSampleDocs] = React.useState<Array<{ filename: string; title: string; sizeBytes: number }>>([]);
  const [settings, setSettings] = React.useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem('studyscout_settings');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // UI Modals & Drawers
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = React.useState(false);
  const [selectedCitation, setSelectedCitation] = React.useState<Citation | null>(null);

  // Workflow Stages: 'input' -> 'plan' -> 'researching' -> 'report'
  const [stage, setStage] = React.useState<'input' | 'plan' | 'researching' | 'report'>('input');
  const [question, setQuestion] = React.useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = React.useState(false);
  const [isResearching, setIsResearching] = React.useState(false);
  const [currentThought, setCurrentThought] = React.useState<string | undefined>();
  const [activeRound, setActiveRound] = React.useState(1);
  const [liveLogs, setLiveLogs] = React.useState<ToolExecutionLog[]>([]);

  // Follow-up chat loading state
  const [isFollowUpLoading, setIsFollowUpLoading] = React.useState(false);

  // Keyboard shortcut for Quick Search (Ctrl+K or Cmd+K)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Initial Load: Fetch Sessions and Sample Docs
  React.useEffect(() => {
    fetchSessions();
    fetchSampleDocs();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data: ResearchSession[] = await res.json();
        setSessions(data);
        if (!activeSession && data.length > 0) {
          // Default to the first session (sample CRISPR demo)
          selectSession(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  };

  const fetchSampleDocs = async () => {
    try {
      const res = await fetch('/api/sample-docs');
      if (res.ok) {
        const data = await res.json();
        setSampleDocs(data);
      }
    } catch (err) {
      console.error('Failed to fetch sample docs:', err);
    }
  };

  const selectSession = (session: ResearchSession) => {
    setActiveSession(session);
    setQuestion(session.mainQuestion || '');
    setLiveLogs(session.logs || []);

    if (session.report) {
      setStage('report');
    } else if (session.plan) {
      setStage('plan');
    } else {
      setStage('input');
    }
  };

  // 2. Start a New Research Session
  const handleNewResearch = async () => {
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mainQuestion: '' }),
      });
      if (res.ok) {
        const newSession: ResearchSession = await res.json();
        setSessions((prev) => [newSession, ...prev]);
        setActiveSession(newSession);
        setQuestion('');
        setLiveLogs([]);
        setStage('input');
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    }
  };

  // 3. Delete Session
  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = sessions.filter((s) => s.id !== id);
        setSessions(updated);
        if (activeSession?.id === id) {
          if (updated.length > 0) {
            selectSession(updated[0]);
          } else {
            handleNewResearch();
          }
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // 4. File Upload & Sample Loading
  const handleUploadFiles = async (files: FileList) => {
    if (!activeSession) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/documents`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession((prev) => (prev ? { ...prev, documents: data.documents } : null));
        fetchSessions();
      }
    } catch (err) {
      console.error('File upload error:', err);
    }
  };

  const handleLoadSampleDoc = async (filename: string) => {
    if (!activeSession) return;
    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/load-sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSession((prev) => (prev ? { ...prev, documents: data.documents } : null));
        fetchSessions();
      }
    } catch (err) {
      console.error('Load sample error:', err);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    if (!activeSession) return;
    const updatedDocs = activeSession.documents.filter((d) => d.id !== docId);
    setActiveSession({ ...activeSession, documents: updatedDocs });
  };

  // 5. Generate Research Plan
  const handleGeneratePlan = async () => {
    if (!activeSession || !question.trim()) return;
    setIsGeneratingPlan(true);

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          geminiKey: settings.geminiKey,
          openaiKey: settings.openaiKey,
        }),
      });

      if (res.ok) {
        const plan: ResearchPlan = await res.json();
        setActiveSession((prev) => (prev ? { ...prev, plan, title: plan.title, status: 'plan_ready' } : null));
        setStage('plan');
        fetchSessions();
      } else {
        const err = await res.json();
        alert(`Plan generation failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Generate plan error:', err);
      alert('Failed to connect to agent planning service.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // 6. Update Plan (User edits sub-questions before running)
  const handleUpdatePlan = async (updatedPlan: ResearchPlan) => {
    if (!activeSession) return;
    setActiveSession((prev) => (prev ? { ...prev, plan: updatedPlan, title: updatedPlan.title } : null));

    try {
      await fetch(`/api/sessions/${activeSession.id}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlan),
      });
    } catch (err) {
      console.error('Update plan error:', err);
    }
  };

  // 7. Start Research Loop with Real-Time SSE Stream
  const handleStartResearch = () => {
    if (!activeSession || !activeSession.plan) return;
    setIsResearching(true);
    setStage('researching');
    setLiveLogs([]);
    setCurrentThought('Initiating autonomous plan-act-observe research cycle...');

    const queryParams = new URLSearchParams();
    if (settings.geminiKey) queryParams.set('geminiKey', settings.geminiKey);
    if (settings.openaiKey) queryParams.set('openaiKey', settings.openaiKey);

    const eventSource = new EventSource(
      `/api/sessions/${activeSession.id}/research/stream?${queryParams.toString()}`
    );

    eventSource.addEventListener('step_start', (e: any) => {
      const data = JSON.parse(e.data);
      setActiveRound(data.round);
      setCurrentThought(`Sub-question ${data.round}: ${data.question}`);
    });

    eventSource.addEventListener('thought', (e: any) => {
      const data = JSON.parse(e.data);
      setCurrentThought(data.thought);
    });

    eventSource.addEventListener('tool_result', (e: any) => {
      const data = JSON.parse(e.data);
      if (data.log) {
        setLiveLogs((prev) => [...prev, data.log]);
      }
    });

    eventSource.addEventListener('retry', (e: any) => {
      const data = JSON.parse(e.data);
      setCurrentThought(`[Retry] Reformulating query to: "${data.reformulatedQuery}" due to: ${data.reason}`);
    });

    eventSource.addEventListener('synthesizing', (e: any) => {
      const data = JSON.parse(e.data);
      setCurrentThought(data.message);
    });

    eventSource.addEventListener('complete', (e: any) => {
      const data = JSON.parse(e.data);
      eventSource.close();
      setIsResearching(false);
      setActiveSession((prev) =>
        prev
          ? {
              ...prev,
              plan: data.plan,
              logs: data.logs,
              report: data.report,
              status: 'completed',
            }
          : null
      );
      setLiveLogs(data.logs);
      setStage('report');
      fetchSessions();
    });

    eventSource.addEventListener('error', (e: any) => {
      console.warn('SSE Stream notice or disconnect:', e);
      // Fallback: poll session after brief moment in case of stream close
      setTimeout(() => {
        eventSource.close();
        setIsResearching(false);
        fetchSessions();
      }, 1500);
    });
  };

  // 8. Follow-Up Chat
  const handleSendFollowUp = async (text: string) => {
    if (!activeSession) return;
    setIsFollowUpLoading(true);

    try {
      const res = await fetch(`/api/sessions/${activeSession.id}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          geminiKey: settings.geminiKey,
          openaiKey: settings.openaiKey,
        }),
      });

      if (res.ok) {
        const assistantMsg = await res.json();
        setActiveSession((prev) =>
          prev
            ? {
                ...prev,
                followUps: [
                  ...prev.followUps,
                  { id: `user-${Date.now()}`, role: 'user', content: text, timestamp: new Date().toISOString() },
                  assistantMsg,
                ],
              }
            : null
        );
      }
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      setIsFollowUpLoading(false);
    }
  };

  // 9. Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('studyscout_settings', JSON.stringify(newSettings));
  };

  // 10. Exports
  const handleExportMarkdown = () => {
    if (!activeSession?.report) return;
    const r = activeSession.report;
    const md = `# ${r.title}
*Generated by StudyScout AI Research Agent on ${new Date(r.generatedAt).toLocaleString()}*

## 1. Executive Summary
${r.executiveSummary}

## 2. Key Findings
${r.keyFindings.map((f, i) => `### ${i + 1}. ${f.claim} (${f.confidence.toUpperCase()} CONFIDENCE)
${f.summary}
*Citations: ${f.citations.map((c) => `[${c}]`).join(', ')}*
`).join('\n')}

## 3. Sub-Question Analysis
${r.subQuestionAnalyses.map((sq, i) => `### Q${i + 1}: ${sq.question}
${sq.answer}
`).join('\n')}

## 4. Conflicting Information & Nuance Analysis
${r.conflictsAndNuances.map((c) => `### Contention: ${c.topic}
- **View A (${c.viewA.sourceType}):** ${c.viewA.claim} [${c.viewA.citationIndex}]
- **View B (${c.viewB.sourceType}):** ${c.viewB.claim} [${c.viewB.citationIndex}]
**Synthesis:** ${c.synthesisAndVerdict}
`).join('\n')}

## 5. Limitations & Open Questions
${r.limitationsAndGaps.map((l) => `- ${l}`).join('\n')}

### Open Questions:
${r.openQuestions.map((q) => `- ${q}`).join('\n')}

## 6. Bibliography & Source List
${r.sources.map((s) => `[${s.citationIndex}] **${s.title}** (${s.type.toUpperCase()})
- URL/Location: ${s.url || `${s.docName} (Page ${s.pageNumber})`}
- Accessed: ${s.accessedAt}
- Quote: "${s.snippet}"
`).join('\n')}
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-zA-Z0-9]/g, '_')}_StudyScout_Report.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!activeSession) return;
    const blob = new Blob([JSON.stringify(activeSession, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.title.replace(/[^a-zA-Z0-9]/g, '_')}_Session.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 11. User Authentication & Quick Search Handlers
  const handleLogout = () => {
    localStorage.removeItem('studyscout_user');
    localStorage.removeItem('studyscout_token');
    setCurrentUser(null);
  };

  const handleConvertQuickSearch = (targetQuestion: string) => {
    setQuestion(targetQuestion);
    setStage('input');
    if (activeSession) {
      setActiveSession({ ...activeSession, mainQuestion: targetQuestion, title: targetQuestion });
    }
  };

  // Auth Gate: Require login before opening research workspace
  if (!currentUser) {
    return <AuthGate onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500/20 selection:text-teal-700">
      {/* Global Navbar */}
      <Navbar
        activeSession={activeSession}
        currentUser={currentUser}
        onOpenDrawer={() => setDrawerOpen(true)}
        onNewResearch={handleNewResearch}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenQuickSearch={() => setQuickSearchOpen(true)}
        onLogout={handleLogout}
        onExportMarkdown={handleExportMarkdown}
        onExportJSON={handleExportJSON}
      />

      {/* Main Workspace Body */}
      <main className="flex-1">
        {stage === 'input' && (
          <QuestionStage
            question={question}
            onChangeQuestion={setQuestion}
            documents={activeSession?.documents || []}
            onUploadFiles={handleUploadFiles}
            onRemoveDocument={handleRemoveDocument}
            onLoadSampleDoc={handleLoadSampleDoc}
            sampleDocs={sampleDocs}
            onGeneratePlan={handleGeneratePlan}
            isGeneratingPlan={isGeneratingPlan}
            geminiKey={settings.geminiKey}
            openaiKey={settings.openaiKey}
          />
        )}

        {stage === 'plan' && activeSession?.plan && (
          <PlanStage
            plan={activeSession.plan}
            onUpdatePlan={handleUpdatePlan}
            onStartResearch={handleStartResearch}
            onBackToInput={() => setStage('input')}
            hasDocuments={(activeSession.documents || []).length > 0}
          />
        )}

        {stage === 'researching' && (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-6">
            <AgentTraceView
              logs={liveLogs}
              isResearching={isResearching}
              activeRound={activeRound}
              totalRounds={activeSession?.plan?.subQuestions.length || 3}
              currentThought={currentThought}
            />
          </div>
        )}

        {stage === 'report' && activeSession?.report && (
          <ReportView
            report={activeSession.report}
            logs={activeSession.logs || liveLogs}
            onSelectCitation={(cit) => setSelectedCitation(cit)}
            onRerunPlan={() => setStage('plan')}
          />
        )}
      </main>

      {/* Grounded Follow-Up Chat Drawer */}
      {activeSession?.report && (
        <FollowUpChat
          messages={activeSession.followUps || []}
          onSendMessage={handleSendFollowUp}
          isLoading={isFollowUpLoading}
          onSelectCitation={(cit) => setSelectedCitation(cit)}
          allSources={activeSession.report.sources}
          hasReport={!!activeSession.report}
        />
      )}

      {/* Session History Drawer */}
      <SessionDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sessions={sessions}
        activeSessionId={activeSession?.id || null}
        onSelectSession={(id) => {
          const s = sessions.find((item) => item.id === id);
          if (s) selectSession(s);
        }}
        onDeleteSession={handleDeleteSession}
      />

      {/* Universal Quick Question Search Modal */}
      <QuickSearchModal
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        onConvertDeepResearch={handleConvertQuickSearch}
        geminiKey={settings.geminiKey}
        openaiKey={settings.openaiKey}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Citation Popover Modal */}
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};
export default App;
