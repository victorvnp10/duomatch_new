# AGENTS.md

Guia curto para agentes de IA (Claude Code, Codex, OpenCode) que trabalham
neste repositório. Este arquivo é **intencionalmente enxuto** e substitui o
guia extenso antigo, que estava desatualizado e duplicado.

## Projeto

DuoMatch — app web para casais planejarem atividades, desafios e recompensas
juntos, com sincronização em tempo real (Firebase) e PWA (funciona offline).

**Stack:** React 18 + Create React App (`react-scripts`), Firebase
(Auth + Firestore com cache offline persistente), Tailwind CSS, Workbox.

## Estrutura do código (`src/`)

Organização em camadas (DDD/Clean Architecture):

```
src/
  domain/          # Regras de negócio puras — sem Firestore/React
    entities/  services/  valueObjects/
  application/     # Orquestração: hooks React e serviços que usam o domínio
    hooks/  services/
  infrastructure/  # Firestore, seed de conteúdo, integrações externas
    firebase/  seed/
  presentation/    # Componentes e telas
    components/  components/preview/  pwa/
  shared/          # Utilitários puros, sem regra de negócio
    lib/
```

O catálogo de conteúdo do app vive em `src/infrastructure/seed/contentCatalog.js`
(é seed de infraestrutura, consumido por `ContentRepository`).

## Documentação

Toda a documentação está em [`docs/`](./docs/README.md) (índice completo lá):
arquitetura em `docs/ARCHITECTURE.md`, planos de correção em `docs/planos/`,
dados de conteúdo em `docs/conteudo/` e material histórico em `docs/historico/`.

> Os guias completos antigos (antes na raiz como `AGENTS.md`/`CLAUDE.md`) foram
> preservados em `docs/historico/AGENTS-completo.md` e
> `docs/historico/CLAUDE-completo.md`. São extensos, mas **estavam divergentes
> do código** — trate-os como histórico, não como fonte de verdade. Confirme
> qualquer detalhe direto no código.

## Comandos

```bash
npm start        # desenvolvimento
npm run build    # build de produção (PWA)
```

## Regras

- Não editar `build/`, `node_modules/`.
- Configs de plataforma (`firebase.json`, `firestore.rules`, `vercel.json`,
  `.replit`, `opencode.json`) só mudam por motivo explícito.
