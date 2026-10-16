import path from 'path';
import { createExpressApp } from './server/app';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = createExpressApp();

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
    app.use((await import('express')).default.static(distPath));

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
