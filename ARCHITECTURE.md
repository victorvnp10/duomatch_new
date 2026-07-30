# Arquitetura do DuoMatch

Este documento descreve a reestruturação do projeto para separação em
camadas (inspirada em Domain-Driven Design e Clean Architecture), as
falhas reais encontradas e corrigidas, e o que fica como próximo passo.

## Estrutura de pastas

```
src/
  domain/                   # Regras de negócio puras — zero dependência
    entities/                 de Firestore, React ou qualquer infraestrutura.
      Achievement.js         Testável isoladamente.
    services/
      AchievementStatsBuilder.js
      RoundRulesEvaluator.js
    valueObjects/
      Periodicity.js

  application/              # Orquestração: hooks React que usam o domínio
    hooks/                    e decidem o que ler/gravar no Firestore.
      useAuth.js
      useCouple.js
      useActivities.js
      useRounds.js
      useRoundRules.js       (novo — extraído de DuoMatchApp.js)
      useWishlist.js
      useRewards.js
      useChat.js
      useSuggestions.js
      useAchievements.js

  infrastructure/           # Detalhes técnicos: Firebase, variáveis de
    firebase/                 ambiente, inicialização.
      config.js
      index.js

  presentation/             # Componentes React (UI) e camada de PWA.
    components/
    pwa/
      OfflineBanner.js
      InstallPrompt.js

  shared/                   # Utilitários genéricos e sem regra de negócio.
    utils.js
    utils/streakUtils.js
```

**Regra da dependência**: `domain/` não importa nada de `application/`,
`infrastructure/` ou `presentation/`. `application/` pode importar
`domain/` e `infrastructure/`. `presentation/` pode importar
`application/` e `domain/`, mas idealmente fala só com `application/`.

## Falhas reais encontradas e corrigidas

Esta não foi uma reorganização cosmética — a auditoria encontrou bugs
concretos, alguns afetando a experiência do usuário há tempo:

### 1. Três conquistas eram permanentemente impossíveis de desbloquear
"Grande Gastador", "Esquentando" e "Realizador de Sonhos" apareciam na
tela de conquistas (`AchievementSystem.js`), mas nenhuma parte do código
gravava esses IDs no Firestore. O casal via a meta, mas nunca conseguia
cumpri-la. **Corrigido**: catálogo único em
`domain/entities/Achievement.js`, com condição de desbloqueio real para
cada uma (gasto acumulado em recompensas, atividades Hot confirmadas,
itens da wishlist presenteados).

### 2. Lógica de conquistas duplicada em 3 lugares, com resultados
### divergentes
`useAchievements.js` (hook), `AchievementSystem.js` (componente) e o
manipulador de evento em `DuoMatchApp.js` cada um tinha sua própria cópia
da lista de conquistas e/ou da lógica de desbloqueio — nem sempre
concordando entre si. **Corrigido**: uma única fonte de verdade
(`ACHIEVEMENT_CATALOG`); os três pontos agora leem dali.

### 3. Conquista "Super Comunicativo" inatingível
Lida em 3 arquivos (`coupleData.messageCount`), mas nunca incrementada
em lugar nenhum — nenhuma mensagem de chat gerava esse contador.
**Corrigido**: `useChat.js` agora incrementa `messageCount` a cada
mensagem postada.

### 4. Vazamento de listeners do Firestore na autenticação
Em `App.js`, cada disparo de `onAuthStateChanged` (login, refresh de
token, etc.) abria um novo listener `onSnapshot` no documento do
usuário, mas o cleanup do `useEffect` só cancelava o listener de
autenticação — o listener anterior do documento do usuário (e do
parceiro) nunca era cancelado. Ao longo de uma sessão, isso acumula
listeners duplicados (leituras extras, risco de estado inconsistente).
Havia inclusive um hook `useAuth.js` já escrito corretamente para isso,
mas **nunca era importado por ninguém** — o app usava uma cópia
duplicada e com bug dentro de `App.js`. **Corrigido**: `App.js` agora
usa `application/hooks/useAuth.js`, que cancela cada listener antes de
abrir o próximo.

