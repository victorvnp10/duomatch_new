# DuoMatch

Aplicativo web para casais planejarem atividades, desafios e recompensas juntos — com sincronização em tempo real via Firebase e suporte a instalação como PWA (funciona offline).

## Configuração

Requer Node ^20.19.0 ou >=22.12.0 (CI: Node 22).

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha com as chaves do seu projeto Firebase (Console do Firebase → Configurações do projeto → Seus apps → Configuração do SDK):
   ```bash
   cp .env.example .env
   ```
   > As variáveis continuam usando o prefixo `REACT_APP_`: o shim do Vite mantém compatibilidade com a Vercel e com os acessos dinâmicos de configuração. Não há credenciais reais neste exemplo; preencha os valores antes de executar o app.

3. Rode em desenvolvimento:
   ```bash
   npm start
   ```
4. Gere o build de produção (PWA otimizado, com service worker e precache):
   ```bash
   npm run build
   ```
   O conteúdo de `dist/` pode ser publicado em qualquer hospedagem estática (Vercel, Firebase Hosting, Netlify etc.) — já inclui `manifest.json`, ícones e o service worker.

Os comandos `npm test` (394 testes Jest), `npm run test:build` (após o build) e
`npm run preview` continuam disponíveis. O Vite não executa lint no build;
`npm run lint` permanece separado no CI. O PWA preserva o único service worker
existente (FCM + Workbox), compilado via `vite-plugin-pwa`/`injectManifest`.
O `vercel.json` fixa `framework: vite`, `outputDirectory: dist` e fallback SPA.
Não publique o build local com placeholders: use as variáveis reais da Vercel.
O Vite usa seu próprio target de navegadores; `browserslist` não governa esse build.

## Estrutura do projeto

O código segue uma organização em camadas (DDD/Clean Architecture):

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

## Documentação

Toda a documentação está em [`docs/`](./docs/README.md):

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — organização em camadas, o racional por trás de cada decisão e a lista de falhas corrigidas nesta reestruturação.
- [`docs/planos/`](./docs/planos/) — planos de correção de bugs (histórico).
- [`docs/conteudo/`](./docs/conteudo/) — lotes de conteúdo do app (já importados para `src/infrastructure/seed/contentCatalog.js`).
- [`docs/historico/`](./docs/historico/) — material antigo preservado (guias de IA extensos e desatualizados).

O [`docs/README.md`](./docs/README.md) é o índice completo, indicando o que está atualizado e o que é histórico.

## Stack

- React 18 + Vite 7 (build) + Jest 29 (testes)
- Firebase (Auth + Firestore, com cache offline persistente)
- Tailwind CSS
- Workbox (service worker / PWA)
