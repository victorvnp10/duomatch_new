import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode, command }) => {
  // Compatibility with the existing Vercel REACT_APP_* variables, including
  // dynamic process.env[key] reads. Never serialize the host's entire env.
  const clientEnv = {
    ...loadEnv(mode, process.cwd(), 'REACT_APP_'),
    NODE_ENV: process.env.NODE_ENV || (command === 'build' ? 'production' : 'development'),
    PUBLIC_URL: '',
  };
  const define = { 'process.env': JSON.stringify(clientEnv) };

  return {
    define,
    plugins: [
      // Test-only module instrumentation: never included in production builds.
      // No emulator support exists in src/infrastructure/firebase today.
      ...(mode === 'e2e' && command === 'serve' ? [{
        name: 'duomatch-e2e-emulators',
        enforce: 'pre',
        transform(code, id) {
          if (!id.split('?')[0].endsWith('/src/infrastructure/firebase/index.js')) return null;
          return `${code}\nimport { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
if (firebaseConfig.projectId !== 'demo-duomatch-e2e') throw new Error('E2E requires demo project');
connectAuthEmulator(auth, 'http://127.0.0.1:9199', { disableWarnings: true });
connectFirestoreEmulator(db, '127.0.0.1', 8180);`;
        },
      }] : []),
      {
        name: 'duomatch-js-as-jsx',
        enforce: 'pre',
        async transform(code, id) {
          if (!/\/src\/.*\.js$/.test(id.split('?')[0])) return null;
          return transformWithEsbuild(code, id, { loader: 'jsx', jsx: 'automatic' });
        },
      },
      react(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'service-worker.js',
        // Keep the existing single SW + FCM query-string registration and
        // public/manifest.json; no second auto-registering worker/manifest.
        injectRegister: false,
        manifest: false,
        injectManifest: {
          rollupFormat: 'iife',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
      }),
    ],
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
    build: { outDir: 'dist' },
  };
});
