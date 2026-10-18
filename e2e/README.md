# E2E — Chromium + Firebase Auth/Firestore

## Executar

Requer Node compatível com o projeto, Java 21+ e `firebase` CLI no PATH.
O CI reutiliza o CLI instalado no passo de testes de regras.

```sh
npm ci
npx playwright install chromium --with-deps
# Se necessário, instale o CLI fora do app:
npm install --prefix "$HOME/.cache/duomatch-firebase" firebase-tools@15.34.0
export PATH="$HOME/.cache/duomatch-firebase/node_modules/.bin:$PATH"
npm run test:e2e
```

Portas exclusivas: Vite 4175, Auth 9199, Firestore 8180, hub 4411,
logging 4511. Não usa secrets, contas ou projeto Firebase de produção.
Os emuladores são iniciados e encerrados pelo CLI. Não reutiliza servidor Vite
existente nem storageState. Cada teste registra seus próprios usuários na UI e
cria seu próprio casal por convite, em contextos independentes.

Para repetir sem depender de ordem e sem retries:

```sh
firebase emulators:exec --only auth,firestore --project demo-duomatch-e2e \
  --config firebase.e2e.json 'npm run test:e2e:browser -- --repeat-each=3'
```

## O que é real e o que é fixture

O Vite **somente em `serve --mode e2e`** conecta o SDK original aos emuladores.
Não existe conexão com emuladores no `src/infrastructure/firebase` original.
Nenhum arquivo de `src/**` é alterado. Builds, inclusive `build --mode e2e`,
não recebem a instrumentação. O projeto de teste é obrigatoriamente
`demo-duomatch-e2e`.

Cadastro, perfil, convite, onboarding, desafio e envio/recebimento de mensagens
usam UI/SDK reais e as regras originais. A segurança é testada com SDK no
Chromium autenticado como intruso (não Admin), com controle positivo da leitura
do próprio perfil e verificação do documento protegido no servidor.

Admin REST local serve apenas para carregar o catálogo original uma vez antes
dos workers, criar a atividade já confirmada do cenário de chat, e verificar
persistência. Não intercepta nem simula respostas Firebase nos testes normais.
O chat é conferido no navegador do destinatário antes e depois de reload, não
somente no cache otimista do remetente.

O componente `DailyChallenge` hoje apresenta **Desafio Semanal**. O teste aceita
e reivindica, confere a gravação no servidor e o estado após duas recargas.
Datas são derivadas do mesmo navegador que executa a ação; nenhum nome aleatório
de sugestão ou desafio é fixado em assertiva.

## Sensibilidade (falha esperada)

```sh
E2E_MUTATE_PROFILE=1 firebase emulators:exec --only auth,firestore \
  --project demo-duomatch-e2e --config firebase.e2e.json \
  'npm run test:e2e:browser -- --grep onboarding'
# Deve terminar com exit 1: getByPlaceholder('Seu apelido') não existe.
npm run test:e2e
# Sem a variável, restaura o módulo original e a suíte deve passar.
```

A mutação renomeia o placeholder no módulo React realmente entregue ao Chromium
por `route.fulfill`; não modifica a assertiva nem `src/**`. Essa é a única
interceptação e só é instalada com a variável explícita.

## Limites / diagnóstico de catálogo vazio

O teste normal pressupõe catálogo implantado. Foi observado no emulador que
vários navegadores iniciando com catálogo vazio deixam escritas de onboarding
pendentes além da janela de 12s, enquanto cada sessão tenta plantar centenas
de documentos. Não foi corrigido código de produção nem atribuído o defeito à
produção sem prova. Para reproduzir deliberadamente, em emulador novo:

```sh
E2E_COLD_CATALOG=1 npm run test:e2e
```

Essa execução diagnóstica pode falhar; não é o comando normal do CI. O problema
está descrito com evidências no RELATORIO-E2E.md da entrega.

A suíte usa servidor de desenvolvimento: **não prova instalação/upgrade/offline
do service worker**, OAuth Google, FCM, Storage, pontos/rodadas ou seleção da
atividade do chat. Build PWA e testes existentes continuam sendo verificados
separadamente. Chromium desktop apenas, 2 workers, sem `sleep`/`waitForTimeout`.
Relatório HTML e traces/screenshots de falhas vão para `playwright-report/` e
`test-results/`, ignorados pelo Git e publicados pelo CI (7 dias).
