import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ResearchSession, ResearchSessionSchema, UploadedDocument } from '../agent/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'sessions.json');

export class Database {
  private static sessions: Map<string, ResearchSession> = new Map();
  private static initialized = false;
  private static supabase: SupabaseClient | null = null;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    // 1. Check for Supabase connection
    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const supabaseKey = process.env.SUPABASE_ANON_KEY?.trim();

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log(`[DB] Supabase client initialized for ${supabaseUrl}`);

        // Try syncing from Supabase
        const { data: remoteSessions, error: sessErr } = await this.supabase
          .from('research_sessions')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!sessErr && remoteSessions && remoteSessions.length > 0) {
          // Fetch corresponding documents
          const { data: remoteDocs } = await this.supabase
            .from('research_documents')
            .select('*');

          const docsBySession: Record<string, UploadedDocument[]> = {};
          if (remoteDocs) {
            for (const d of remoteDocs) {
              const doc: UploadedDocument = {
                id: d.id,
                filename: d.filename,
                originalName: d.original_name,
                mimeType: d.mime_type,
                sizeBytes: Number(d.size_bytes),
                pageCount: d.page_count,
                extractedText: d.extracted_text,
                chunks: d.chunks || [],
                uploadedAt: d.uploaded_at,
              };
              if (!docsBySession[d.session_id]) docsBySession[d.session_id] = [];
              docsBySession[d.session_id].push(doc);
            }
          }

          for (const row of remoteSessions) {
            const session: ResearchSession = {
              id: row.id,
              title: row.title,
              mainQuestion: row.main_question,
              status: row.status,
              plan: row.plan || undefined,
              logs: row.logs || [],
              report: row.report || undefined,
              followUps: row.follow_ups || [],
              documents: docsBySession[row.id] || [],
              createdAt: row.created_at,
              updatedAt: row.updated_at,
            };
            this.sessions.set(session.id, session);
          }
          console.log(`[DB] Successfully loaded ${this.sessions.size} sessions from Supabase cloud database.`);
        }
      } catch (err) {
        console.warn('[DB] Supabase connection failed, falling back to local storage:', (err as Error).message);
      }
    }

    // 2. Load Local File Backup if Supabase had 0 sessions or was unavailable
    if (this.sessions.size === 0) {
      try {
        const dataDir = path.dirname(SESSIONS_FILE);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        if (fs.existsSync(SESSIONS_FILE)) {
          const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
          const list = JSON.parse(raw) as ResearchSession[];
          for (const s of list) {
            try {
              const validated = ResearchSessionSchema.parse(s);
              this.sessions.set(validated.id, validated);
            } catch (e) {
              console.warn(`[DB] Skipping malformed session ${s?.id}`);
            }
          }
          console.log(`[DB] Loaded ${this.sessions.size} research sessions from local storage.`);
        } else {
          // Seed initial high-quality sample sessions for students and judges
          this.seedSampleSessions();
          this.persistLocal();
        }
      } catch (err) {
        console.error('[DB] Local storage error:', err);
      }
    }

    // 3. If Supabase is connected and empty, seed sample sessions into Supabase
    if (this.supabase && this.sessions.size > 0) {
      try {
        const { count } = await this.supabase
          .from('research_sessions')
          .select('*', { count: 'exact', head: true });

        if (count === 0) {
          console.log('[DB] Seeding sample research sessions to Supabase cloud database...');
          for (const session of this.sessions.values()) {
            await this.syncToSupabase(session);
          }
          console.log('[DB] Seeding to Supabase complete.');
        }
      } catch (seedErr) {
        console.warn('[DB] Could not sync initial seed to Supabase:', seedErr);
      }
    }

    this.initialized = true;
  }

  static getAllSessions(): ResearchSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  static getSession(id: string): ResearchSession | undefined {
    return this.sessions.get(id);
  }

  static saveSession(session: ResearchSession): void {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.id, session);
    this.persistLocal();

    // Async sync to Supabase
    if (this.supabase) {
      this.syncToSupabase(session).then(undefined, (err: any) =>
        console.warn('[DB] Supabase async sync failed:', err?.message)
      );
    }
  }

  static deleteSession(id: string): boolean {
    const existed = this.sessions.delete(id);
    if (existed) {
      this.persistLocal();
      if (this.supabase) {
        this.supabase
          .from('research_sessions')
          .delete()
          .eq('id', id)
          .then(
            () => console.log(`[DB] Deleted session ${id} from Supabase`),
            (err: any) => console.warn('[DB] Supabase delete failed:', err)
          );
      }
    }
    return existed;
  }

  private static persistLocal(): void {
    try {
      const list = Array.from(this.sessions.values());
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Local persist error:', err);
    }
  }

  private static async syncToSupabase(session: ResearchSession): Promise<void> {
    if (!this.supabase) return;

    // Upsert session
    const { error: sessErr } = await this.supabase.from('research_sessions').upsert({
      id: session.id,
      title: session.title,
      main_question: session.mainQuestion,
      status: session.status,
      plan: session.plan || null,
      logs: session.logs || [],
      report: session.report || null,
      follow_ups: session.followUps || [],
      updated_at: session.updatedAt,
    });

    if (sessErr) {
      console.warn('[DB] Supabase upsert session error:', sessErr);
      return;
    }

    // Upsert documents
    for (const doc of session.documents) {
      await this.supabase.from('research_documents').upsert({
        id: doc.id,
        session_id: session.id,
        filename: doc.filename,
        original_name: doc.originalName,
        mime_type: doc.mimeType,
        size_bytes: doc.sizeBytes,
        page_count: doc.pageCount,
        extracted_text: doc.extractedText,
        chunks: doc.chunks || [],
        uploaded_at: doc.uploadedAt,
      });
    }
  }

  // Pre-seed 1 rich, realistic student research session
  private static seedSampleSessions() {
    const sampleSession1: ResearchSession = {
      id: 'session-crispr-demo',
      title: 'CRISPR-Cas9 Therapeutic Efficacy vs Off-Target Cleavage Risks',
      mainQuestion: 'What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?',
      status: 'completed',
      createdAt: '2026-11-20T10:00:00.000Z',
      updatedAt: '2026-11-20T10:15:30.000Z',
      documents: [
        {
          id: 'doc-crispr-lab-notes',
          filename: 'CRISPR_Clinical_Trial_Audit_Notes.txt',
          originalName: 'CRISPR_Clinical_Trial_Audit_Notes.txt',
          mimeType: 'text/plain',
          sizeBytes: 4210,
          uploadedAt: '2026-11-20T10:01:00.000Z',
          pageCount: 2,
          extractedText: `LABORATORY AUDIT REPORT: Somatic Gene Editing Clinical Phase II
Lead Investigator: Dr. Marcus Vance, Institute for Molecular Therapeutics
Date: October 2025

Section 1: On-Target Therapeutic Efficiency
Across 34 patient-derived CD34+ hematopoietic stem and progenitor cell lines, CRISPR-Cas9 ribonucleoproteins achieved 88.4% targeted indel formation at the BCL11A erythroid enhancer locus. Fetal hemoglobin induction was observed in 96% of surviving erythroid colonies. This mirrors phase I clinical benchmarks demonstrating substantial phenotypic correction.

Section 2: Off-Target Cleavage Observations & Frequency
Despite manufacturer claims of zero off-target cuts using high-fidelity Cas9 enzymes (HF-Cas9), unbiased CIRCLE-seq deep sequencing identified low-frequency cleavage at 14 non-homologous genomic loci. Cleavage frequencies ranged from 0.2% to 1.8%. Notably, one off-target cut site occurred within the intronic region of the proto-oncogene NRAS. While no oncogenic transformation was detected during the 120-day in vitro culture period, this finding emphasizes the necessity of longitudinal cellular surveillance.

Section 3: Institutional Recommendations
1. Establish mandatory whole-genome sequencing at 6-month intervals post-infusion.
2. Formulate threshold safety criteria: any off-target frequency exceeding 0.5% at proto-oncogenic loci warrants immediate patient cohort pausing.`,
          chunks: [
            {
              id: 'crispr-c1',
              text: 'Across 34 patient-derived CD34+ hematopoietic stem and progenitor cell lines, CRISPR-Cas9 ribonucleoproteins achieved 88.4% targeted indel formation at the BCL11A erythroid enhancer locus. Fetal hemoglobin induction was observed in 96% of surviving erythroid colonies. This mirrors phase I clinical benchmarks demonstrating substantial phenotypic correction.',
              pageNumber: 1,
              section: 'On-Target Therapeutic Efficiency',
            },
            {
              id: 'crispr-c2',
              text: 'Despite manufacturer claims of zero off-target cuts using high-fidelity Cas9 enzymes (HF-Cas9), unbiased CIRCLE-seq deep sequencing identified low-frequency cleavage at 14 non-homologous genomic loci. Cleavage frequencies ranged from 0.2% to 1.8%. Notably, one off-target cut site occurred within the intronic region of the proto-oncogene NRAS.',
              pageNumber: 2,
              section: 'Off-Target Cleavage Observations & Frequency',
            },
          ],
        },
      ],
      plan: {
        id: 'plan-crispr-demo',
        question: 'What are the demonstrated therapeutic efficiencies of CRISPR-Cas9, and what are the conflicting findings regarding off-target cleavage risks in clinical trials?',
        title: 'CRISPR-Cas9 Therapeutic Efficacy vs Off-Target Cleavage Risks',
        strategy: 'Multi-tiered empirical investigation triangulating peer-reviewed genomic trials, clinical regulatory guidelines, and uploaded laboratory protocol documents.',
        estimatedRounds: 3,
        createdAt: '2026-11-20T10:02:00.000Z',
        isApproved: true,
        subQuestions: [
          {
            id: 'sub-q-1',
            question: 'What are the demonstrated therapeutic efficiencies and molecular mechanisms of CRISPR-Cas9 in clinical trials?',
            rationale: 'Establishes baseline efficacy benchmarks across targeted somatic disease models.',
            targetSources: ['web', 'document', 'academic'],
            suggestedKeywords: ['CRISPR-Cas9 mechanism', 'therapeutic efficacy', 'somatic clinical trials'],
            status: 'completed',
          },
          {
            id: 'sub-q-2',
            question: 'What is the measured frequency and oncogenic risk of off-target mutations and chromosomal translocations?',
            rationale: 'Evaluates critical safety risks and conflicting reports regarding fidelity between standard and engineered nucleases.',
            targetSources: ['document', 'academic', 'web'],
            suggestedKeywords: ['off-target cleavage frequency', 'CIRCLE-seq', 'chromosomal translocations', 'high-fidelity Cas9'],
            status: 'completed',
          },
          {
            id: 'sub-q-3',
            question: 'What ethical and regulatory guidelines govern germline vs somatic interventions across international bodies?',
            rationale: 'Identifies regulatory divergence, surveillance standards, and institutional moratoriums.',
            targetSources: ['web', 'academic'],
            suggestedKeywords: ['WHO germline governance', 'ethical guidelines CRISPR', 'international regulatory consensus'],
            status: 'completed',
          },
        ],
      },
      logs: [
        {
          id: 'log-1',
          timestamp: '2026-11-20T10:03:00.000Z',
          round: 1,
          stepIndex: 1,
          subQuestionId: 'sub-q-1',
          thought: 'Need broad contextual authority for sub-question 1. Formulating targeted web search query: "CRISPR-Cas9 mechanism".',
          toolName: 'web_search',
          validatedInputs: { query: 'CRISPR-Cas9 mechanism', numResults: 4 },
          validatedOutputs: { totalFound: 4, sourceEngine: 'academic_index', topDomain: 'nature.com' },
          status: 'success',
          retryCount: 0,
          observation: 'Found 4 authoritative web sources via academic_index. Lead source: "CRISPR Gene Editing: Principles, Advances and Specificity Challenges" (nature.com).',
          durationMs: 185,
        },
        {
          id: 'log-2',
          timestamp: '2026-11-20T10:03:15.000Z',
          round: 1,
          stepIndex: 2,
          subQuestionId: 'sub-q-1',
          thought: 'Scanning 1 uploaded student documents for evidence answering "therapeutic efficacy".',
          toolName: 'document_retrieval',
          validatedInputs: { query: 'therapeutic efficacy', maxChunks: 4 },
          validatedOutputs: { totalChunksFound: 2, returnedChunks: 2, searchedDocCount: 1 },
          status: 'success',
          retryCount: 0,
          observation: 'Retrieved 2 high-relevance chunks from "CRISPR_Clinical_Trial_Audit_Notes.txt" (Page 1, score: 0.88).',
          durationMs: 42,
        },
        {
          id: 'log-3',
          timestamp: '2026-11-20T10:03:30.000Z',
          round: 1,
          stepIndex: 3,
          subQuestionId: 'sub-q-1',
          thought: 'Searching academic journal repositories and DOIs for peer-reviewed citations on "CRISPR-Cas9 mechanism".',
          toolName: 'academic_search',
          validatedInputs: { topic: 'CRISPR-Cas9 mechanism', limit: 3 },
          validatedOutputs: { totalFound: 3, sourceEngine: 'curated_peer_reviewed', firstPaper: 'Comprehensive Profiling of Off-Target Cleavage Induced by Cas9 Nucleases in Human Pluripotent Cells' },
          status: 'success',
          retryCount: 0,
          observation: 'Retrieved 3 peer-reviewed research papers via curated_peer_reviewed. Primary paper: "Comprehensive Profiling of Off-Target Cleavage Induced by Cas9 Nucleases in Human Pluripotent Cells" (Cell Stem Cell, 2025).',
          durationMs: 210,
        },
        {
          id: 'log-4',
          timestamp: '2026-11-20T10:03:45.000Z',
          round: 1,
          stepIndex: 4,
          subQuestionId: 'sub-q-1',
          thought: 'Running cross-source evidentiary verification for claim: "CRISPR-Cas9 enables targeted genomic alterations with high efficiency..."',
          toolName: 'evidence_verifier',
          validatedInputs: { claim: 'CRISPR-Cas9 enables targeted genomic alterations with high efficiency', evidenceSnippetsCount: 6 },
          validatedOutputs: { status: 'supported', confidence: 0.94, supportingCount: 5, contradictingCount: 1 },
          status: 'success',
          retryCount: 0,
          observation: 'Verification complete: Status is "SUPPORTED" (confidence: 94%). Substantiated across 5 independent corroborating sources with direct evidentiary consensus.',
          durationMs: 76,
        },
      ],
      report: {
        id: 'report-crispr-demo',
        sessionId: 'session-crispr-demo',
        title: 'CRISPR-Cas9 Therapeutic Efficacy vs Off-Target Cleavage Risks',
        executiveSummary: `This research report provides a structured, multi-source synthesis addressing the therapeutic efficiencies and conflicting off-target risks of CRISPR-Cas9 gene editing. Evidence was gathered from authoritative biomedical journals (Nature Biotechnology, Cell Stem Cell), institutional regulatory guidelines (WHO Advisory Committee), and primary laboratory clinical audit documents.

The research confirms remarkable on-target therapeutic efficiencies (88.4% targeted indel formation in primary hematopoietic stem cell lines with 96% phenotypic correction). However, a sharp empirical conflict exists between commercial claims of "near-zero off-target cuts" and independent unbiased deep sequencing (CIRCLE-seq), which consistently detects off-target double-strand cleavage at rates between 0.2% and 1.8%, including sensitive intronic regions adjacent to proto-oncogenes.`,
        keyFindings: [
          {
            id: 'finding-1',
            claim: 'High Therapeutic Efficacy: Somatic trials demonstrate up to 88.4% targeted indel efficiency and 96% phenotypic correction in blood stem cell therapies.',
            confidence: 'high',
            citations: [1, 2],
            sourceTypes: ['web', 'document'],
            summary: 'Clinical phase II audits and Nature Biotechnology reviews substantiate that high-potency Cas9 ribonucleoproteins consistently achieve over 88% targeted gene disruption at the BCL11A enhancer.',
          },
          {
            id: 'finding-2',
            claim: 'Persistent Off-Target Risk: High-throughput CIRCLE-seq assays detect low-frequency off-target mutations (0.2% to 1.8%) at 14 non-homologous genomic loci.',
            confidence: 'high',
            citations: [2, 3],
            sourceTypes: ['document', 'academic'],
            summary: 'Primary laboratory sequencing data contradicts marketing claims of zero off-target activity, revealing unintended cleavage adjacent to the NRAS proto-oncogene.',
          },
          {
            id: 'finding-3',
            claim: 'Regulatory Governance Consensus: International health authorities mandate a 15-year longitudinal monitoring period for patients receiving in vivo CRISPR therapies.',
            confidence: 'high',
            citations: [4],
            sourceTypes: ['web'],
            summary: 'WHO governance frameworks establish strict demarcation between permissible somatic therapies and prohibited germline modifications.',
          },
        ],
        subQuestionAnalyses: [
          {
            subQuestionId: 'sub-q-1',
            question: 'What are the demonstrated therapeutic efficiencies and molecular mechanisms of CRISPR-Cas9 in clinical trials?',
            answer: 'CRISPR-Cas9 functions via guide-RNA directed Cas9 endonuclease double-strand cleavage. Clinical trials for sickle cell disease and beta-thalassemia confirm 88.4% targeted disruption and robust fetal hemoglobin restoration.',
            citations: [1, 2],
            keyEvidence: [
              'Web consensus (nature.com): "CRISPR-Cas9 enables targeted genomic alterations with high efficiency..."',
              'Uploaded document (CRISPR_Clinical_Trial_Audit_Notes.txt, p. 1): "CRISPR-Cas9 ribonucleoproteins achieved 88.4% targeted indel formation..."',
            ],
          },
          {
            subQuestionId: 'sub-q-2',
            question: 'What is the measured frequency and oncogenic risk of off-target mutations and chromosomal translocations?',
            answer: 'Empirical assays demonstrate that off-target cleavage persists at low frequencies (0.2% - 1.8%). While engineered high-fidelity variants reduce unintended cuts by over 90%, they do not eliminate them completely.',
            citations: [2, 3],
            keyEvidence: [
              'Academic DOI (Cell Stem Cell, 2025): "CIRCLE-seq identified off-target mutations at 14 predicted loci with frequencies between 0.2% and 1.8%..."',
              'Uploaded document (CRISPR_Clinical_Trial_Audit_Notes.txt, p. 2): "One off-target cut site occurred within the intronic region of the proto-oncogene NRAS..."',
            ],
          },
          {
            subQuestionId: 'sub-q-3',
            question: 'What ethical and regulatory guidelines govern germline vs somatic interventions across international bodies?',
            answer: 'International consensus across WHO and NIH committees strictly limits in vivo application to somatic non-heritable conditions with 15-year adverse event registries.',
            citations: [4],
            keyEvidence: [
              'Web source (who.int): "Recommends a minimum 15-year post-treatment surveillance period for all patients receiving in vivo viral or nanoparticle delivered CRISPR therapies..."',
            ],
          },
        ],
        conflictsAndNuances: [
          {
            id: 'conflict-1',
            topic: 'Off-Target Cleavage Frequency in Clinical vs Laboratory Conditions',
            description: 'Discrepancy between manufacturer claims of zero off-target cuts versus unbiased whole-genome sequencing in patient-derived stem cells.',
            viewA: {
              sourceTitle: 'Biotechnology Industry Press / Manufacturer Whitepaper',
              sourceType: 'web',
              claim: 'Engineered high-fidelity Cas9 variants reduce off-target cleavage to statistically undetectable levels (>99.9% specificity).',
              citationIndex: 1,
            },
            viewB: {
              sourceTitle: 'CRISPR Clinical Trial Audit Notes (Uploaded Student Doc)',
              sourceType: 'document',
              claim: 'Unbiased CIRCLE-seq deep sequencing identified low-frequency cleavage at 14 non-homologous loci (0.2% to 1.8%), including near NRAS.',
              citationIndex: 2,
            },
            synthesisAndVerdict: 'While engineered high-fidelity Cas9 variants substantially lower off-target propensity in synthetic plasmid models, high cellular concentrations and chromatin accessibility in human stem cells still permit low-frequency cleavage that warrants ongoing monitoring rather than assumed perfection.',
          },
        ],
        limitationsAndGaps: [
          'Most clinical trial datasets currently have less than 48 months of continuous patient follow-up.',
          'Sensitivity thresholds of standard PCR assays miss rare chromosomal translocations occurring in fewer than 0.1% of cells.',
          'Cost of bespoke patient-derived cell manufacturing ($2.2M per patient) creates substantial healthcare equity bottlenecks.',
        ],
        openQuestions: [
          'Will prime editing or base editing completely replace Cas9 double-strand break nucleases in upcoming phase III trials?',
          'What standardized computational tool should international regulators establish as the definitive benchmark for off-target prediction?',
        ],
        sources: [
          {
            sourceId: 'src-1',
            citationIndex: 1,
            title: 'CRISPR Gene Editing: Principles, Advances and Specificity Challenges',
            type: 'web',
            url: 'https://www.nature.com/articles/d41586-024-00124-x',
            domain: 'nature.com',
            authors: 'Nature Biotechnology Research Brief',
            accessedAt: '2026-11-20',
            snippet: 'CRISPR-Cas9 enables targeted genomic alterations with high efficiency, but persistent concerns regarding off-target cleavage and chromosomal rearrangements remain central to therapeutic translation.',
          },
          {
            sourceId: 'src-2',
            citationIndex: 2,
            title: 'CRISPR_Clinical_Trial_Audit_Notes.txt - Off-Target Cleavage Observations',
            type: 'document',
            docName: 'CRISPR_Clinical_Trial_Audit_Notes.txt',
            pageNumber: 2,
            accessedAt: '2026-11-20',
            snippet: 'Despite manufacturer claims of zero off-target cuts using high-fidelity Cas9 enzymes (HF-Cas9), unbiased CIRCLE-seq deep sequencing identified low-frequency cleavage at 14 non-homologous genomic loci.',
          },
          {
            sourceId: 'src-3',
            citationIndex: 3,
            title: 'Comprehensive Profiling of Off-Target Cleavage Induced by Cas9 Nucleases in Human Pluripotent Cells (Cell Stem Cell, 2025)',
            type: 'academic',
            url: 'https://doi.org/10.1016/j.stem.2025.04.011',
            authors: 'Dr. Elena Rostova, Marcus Vance, PhD, Sarah Lin, MD',
            accessedAt: '2026-11-20',
            snippet: 'We conducted high-throughput CIRCLE-seq across 48 human embryonic stem cell lines targeted with Cas9 ribonucleoproteins. Off-target mutations were identified at 14 predicted loci with frequencies between 0.2% and 1.8%.',
          },
          {
            sourceId: 'src-4',
            citationIndex: 4,
            title: 'Ethical Guidelines and Safety Thresholds for Human Somatic Gene Therapies',
            type: 'web',
            url: 'https://www.who.int/publications/i/item/9789240034709',
            domain: 'who.int',
            authors: 'WHO Expert Advisory Committee',
            accessedAt: '2026-11-20',
            snippet: 'World Health Organization governance frameworks urge strict international registries and longitudinal monitoring for somatic gene therapy clinical trials to prevent unvetted germline transmission.',
          },
        ],
        generatedAt: '2026-11-20T10:04:30.000Z',
        metrics: {
          totalSourcesAnalyzed: 4,
          webSourcesCount: 2,
          documentChunksCount: 2,
          academicPapersCount: 1,
          totalExecutionTimeMs: 4410,
          totalToolCalls: 4,
        },
      },
      followUps: [
        {
          id: 'fu-1',
          role: 'user',
          content: 'Why did the uploaded audit notes disagree with the manufacturer claims regarding off-target cuts?',
          timestamp: '2026-11-20T10:06:00.000Z',
        },
        {
          id: 'fu-2',
          role: 'assistant',
          content: `### Why the Findings Disagree: Assays vs In Vivo Conditions

The uploaded document (**CRISPR_Clinical_Trial_Audit_Notes.txt**, page 2 [2]) utilized **unbiased CIRCLE-seq**, which sequences the entire human genome to find real molecular cuts. In contrast, manufacturer promotional claims often rely on targeted in silico predictions or standard gel electrophoresis assays [1], which miss low-frequency events occurring under 1%.

When tested in patient CD34+ stem cells, high ribonucleoprotein concentrations led to non-specific cleavage at 14 non-homologous sites (0.2% to 1.8% frequency) [2, 3]. Although low, this is biologically significant because one cut site mapped directly inside the intron of the *NRAS* proto-oncogene [2].`,
          timestamp: '2026-11-20T10:06:05.000Z',
          citations: [1, 2, 3],
        },
      ],
    };

    this.sessions.set(sampleSession1.id, sampleSession1);
  }
}
