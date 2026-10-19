import { defineConfig, type Plugin, type ViteDevServer, type PreviewServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { githubHandler } from './server/github';

const base = fileURLToPath(new URL('.', import.meta.url));
function githubActivity(): Plugin {
  const install = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use((req, res, next) => {
      if (new URL(req.url || '/', 'http://localhost').pathname !== '/api/github') { next(); return; }
      void githubHandler(req, res);
    });
  };
  return { name: 'public-github-activity', configureServer: install, configurePreviewServer: install };
}
function referenceGuard(): Plugin {
  return {
    name: 'private-reference-guard',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = new URL(req.url || '/', 'http://localhost').pathname;
        if (/__review|private-documents|design-inputs|\/docs\/|\/content\/|\.pdf|\.env|public\/assets/i.test(decodeURIComponent(path))) {
          res.statusCode = 403; res.end('Private reference'); return;
        }
        next();
      });
    },
  };
}
export default defineConfig({
  root: 'app', publicDir: false,
  plugins: [referenceGuard(), githubActivity(), react(), tailwind()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, fs: { strict: true, allow: [base + 'app', base + 'node_modules'], deny: ['**/private-documents/**', '**/design-inputs/**', '**/*.pdf', '**/.env*'] } },
  build: { outDir: '../dist', emptyOutDir: true, sourcemap: false, assetsInlineLimit: 0 },
});
