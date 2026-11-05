import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import apiRouter from './routes';

export function createExpressApp() {
  const app = express();

  // Basic Middleware
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Static uploads serving with proper MIME type headers and multi-folder fallbacks
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  const publicUploadsDir = path.resolve(process.cwd(), 'public/uploads');
  const srcAssetsDir = path.resolve(process.cwd(), 'src/assets/images');

  if (!fs.existsSync(uploadsDir)) {
    try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
  }
  if (!fs.existsSync(publicUploadsDir)) {
    try { fs.mkdirSync(publicUploadsDir, { recursive: true }); } catch {}
  }

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

  // Explicit handlers for sitemap.xml and robots.txt so they are NEVER rewritten to index.html
  const distDir = path.resolve(process.cwd(), 'dist');
  const publicDir = path.resolve(process.cwd(), 'public');

  app.get('/sitemap.xml', (_req, res) => {
    const sitemapDist = path.join(distDir, 'sitemap.xml');
    const sitemapPublic = path.join(publicDir, 'sitemap.xml');
    const targetFile = fs.existsSync(sitemapDist) ? sitemapDist : sitemapPublic;
    if (fs.existsSync(targetFile)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.sendFile(targetFile);
    }
    return res.status(404).send('sitemap.xml not found');
  });

  app.get('/robots.txt', (_req, res) => {
    const robotsDist = path.join(distDir, 'robots.txt');
    const robotsPublic = path.join(publicDir, 'robots.txt');
    const targetFile = fs.existsSync(robotsDist) ? robotsDist : robotsPublic;
    if (fs.existsSync(targetFile)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.sendFile(targetFile);
    }
    return res.status(404).send('robots.txt not found');
  });

  return app;
}
