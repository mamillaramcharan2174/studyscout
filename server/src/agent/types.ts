import { z } from 'zod';

// ============================================================================
// Research Plan Schemas
// ============================================================================

export const SubQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(5, 'Sub-question must be at least 5 characters'),
  rationale: z.string(),
  targetSources: z.array(z.enum(['web', 'document', 'academic'])).min(1),
  suggestedKeywords: z.array(z.string()).default([]),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']).default('pending'),
});

export type SubQuestion = z.infer<typeof SubQuestionSchema>;

export const ResearchPlanSchema = z.object({
  id: z.string(),
  question: z.string().min(3),
  title: z.string(),
  strategy: z.string(),
  subQuestions: z.array(SubQuestionSchema).min(1),
  estimatedRounds: z.number().default(3),
  createdAt: z.string(),
  isApproved: z.boolean().default(false),
});

export type ResearchPlan = z.infer<typeof ResearchPlanSchema>;

// ============================================================================
// Tool 1: Web Search Schemas
// ============================================================================

export const WebSearchInputSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  numResults: z.number().min(1).max(10).default(5),
  filterAcademic: z.boolean().default(false),
});

export type WebSearchInput = z.infer<typeof WebSearchInputSchema>;

export const WebSearchResultItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  domain: z.string(),
  snippet: z.string(),
  fullContent: z.string().optional(),
  publishedDate: z.string().optional(),
  author: z.string().optional(),
  score: z.number().optional(),
});

export type WebSearchResultItem = z.infer<typeof WebSearchResultItemSchema>;

export const WebSearchOutputSchema = z.object({
  results: z.array(WebSearchResultItemSchema),
  totalFound: z.number(),
  sourceEngine: z.string(),
  executedQuery: z.string(),
});

export type WebSearchOutput = z.infer<typeof WebSearchOutputSchema>;

// ============================================================================
// Tool 2: Document Retrieval Schemas
// ============================================================================

export const DocumentRetrievalInputSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters'),
  documentIds: z.array(z.string()).optional(),
  maxChunks: z.number().min(1).max(10).default(4),
  matchExact: z.boolean().default(false),
});

export type DocumentRetrievalInput = z.infer<typeof DocumentRetrievalInputSchema>;

export const DocumentChunkSchema = z.object({
  chunkId: z.string(),
  docId: z.string(),
  docName: z.string(),
  fileType: z.string(),
  text: z.string(),
  relevanceScore: z.number(),
  sectionTitle: z.string().optional(),
  pageNumber: z.number().optional(),
  charOffset: z.number().optional(),
});

export type DocumentChunk = z.infer<typeof DocumentChunkSchema>;

export const DocumentRetrievalOutputSchema = z.object({
  chunks: z.array(DocumentChunkSchema),
  totalChunksFound: z.number(),
  searchedDocCount: z.number(),
});

export type DocumentRetrievalOutput = z.infer<typeof DocumentRetrievalOutputSchema>;

// ============================================================================
// Tool 3: Academic Search Schemas
// ============================================================================

export const AcademicSearchInputSchema = z.object({
  topic: z.string().min(2, 'Topic must be at least 2 characters'),
  limit: z.number().min(1).max(8).default(4),
  yearFrom: z.number().optional(),
});

export type AcademicSearchInput = z.infer<typeof AcademicSearchInputSchema>;

export const AcademicPaperItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.array(z.string()),
  year: z.number().optional(),
  journalOrVenue: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  abstract: z.string(),
  citationCount: z.number().optional(),
});

export type AcademicPaperItem = z.infer<typeof AcademicPaperItemSchema>;

export const AcademicSearchOutputSchema = z.object({
  papers: z.array(AcademicPaperItemSchema),
  totalFound: z.number(),
  sourceEngine: z.string(),
});

export type AcademicSearchOutput = z.infer<typeof AcademicSearchOutputSchema>;

// ============================================================================
// Tool 4: Evidence & Fact Verifier Schemas
// ============================================================================

export const EvidenceVerifierInputSchema = z.object({
  claim: z.string().min(5),
  evidenceSnippets: z.array(
    z.object({
      sourceId: z.string(),
      sourceTitle: z.string(),
      sourceType: z.enum(['web', 'document', 'academic']),
      snippet: z.string(),
    })
  ).min(1),
});

export type EvidenceVerifierInput = z.infer<typeof EvidenceVerifierInputSchema>;

export const EvidenceVerifierOutputSchema = z.object({
  claim: z.string(),
  status: z.enum(['supported', 'contradicted', 'conflicting', 'insufficient_evidence']),
  confidence: z.number().min(0).max(1),
  explanation: z.string(),
  supportingSources: z.array(z.string()),
  contradictingSources: z.array(z.string()),
});

export type EvidenceVerifierOutput = z.infer<typeof EvidenceVerifierOutputSchema>;

// ============================================================================
// Agent Tool Definition for Native Function Calling
// ============================================================================

