import { defineConfig } from 'vite';
import type { PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(async ({ command, mode, isPreview }) => {
  const local = command === 'serve' && mode === 'ui' && !isPreview;
  const plugins: PluginOption[] = [react()];
  if (local) {
    const { uiDevelopment } = await import('../outils/interface-seule/ui-development.ts');
    plugins.push(uiDevelopment());
  }
  return {
    root: fileURLToPath(new URL('.', import.meta.url)),
    plugins,
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      // Écrans compilés dès le démarrage : le premier écran ouvert (tests compris) n'attend pas la compilation à froid
      warmup: { clientFiles: ['./src/main.tsx', './src/connexion/**/*.tsx', './src/espace/**/*.tsx'] },
      ...(local ? { cors: false } : { proxy: { '/api': 'http://127.0.0.1:3001', '/auth': 'http://127.0.0.1:3001' } }),
    },
  };
});