### 5. Campo `uid` podia ficar ausente no perfil do usuário
No caminho de contingência do cadastro (usado apenas se o documento do
Firestore ainda não existisse no primeiro snapshot após o cadastro), o
perfil inicial era criado sem o campo `uid`. Isso quebra silenciosamente
comparações como `activity.selections?.[userData.uid]`, usadas em
conquistas, desafio diário e sugestões. **Corrigido**: o campo é sempre
incluído.

### 6. Hook duplicado e não utilizado
`useCoupleData.js` era uma cópia quase idêntica de `useCouple.js`
(mesma responsabilidade, pequenas diferenças de comportamento), mas
**nunca era importado em lugar nenhum** — puro código morto, com risco
real de alguém futuramente importar a versão errada. **Removido**.

### 7. Regra de pontuação cíclica embutida no componente de UI
A lógica que decide penalidades por não cumprir metas de atividades/
desafios por período vivia inteira dentro de `DuoMatchApp.js`, misturada
com estado do React e chamadas diretas ao Firestore — impossível de
testar isoladamente, e com dois blocos de código quase idênticos
colados lado a lado (atividades × desafios). **Corrigido**: a decisão
de negócio pura foi extraída para
`domain/services/RoundRulesEvaluator.js`; a orquestração (quando avaliar,
como gravar) ficou em `application/hooks/useRoundRules.js`.

### 8. Chaves do Firebase hard-coded no código-fonte
Movidas para variáveis de ambiente (`REACT_APP_FIREBASE_*`, ver
`.env.example`), seguindo a prática padrão do Create React App.

### 9. `console.log` de depuração deixados em produção
Removidos de `useAchievements.js` e `shared/utils/streakUtils.js`.

## Melhorias de experiência do usuário

- **Cache offline do Firestore habilitado** (`persistentLocalCache` +
  `persistentMultipleTabManager`) — o casal continua vendo atividades,
  rodadas, recompensas e conversas mesmo sem internet; ações feitas
  offline sincronizam sozinhas quando a conexão volta.
- **Banner de conectividade** (`OfflineBanner.js`) — avisa quando o app
  está offline (e quando volta), para as ações offline não parecerem
  "travadas" ou silenciosamente ignoradas.
- **Banner de instalação do PWA** (`InstallPrompt.js`) — usa o evento
  nativo `beforeinstallprompt`; sem isso, a maioria dos usuários em
  Android/desktop nunca descobre que o app pode ser instalado.
- **Tela de carregamento com esqueleto** (`LoadingScreen.js`) — substitui
  o texto genérico "Carregando..." por uma silhueta da tela principal.
- **Atalhos do PWA** ("Rodadas", "Loja" no manifest) funcionam de fato —
  a view inicial agora lê o parâmetro `?view=` da URL.

## PWA — o que foi configurado

- `public/manifest.json` completo: ícones (incluindo variantes
  `maskable` para Android), `theme_color`, `display: standalone`,
  atalhos.
- Ícones gerados (`logo192.png`, `logo512.png`, `favicon.ico`,
  `icons/maskable-*.png`) — arte original simples (dois corações
  sobrepostos), já que nenhum ativo de design foi fornecido.
- Meta tags de iOS (`apple-mobile-web-app-capable`, `apple-touch-icon`
  etc.) — o Safari não lê `manifest.json` para isso.
- `src/service-worker.js` com Workbox: precache de todos os assets do
  build (JS/CSS/HTML, com cache-busting por hash de conteúdo — detectado
  e injetado automaticamente pelo `react-scripts` ao rodar
  `npm run build`, sem precisar ejetar ou usar ferramentas extras),
  cache-first para imagens, stale-while-revalidate para fontes externas.
- **Importante**: o service worker propositalmente NÃO intercepta
  tráfego do Firestore/Firebase Auth — essas requisições já têm seu
  próprio mecanismo de offline (IndexedDB) e interceptá-las por engano
  poderia corromper o streaming em tempo real.

## Nova funcionalidade: Ciclo (insights de casal)

Adicionado um acompanhamento de ciclo menstrual, com uma tela dedicada
(`presentation/components/CycleView.js`, acessível pelo card "Ciclo" na
tela de Perfil):

- **Quem registra** (por padrão, o perfil com `gender === "feminino"`;
  pode ser trocado manualmente com o botão "Sou eu quem registra") vê um
  painel completo: data da última menstruação, duração do ciclo/
  menstruação, dia atual, fase e previsão da próxima menstruação.