export interface ToolDefinition {
  name: 'web_search' | 'document_retrieval' | 'academic_search' | 'evidence_verifier';
  description: string;
  parameters: Record<string, unknown>;
  execute: (input: unknown, context?: Record<string, unknown>) => Promise<{
    output: unknown;
    observation: string;
    durationMs: number;
  }>;
}

// ============================================================================
// Execution Trace / Agent Log
// ============================================================================

export const ToolExecutionLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  round: z.number(),
  stepIndex: z.number(),
  subQuestionId: z.string(),
  thought: z.string(),
  toolName: z.enum(['web_search', 'document_retrieval', 'academic_search', 'evidence_verifier']),
  validatedInputs: z.record(z.any()),
  validatedOutputs: z.record(z.any()).optional(),
  status: z.enum(['running', 'success', 'retry', 'failed']),
  retryCount: z.number().default(0),
  observation: z.string(),
  errorMessage: z.string().optional(),
  durationMs: z.number(),
});

export type ToolExecutionLog = z.infer<typeof ToolExecutionLogSchema>;

// ============================================================================
// Research Report Schemas
// ============================================================================

export const CitationSchema = z.object({
  sourceId: z.string(),
  citationIndex: z.number(),
  title: z.string(),
  type: z.enum(['web', 'document', 'academic']),
  url: z.string().optional(),
  docName: z.string().optional(),
  pageNumber: z.number().optional(),
  domain: z.string().optional(),
  authors: z.string().optional(),
  accessedAt: z.string(),
  snippet: z.string(),
});

export type Citation = z.infer<typeof CitationSchema>;

export const KeyFindingSchema = z.object({
  id: z.string(),
  claim: z.string(),
  confidence: z.enum(['high', 'medium', 'low']),
  citations: z.array(z.number()), // references citationIndex in sources list
  sourceTypes: z.array(z.enum(['web', 'document', 'academic'])),
  summary: z.string(),
});

export type KeyFinding = z.infer<typeof KeyFindingSchema>;

export const ConflictItemSchema = z.object({
  id: z.string(),
  topic: z.string(),
  description: z.string(),
  viewA: z.object({
    sourceTitle: z.string(),
    sourceType: z.enum(['web', 'document', 'academic']),
    claim: z.string(),
    citationIndex: z.number(),
  }),
  viewB: z.object({
    sourceTitle: z.string(),
    sourceType: z.enum(['web', 'document', 'academic']),
    claim: z.string(),
    citationIndex: z.number(),
  }),
  synthesisAndVerdict: z.string(),
});

export type ConflictItem = z.infer<typeof ConflictItemSchema>;

export const SubQuestionAnalysisSchema = z.object({
  subQuestionId: z.string(),
  question: z.string(),
  answer: z.string(),
  citations: z.array(z.number()),
  keyEvidence: z.array(z.string()),
});

export type SubQuestionAnalysis = z.infer<typeof SubQuestionAnalysisSchema>;

export const ResearchReportSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  title: z.string(),
  executiveSummary: z.string(),
  keyFindings: z.array(KeyFindingSchema),
  subQuestionAnalyses: z.array(SubQuestionAnalysisSchema),
  conflictsAndNuances: z.array(ConflictItemSchema),
  limitationsAndGaps: z.array(z.string()),
  openQuestions: z.array(z.string()),
  sources: z.array(CitationSchema),
  generatedAt: z.string(),
  metrics: z.object({
    totalSourcesAnalyzed: z.number(),
    webSourcesCount: z.number(),
    documentChunksCount: z.number(),
    academicPapersCount: z.number(),
    totalExecutionTimeMs: z.number(),
    totalToolCalls: z.number(),
  }),
});

export type ResearchReport = z.infer<typeof ResearchReportSchema>;

// ============================================================================
// Uploaded Document Schema
// ============================================================================

export const UploadedDocumentSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number(),
  uploadedAt: z.string(),
  extractedText: z.string(),
  pageCount: z.number().default(1),
  chunks: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      pageNumber: z.number().optional(),
      section: z.string().optional(),
    })
  ),
});

export type UploadedDocument = z.infer<typeof UploadedDocumentSchema>;

// ============================================================================
// Follow-up Chat Message Schema
// ============================================================================

export const FollowUpMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string(),
  citations: z.array(z.number()).optional(),
  referencedChunkIds: z.array(z.string()).optional(),
});

export type FollowUpMessage = z.infer<typeof FollowUpMessageSchema>;

// ============================================================================
// Research Session Schema
// ============================================================================

export const ResearchSessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  mainQuestion: z.string(),
  status: z.enum(['idle', 'planning', 'plan_ready', 'researching', 'completed', 'failed']),
  documents: z.array(UploadedDocumentSchema).default([]),
  plan: ResearchPlanSchema.optional(),
  logs: z.array(ToolExecutionLogSchema).default([]),
  report: ResearchReportSchema.optional(),
  followUps: z.array(FollowUpMessageSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ResearchSession = z.infer<typeof ResearchSessionSchema>;
