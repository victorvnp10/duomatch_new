import { build } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

// Rollup renderedLength counts pre-minification UTF-16 code units, not bytes.
// Chunk bytes/gzip below are measured after Vite's minifier.
const output = resolve(process.argv[2] || 'bundle-analysis.json');
const group = (id) => {
  if (id.includes('/src/infrastructure/seed/')) return 'seed';
  if (/node_modules\/(?:@firebase|firebase|@grpc|protobufjs|@protobufjs|long)\//.test(id)) return 'firebase';
  if (/node_modules\/(?:react|react-dom|scheduler)\//.test(id)) return 'react';
  if (id.includes('/node_modules/')) return 'other-vendor';
  if (id.includes('/src/')) return 'application';
  return 'build-runtime';
};
await build({
  // Diagnostic experiment only; normal production config stays untouched.
  ...(process.argv.includes('--vendors') ? {
    build: { rollupOptions: { output: {
      manualChunks(id) {
        if (group(id) === 'firebase' || group(id) === 'other-vendor') return 'firebase-vendor';
        if (group(id) === 'react') return 'react-vendor';
      },
    } } },
  } : {}),
  plugins: [{
    name: 'duomatch-bundle-analysis',
    async writeBundle(options, bundle) {
      const chunks = await Promise.all(Object.values(bundle).filter((file) => file.type === 'chunk').map(async (chunk) => {
        // Read after all generateBundle transforms (including preload rewriting).
        const code = await readFile(resolve(options.dir, chunk.fileName));
        const modules = Object.entries(chunk.modules).map(([id, info]) => ({
          id: id.replace(`${process.cwd()}/`, ''),
          group: group(id),
          renderedChars: info.renderedLength,
        })).sort((a, b) => b.renderedChars - a.renderedChars);
        const groups = {};
        for (const mod of modules) groups[mod.group] = (groups[mod.group] || 0) + mod.renderedChars;
        return { file: chunk.fileName, entry: chunk.isEntry, dynamicEntry: chunk.isDynamicEntry,
          bytes: code.length, gzipBytes: gzipSync(code).length,
          imports: chunk.imports, dynamicImports: chunk.dynamicImports, groups, modules };
      }));
      await mkdir(dirname(output), { recursive: true });
      await writeFile(output, JSON.stringify({ measurement: 'renderedChars = Rollup pre-minification; bytes/gzipBytes = final chunk', chunks }, null, 2));
      console.log(`Bundle analysis: ${output}`);
      for (const chunk of chunks) console.log(JSON.stringify({ ...chunk, modules: undefined }));
    },
  }],
});
