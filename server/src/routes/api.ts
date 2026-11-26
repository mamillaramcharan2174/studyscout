import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Database } from '../storage/db.js';
import { DocumentParser } from '../storage/documentParser.js';
import { AgentEngine } from '../agent/engine.js';
import { ResearchSession, ResearchPlanSchema } from '../agent/types.js';

import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLE_DOCS_DIR = path.join(__dirname, '..', '..', '..', 'sample_docs');

// Multer upload config using os.tmpdir() for cloud serverless compatibility
const uploadDir = path.join(os.tmpdir(), 'studyscout_uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('[Uploads] Could not create upload directory:', e);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
});

export const apiRouter = express.Router();

// ============================================================================
// 1. Session Management Routes
// ============================================================================

// List all sessions
apiRouter.get('/sessions', (_req: Request, res: Response) => {
  try {
    const sessions = Database.getAllSessions();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Create new session
apiRouter.post('/sessions', (req: Request, res: Response) => {
  try {
    const { mainQuestion, title } = req.body;
    const session: ResearchSession = {
      id: `session-${Date.now()}`,
      title: title || mainQuestion || 'New Research Session',
      mainQuestion: mainQuestion || '',
      status: 'idle',
      documents: [],
      logs: [],
      followUps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveSession(session);
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get single session
apiRouter.get('/sessions/:id', (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Delete session
apiRouter.delete('/sessions/:id', (req: Request, res: Response) => {
  try {
    const success = Database.deleteSession(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ============================================================================
// 2. Document Upload & Sample Document Routes
// ============================================================================

// Upload documents to session
apiRouter.post('/sessions/:id/documents', upload.array('files', 5), async (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const parsedDocs = [];
    for (const file of files) {
      const parsed = await DocumentParser.parseFile(
        file.path,
        file.originalname,
        file.mimetype,
        file.size
      );
      parsedDocs.push(parsed);
      // Clean up temporary upload
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        // Ignore unlink error
      }
    }

    session.documents.push(...parsedDocs);
    Database.saveSession(session);

    res.json({
      message: `Successfully processed ${parsedDocs.length} document(s)`,
      documents: session.documents,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Get available pre-loaded sample documents
apiRouter.get('/sample-docs', (_req: Request, res: Response) => {
  try {
    if (!fs.existsSync(SAMPLE_DOCS_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(SAMPLE_DOCS_DIR);
    const samples = files.map((filename) => {
      const filePath = path.join(SAMPLE_DOCS_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        title: filename.replace(/_/g, ' ').replace(/\.txt$/, ''),
        sizeBytes: stats.size,
      };
    });
    res.json(samples);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Attach a sample document to active session
apiRouter.post('/sessions/:id/load-sample', async (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { filename } = req.body;
    const filePath = path.join(SAMPLE_DOCS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Sample document ${filename} not found` });
    }

    const stats = fs.statSync(filePath);
    const parsed = await DocumentParser.parseFile(filePath, filename, 'text/plain', stats.size);

    session.documents.push(parsed);
    Database.saveSession(session);

    res.json({
      message: `Attached sample document ${filename}`,
      documents: session.documents,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ============================================================================
// 3. Research Planning Routes
// ============================================================================

// Generate editable research plan
apiRouter.post('/sessions/:id/plan', async (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { question, geminiKey, openaiKey } = req.body;
    const queryQuestion = question || session.mainQuestion;

    if (!queryQuestion || queryQuestion.trim().length < 3) {
      return res.status(400).json({ error: 'A research question is required' });
    }

    session.mainQuestion = queryQuestion;
    session.status = 'planning';
    Database.saveSession(session);

    const plan = await AgentEngine.generatePlan(
      queryQuestion,
      session.documents,
      { geminiKey, openaiKey }
    );

    session.plan = plan;
    session.title = plan.title;
    session.status = 'plan_ready';
    Database.saveSession(session);

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// Update / Edit research plan
apiRouter.put('/sessions/:id/plan', (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const validatedPlan = ResearchPlanSchema.parse(req.body);
    session.plan = validatedPlan;
    session.title = validatedPlan.title;
    session.status = validatedPlan.isApproved ? 'plan_ready' : 'plan_ready';
    Database.saveSession(session);

    res.json(validatedPlan);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// ============================================================================
// 4. Research Execution & Real-Time SSE Stream Route
// ============================================================================

// Real-time SSE Agent execution stream
apiRouter.get('/sessions/:id/research/stream', async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = Database.getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.plan) {
    return res.status(400).json({ error: 'Session has no research plan' });
  }

  // Set SSE Headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  session.status = 'researching';
  Database.saveSession(session);

  sendEvent('connected', { sessionId, message: 'Connected to StudyScout Agent execution trace stream.' });

  try {
    const result = await AgentEngine.executeResearch(
      session.plan,
      session.documents,
      {
        geminiKey: (req.query.geminiKey as string) || undefined,
        openaiKey: (req.query.openaiKey as string) || undefined,
      },
      (progressEvent) => {
        sendEvent(progressEvent.type, progressEvent.data);
      }
    );

    // Persist final execution results
    session.plan = result.plan;
    session.logs = result.logs;
    session.report = result.report;
    session.status = 'completed';
    Database.saveSession(session);

    sendEvent('complete', {
      report: result.report,
      logs: result.logs,
      plan: result.plan,
    });

    res.end();
  } catch (err) {
    console.error('[Research Stream Error]', err);
    session.status = 'failed';
    Database.saveSession(session);
    sendEvent('error', { error: (err as Error).message });
    res.end();
  }
});

// Synchronous research execution fallback
apiRouter.post('/sessions/:id/research', async (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    if (!session.plan) {
      return res.status(400).json({ error: 'Session has no research plan' });
    }

    session.status = 'researching';
    Database.saveSession(session);

    const { geminiKey, openaiKey } = req.body;
    const result = await AgentEngine.executeResearch(
      session.plan,
      session.documents,
      { geminiKey, openaiKey }
    );

    session.plan = result.plan;
    session.logs = result.logs;
    session.report = result.report;
    session.status = 'completed';
    Database.saveSession(session);

    res.json({
      plan: result.plan,
      logs: result.logs,
      report: result.report,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// ============================================================================
// 5. Follow-Up Q&A Route
// ============================================================================

apiRouter.post('/sessions/:id/followup', async (req: Request, res: Response) => {
  try {
    const session = Database.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { message, geminiKey, openaiKey } = req.body;
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Record user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    session.followUps.push(userMsg);

    // Generate context-aware assistant answer
    const assistantMsg = await AgentEngine.askFollowUp(
      message,
      session,
      { geminiKey, openaiKey }
    );

    session.followUps.push(assistantMsg);
    Database.saveSession(session);

    res.json(assistantMsg);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