- **O parceiro** vê apenas um card com o insight do dia (ícone + frase
  curta, ex.: "Hoje começa o seu período de sorte!", "Cuidado, hoje não
  é um bom dia") — nunca as datas brutas.
- Toda a decisão de fase/mensagem é domínio puro e testável, sem
  Firestore: `domain/valueObjects/MenstrualCycle.js` (cálculo de dia do
  ciclo, fase, janela fértil por método calendário) e
  `domain/services/CycleInsightService.js` (mapeia fase → mensagem). A
  orquestração (ler/gravar no Firestore) fica em
  `application/hooks/useMenstrualCycle.js`.
- **Limites explícitos**: é uma estimativa por calendário — não é
  diagnóstico médico nem método contraceptivo, e isso aparece por
  escrito na própria tela (`DisclaimerNote`), tanto para quem registra
  quanto para quem recebe o insight.

## O que fica como próximo passo

Esta refatoração priorizou o maior risco/valor: os bugs de conquistas e
autenticação, e a extração da regra de pontuação cíclica (o pior caso de
lógica de negócio dentro de componente). Ainda ficaram na camada de
aplicação, sem uma camada de repositório dedicada, os seguintes hooks
(funcionam corretamente, mas ainda chamam o Firestore diretamente em vez
de passar por uma interface de repositório): `useActivities.js`,
`useWishlist.js`, `useRewards.js`, `useChat.js`, `useSuggestions.js`. O
próximo passo natural, seguindo o mesmo padrão usado em
`useRoundRules.js`, é extrair um `infrastructure/firebase/repositories/`
por agregado (`ActivityRepository`, `WishlistRepository`,
`RewardRepository`) sempre que uma dessas áreas precisar de mudança —
sem necessidade de reescrever tudo de uma vez.

## Tour interativo e Central de Notificações

### Tour (onboarding)

O sistema de tour por spotlight já existia (`OnboardingView.js`), mas
tinha três lacunas reais:

- Os seletores `data-tour-id="rounds-card"` e
  `data-tour-id="sugestoes-dia"` eram referenciados desde sempre, mas
  **nunca existiam no DOM** — essas etapas nunca destacavam nada de
  verdade, só mostravam um modal centralizado. Agora os elementos reais
  em `MainView.js` têm esses atributos.
- O campo `onboardingCompletedBy` já era gravado no Firestore
  (`handleCompleteOnboarding` em `useCouple.js`), mas **nada lia esse
  campo** — o tour só abria pelo botão de Ajuda, nunca sozinho na
  primeira vez que alguém usava o app. `DuoMatchApp.js` agora verifica
  isso e abre o tour automaticamente quando o usuário atual ainda não
  está nesse array.
- Os seletores de navegação (Hot Zone, Desejos, Loja) dependiam do
  `aria-label`, que era **diferente entre desktop e mobile** (ex.: "Hot
  Zone" vs "Hot") — funcionava só num dos dois. Agora usam
  `data-tour-id` consistente nos dois layouts (`MainView.js` e
  `BottomNavBar.js`).

O tour agora também **navega de verdade entre as telas** a cada passo
(`OnboardingView` recebe `setView` e cada passo declara sua `view`) —
por isso consegue incluir Conquistas, Ciclo (na tela de Perfil) e a
Central de Notificações no roteiro, e termina literalmente na tela de
Rodadas, pronta para criar a primeira rodada.

Descoberta lateral: o botão da Carteira **nunca existia na navegação
desktop**, só no menu mobile — corrigido junto.

### Central de Notificações

Diferente dos toasts efêmeros que já existiam (`NotificationManager.js`
— aparecem e somem sozinhos), a nova central (`NotificationCenter.js` +
`application/hooks/useNotificationCenter.js`) mostra o estado ATUAL de
pendências, calculado ao vivo a partir do que já está carregado — sem
nenhum campo novo no Firestore e sem necessidade de "marcar como lido":
um item some sozinho da lista assim que deixa de ser verdade.

Itens cobertos: atividade que o parceiro já confirmou e você ainda não
(exclui as que já viraram match), desafio lançado pelo parceiro ainda
sem resposta, lembrete de marcar algo no dia (se nenhuma das sugestões
do dia foi confirmada ainda), e recompensas aguardando sua aprovação.
