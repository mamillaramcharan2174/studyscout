import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './routes/api.js';
import { Database } from './storage/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes
app.use('/api', apiRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'StudyScout Research Agent Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend if built
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  const indexPath = path.join(clientDist, 'index.html');
  if (path.resolve(indexPath).startsWith(clientDist)) {
    res.sendFile(indexPath, (err) => {
      if (err) res.status(404).send('StudyScout API Server Running. Client not yet built.');
    });
  }
});

export { app };

// Initialize session store & start server
async function startServer() {
  await Database.initialize();
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
      console.log(`[StudyScout Server] Running on http://localhost:${PORT}`);
      console.log(`[StudyScout Server] API Endpoints ready at http://localhost:${PORT}/api/`);
    });
  }
}

startServer().catch(console.error);
