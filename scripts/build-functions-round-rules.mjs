// Uma fonte só: src/domain/services/RoundRulesEvaluator.js.
//
// A avaliação das regras da rodada precisa rodar nos dois lados — no cliente
// (painel + avaliação imediata) e no servidor (job de 6h que não depende de
// ninguém abrir o app). Reescrever a regra no functions/ faria as duas versões
// divergirem em silêncio, que é exatamente o defeito que a fonte única evita.
//
// Aqui o módulo ESM é empacotado em CommonJS para o runtime das Cloud
// Functions. O artefato é saída de build, não código mantido à mão: não editar
// `functions/generated/roundRules.cjs`, e sim o domínio em `src/`.
import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';

const target = new URL('../functions/generated/', import.meta.url);
await mkdir(target, { recursive: true });

const result = await build({
  entryPoints: [new URL('../src/domain/services/RoundRulesEvaluator.js', import.meta.url).pathname],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node22',
  outfile: new URL('roundRules.cjs', target).pathname,
  logLevel: 'error',
  metafile: true,
});

const bytes = Object.values(result.metafile.outputs)[0]?.bytes ?? 0;
console.log(`Functions round-rules module generated: ${bytes} bytes`);
