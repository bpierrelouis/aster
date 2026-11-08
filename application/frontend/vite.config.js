import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(async ({ command, mode, isPreview }) => {
  const local = command === 'serve' && mode === 'ui' && !isPreview;
  const plugins = [react()];
  if (local) {
    const { uiDevelopment } = await import('./ui-development.js');
    plugins.push(uiDevelopment());
  }
  return {
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins,
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      ...(local ? { cors: false } : { proxy: { '/api': 'http://127.0.0.1:3001', '/auth': 'http://127.0.0.1:3001' } }),
    },
  };
});
