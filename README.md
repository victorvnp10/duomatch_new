# DuoMatch

Aplicativo web para casais planejarem atividades, desafios e recompensas juntos — com sincronização em tempo real via Firebase e suporte a instalação como PWA (funciona offline).

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie `.env.example` para `.env` e preencha com as chaves do seu projeto Firebase (Console do Firebase → Configurações do projeto → Seus apps → Configuração do SDK):
   ```bash
   cp .env.example .env
   ```
   > O `.env` já vem preenchido com as chaves do projeto Firebase original (`conexaocasal-18136`) para este repositório continuar funcionando imediatamente. Se for iniciar um projeto Firebase novo, substitua pelos seus valores.

3. Rode em desenvolvimento:
   ```bash
   npm start
   ```
4. Gere o build de produção (PWA otimizado, com service worker e precache):
   ```bash
   npm run build
   ```
   O conteúdo de `build/` pode ser publicado em qualquer hospedagem estática (Vercel, Firebase Hosting, Netlify etc.) — já inclui `manifest.json`, ícones e o service worker.

## Estrutura do projeto

O código segue uma organização em camadas (DDD/Clean Architecture):

```
src/
  domain/          # Regras de negócio puras — sem Firestore/React
    entities/  services/  valueObjects/
  application/     # Orquestração: hooks React que usam o domínio
    hooks/
  infrastructure/  # Firestore, PWA, integrações externas
    firebase/
  presentation/    # Componentes e telas
    components/  pwa/
  shared/          # Utilitários e catálogo de conteúdo
    utils/  contentCatalog.js
```

## Documentação

Toda a documentação está em [`docs/`](./docs/README.md):

- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — organização em camadas, o racional por trás de cada decisão e a lista de falhas corrigidas nesta reestruturação.
- [`docs/planos/`](./docs/planos/) — planos de correção de bugs (histórico).
- [`docs/conteudo/`](./docs/conteudo/) — lotes de conteúdo do app (já importados para `src/shared/contentCatalog.js`).
- [`docs/historico/`](./docs/historico/) — material antigo preservado (guias de IA extensos e desatualizados).

O [`docs/README.md`](./docs/README.md) é o índice completo, indicando o que está atualizado e o que é histórico.

## Stack

- React 18 + Create React App (`react-scripts`)
- Firebase (Auth + Firestore, com cache offline persistente)
- Tailwind CSS
- Workbox (service worker / PWA)
