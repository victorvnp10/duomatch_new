# Documentação — DuoMatch

Índice da documentação do projeto. Nada aqui é carregado em tempo de execução;
são documentos de referência, planos e dados históricos.

## Conteúdo atual (referência)

| Documento | O que é | Estado |
|---|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Organização em camadas (domínio, aplicação, infraestrutura, apresentação), racional e falhas corrigidas na reestruturação. | **Atualizado** — bate com a estrutura real de `src/`. Referência principal de arquitetura. |
| [`weekly-actions-recovery.md`](./weekly-actions-recovery.md) | Reconciliação de origens semanais, CLI de replay, rejeições, alertas e compatibilidade. | Runbook operacional; implantação e alertas dependem do operador. |
| [`specs/SPEC-scoring.md`](./specs/SPEC-scoring.md) | Spec do sistema de pontuação (dois sistemas: regra cíclica e conclusão). | Espec de trabalho. |

## Planos de correção (histórico)

| Documento | O que é | Estado |
|---|---|---|
| [`planos/BUG_FIX_PLAN.md`](./planos/BUG_FIX_PLAN.md) | Primeiro plano de correção de bugs (bugs #1–#45). | **Histórico** — 43/45 corrigidos. |
| [`planos/BUG_FIX_PLAN_2.md`](./planos/BUG_FIX_PLAN_2.md) | Segunda auditoria (bugs `B2-xx`). | **Histórico** — todos corrigidos. |

## Dados de conteúdo

| Documento | O que é | Estado |
|---|---|---|
| [`conteudo/duomatch_content_batch_m6.json`](./conteudo/duomatch_content_batch_m6.json) | Lote de conteúdo m6: 150 atividades + 60 desafios. | **Consumido** — todos os 210 `id` já estão em `src/infrastructure/seed/contentCatalog.js`. Guardado como fonte/registro do lote. |
| [`conteudo/duomatch_content_batch_m7.json`](./conteudo/duomatch_content_batch_m7.json) | Lote de conteúdo m7: 150 atividades + 60 desafios. | **Consumido** — todos os 210 `id` já estão em `src/infrastructure/seed/contentCatalog.js`. |

> Os lotes ficam em `docs/conteudo/` (e não em `data/`) porque **não são lidos
> em runtime** — o app consome `src/infrastructure/seed/contentCatalog.js`. São registro de
> origem dos dados, não dado de aplicação.

## Histórico / material antigo

| Documento | O que é | Estado |
|---|---|---|
| [`historico/AGENTS-completo.md`](./historico/AGENTS-completo.md) | Versão completa antiga do guia de agentes de IA (42 KB). | **Desatualizado** — ver nota abaixo. |
| [`historico/CLAUDE-completo.md`](./historico/CLAUDE-completo.md) | Versão completa antiga do `CLAUDE.md` (41 KB), quase duplicata do AGENTS. | **Desatualizado** — ver nota abaixo. |
| [`historico/attached_assets/`](./historico/attached_assets/) | `.txt` de import colado (rascunho de componente React). | **Material bruto** — sem referência no código. |

> **Por que os guias completos foram movidos para `historico/`:** eles estavam
> divergentes do código real (citavam `MainView.js` com 1027 linhas quando tem
> 1063; `useActivities.js` 528 vs 546; `HotZone.js` 838 vs 876) e eram quase
> duplicatas um do outro. Na raiz ficou uma versão **curta e correta** em
> [`../AGENTS.md`](../AGENTS.md), que é o arquivo lido automaticamente pelas
> ferramentas de IA. O conteúdo completo foi preservado aqui, sem edição.

## Arquivos de configuração (permanecem na raiz)

`package.json`, `firebase.json`, `firestore.rules`, `vercel.json`, `.firebaserc`,
`opencode.json`, `.replit`, `tailwind.config.js`, `postcss.config.js` — configs
funcionais, referenciadas por ferramentas/plataformas; não são documentação.
