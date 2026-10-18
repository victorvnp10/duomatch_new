# Catálogo global no servidor

Fonte mantida: `src/infrastructure/seed/**`. Não editar nem versionar
`functions/generated/contentCatalog.json`: é artefato de distribuição.

```sh
npm ci
npm ci --prefix functions
npm --prefix functions run build:catalog
```

`firebase.json` executa a geração antes de qualquer deploy de Functions.
O script importa o mesmo catálogo ESM usado pelas ferramentas/testes e grava
JSON dentro de `functions/`, que é a única pasta enviada ao runtime CommonJS
Node 22. Assim não há importação para fora do pacote em produção nem duas
fontes a manter. Custo: um artefato derivado e uma etapa de geração obrigatória;
chamar diretamente `functions/index.js` sem gerar antes falha explicitamente.
`npm --prefix functions run serve` e `npm run test:e2e` geram automaticamente.

`syncContentCatalog` é callable v2, `southamerica-east1`, exige login. Aceita
nenhum argumento, `{}`, ou `{ ids: [...] }`. Lista vazia é no-op; ids desconhecidos,
mais ids que o catálogo, chaves adicionais ou tipos inválidos são rejeitados
antes de qualquer escrita. O cliente não fornece os documentos. Retorna
`{ scanned, written, unchanged }`.

A sincronização compara todos os campos com os dados canônicos e grava apenas
itens ausentes ou diferentes; **edições manuais em documentos de ids canônicos
serão revertidas**. Não apaga itens fora do catálogo. Cada grupo de até 400
itens usa transação com leitura antes da escrita: concorrência é reavaliada e
não causa regravação de itens idênticos. A sincronização inteira não é uma
transação única: uma falha entre grupos pode deixar progresso parcial, recuperado
pela chamada seguinte. Não há marcador nem timestamp artificial em cada item.

Regras negam toda escrita do cliente. `recentActivityIds`/`recentChallengeIds`
validam novos ids com `exists` nas coleções administradas pelo servidor, mantendo
os limites anteriores e permitindo publicar ids sem deploy de app/regras. Isso
acrescenta leituras de regras (até cinco atividades e um desafio por operação).
Remover fisicamente um item impede novos registros dele no histórico; preferir
`active: false` para desativação sem invalidar dados históricos.

Prova local (somente emulador; o teste recusa executar sem host de emulador):

```sh
firebase emulators:exec --only firestore --project demo-duomatch \
  "node --test test/functions/sync-content-catalog.test.cjs && node test/rules/duomatch.rules.test.cjs"
npm run test:e2e
# Opcional: prova de bootstrap totalmente vazio, sem fixture global.
E2E_COLD_CATALOG=1 npm run test:e2e
```

Implantar na ordem: Functions → app (Vercel) → regras. Não implantar o cliente
antes da callable. O endpoint fica disponível após o deploy, mas o catálogo só
é materializado quando um cliente autenticado o chama. Esta mudança não modifica
os pontos de desafio semanal nem `scores` de rodadas.
