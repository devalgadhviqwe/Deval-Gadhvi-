import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './server/routes';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Basic Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads serving with proper MIME type headers and multi-folder fallbacks
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const publicUploadsDir = path.resolve(process.cwd(), 'public/uploads');
  const srcAssetsDir = path.resolve(process.cwd(), 'src/assets/images');

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  if (!fs.existsSync(publicUploadsDir)) fs.mkdirSync(publicUploadsDir, { recursive: true });

  const setMimeHeaders = (res: any, filePath: string) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.avif') res.setHeader('Content-Type', 'image/avif');
    else if (ext === '.webp') res.setHeader('Content-Type', 'image/webp');
    else if (ext === '.svg') res.setHeader('Content-Type', 'image/svg+xml');
    else if (ext === '.jpg' || ext === '.jpeg') res.setHeader('Content-Type', 'image/jpeg');
    else if (ext === '.png') res.setHeader('Content-Type', 'image/png');
    else if (ext === '.gif') res.setHeader('Content-Type', 'image/gif');
  };

  // Serve uploads from uploads/, fallback to public/uploads/, fallback to src/assets/images/
  app.use('/uploads', express.static(uploadsDir, { setHeaders: setMimeHeaders }));
  app.use('/uploads', express.static(publicUploadsDir, { setHeaders: setMimeHeaders }));
  app.use('/uploads', express.static(srcAssetsDir, { setHeaders: setMimeHeaders }));

  // Also serve /src/assets/images directly
  app.use('/src/assets/images', express.static(srcAssetsDir, { setHeaders: setMimeHeaders }));

  // Mount API router
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (!isProduction) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
    console.log('[Dev Server] Vite middleware mounted');
  } else {
    // Production mode serving built assets
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('[Production Server] Serving production dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Newark Medical Associates Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
  process.exit(1);
});
