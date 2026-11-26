export interface SubQuestion {
  id: string;
  question: string;
  rationale: string;
  targetSources: ('web' | 'document' | 'academic')[];
  suggestedKeywords: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ResearchPlan {
  id: string;
  question: string;
  title: string;
  strategy: string;
  subQuestions: SubQuestion[];
  estimatedRounds: number;
  createdAt: string;
  isApproved: boolean;
}

export interface ToolExecutionLog {
  id: string;
  timestamp: string;
  round: number;
  stepIndex: number;
  subQuestionId: string;
  thought: string;
  toolName: 'web_search' | 'document_retrieval' | 'academic_search' | 'evidence_verifier';
  validatedInputs: Record<string, any>;
  validatedOutputs?: Record<string, any>;
  status: 'running' | 'success' | 'retry' | 'failed';
  retryCount: number;
  observation: string;
  errorMessage?: string;
  durationMs: number;
}

export interface Citation {
  sourceId: string;
  citationIndex: number;
  title: string;
  type: 'web' | 'document' | 'academic';
  url?: string;
  docName?: string;
  pageNumber?: number;
  domain?: string;
  authors?: string;
  accessedAt: string;
  snippet: string;
}

export interface KeyFinding {
  id: string;
  claim: string;
  confidence: 'high' | 'medium' | 'low';
  citations: number[];
  sourceTypes: ('web' | 'document' | 'academic')[];
  summary: string;
}

export interface ConflictItem {
  id: string;
  topic: string;
  description: string;
  viewA: {
    sourceTitle: string;
    sourceType: 'web' | 'document' | 'academic';
    claim: string;
    citationIndex: number;
  };
  viewB: {
    sourceTitle: string;
    sourceType: 'web' | 'document' | 'academic';
    claim: string;
    citationIndex: number;
  };
  synthesisAndVerdict: string;
}

export interface SubQuestionAnalysis {
  subQuestionId: string;
  question: string;
  answer: string;
  citations: number[];
  keyEvidence: string[];
}

export interface ResearchReport {
  id: string;
  sessionId: string;
  title: string;
  executiveSummary: string;
  keyFindings: KeyFinding[];
  subQuestionAnalyses: SubQuestionAnalysis[];
  conflictsAndNuances: ConflictItem[];
  limitationsAndGaps: string[];
  openQuestions: string[];
  sources: Citation[];
  generatedAt: string;
  metrics: {
    totalSourcesAnalyzed: number;
    webSourcesCount: number;
    documentChunksCount: number;
    academicPapersCount: number;
    totalExecutionTimeMs: number;
    totalToolCalls: number;
  };
}

export interface UploadedDocument {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  extractedText: string;
  pageCount: number;
  chunks: Array<{
    id: string;
    text: string;
    pageNumber?: number;
    section?: string;
  }>;
}

export interface FollowUpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: number[];
}

export interface ResearchSession {
  id: string;
  title: string;
  mainQuestion: string;
  status: 'idle' | 'planning' | 'plan_ready' | 'researching' | 'completed' | 'failed';
  documents: UploadedDocument[];
  plan?: ResearchPlan;
  logs: ToolExecutionLog[];
  report?: ResearchReport;
  followUps: FollowUpMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  geminiKey?: string;
  openaiKey?: string;
  braveKey?: string;
  tavilyKey?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  fieldOfStudy: string;
  createdAt?: string;
}

export interface QuickAnswerSource {
  id?: string;
  title: string;
  url: string;
  domain: string;
  snippet: string;
  author?: string;
}

export interface QuickAnswerResult {
  question: string;
  directAnswer: string;
  keyTakeaways: string[];
  relatedQuestions: string[];
  confidence: 'high' | 'medium';
  sources: QuickAnswerSource[];
  answeredAt: string;
}
