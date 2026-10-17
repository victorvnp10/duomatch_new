# 5. Auditoria de resíduos e código morto (listagem, sem remoção)

Método reproduzível: scripts Babel `audit-modules.cjs` + `audit-local-references.cjs` em `duomatch-fixes/22-limpeza/`, arquivos rastreados por git, imports/exports/require/import() **literais**, resolução relativa .js/.jsx/index e recursos existentes. Entradas: src/index.js e src/service-worker.js. Resultado: 159 módulos JS, 114 alcançáveis de produção, dois módulos de produção fora do grafo; zero imports relativos não resolvidos, inclusive nos testes. Não é prova sobre nomes calculados por strings externas; busca textual e build/testes complementam o grafo.

## Confirmados/candidatos registrados

| Arquivo:linha | Evidência e decisão |
|---|---|
| application/services/mainViewService.js:5,22 | Duas funções sem consumidor de produção ou referência local; só teste próprio :1. Criado em 9f7ac07 e substituído no MainView pelo tratamento de rejeição de persistência. É resíduo confirmado da extração; ver item 4. Manter e recomendar legado. |
| presentation/components/SetPointsModal.js:5,57 | Módulo sem nenhum importador (nem teste), fora do grafo. Busca pelo nome só retorna o próprio arquivo. `git log --follow` mostra commits antigos 25972eb/efd52b0, não criado pela limpeza atual. Listar como candidato legado; não deletar. |
| application/hooks/useDailyChallenge.js:38-39,328-330 | currentChallenge/weeklyProgress são estados sem papel funcional, lidos só por void; setters sem consumidor. Herdados da decomposição (9b0cf3d). Mantidos deliberadamente pelos agentes anteriores para ordem/quantidade de hooks. Listar, não remover sem tarefa própria de simplificação e prova de hooks. |
| presentation/components/DailyChallenge.js:9; MainView.js:579 | onAcceptChallenge recebida e nunca usada; MainView ainda passa a prop. Contrato morto herdado, não modificado. |
| domain/valueObjects/MenstrualCycle.js:43 | isValidCycleLength só consumida por teste (:13,56-67), sem referência local funcional ou produção. API possivelmente intencional, anterior à limpeza; domínio proibido, apenas registrar. |
| domain/services/CycleInsightService.js:222 | Reexport de getFertileWindow sem consumidor por esse caminho. Função original NÃO está morta: MenstrualCycle.js:92,103,222 a usa. Domínio proibido; somente export redundante candidato. |
| infrastructure/firebase/repositories/ContentRepository.js:84,105,114,121 | clearActivityCatalogCache, clearChallengeCatalogCache, recordRecentActivityIds, recordRecentChallengeIds sem importadores nem chamadas locais (Babel binding). São APIs candidatas, já existentes; reset de cache pode ser utilitário futuro. Não removidas/retrabalhadas. |

## Falsos positivos descartados com referência local

Ausência de import externo de um export NÃO significa código morto. Os bindings Babel comprovam uso local de:
- extractMatchActivityName (useMatchNotification.js:10,33), parser default real;
- daysBetween, resolveRulePeriodStart, countMarkedActivitiesInRound, countChallengesCreatedInRound (RoundRulesEvaluator.js:25,36,94,129), usados pelo avaliador;
- getStartOfWeek (WeeklyChallengeSchedule.js:19,33,60);
- MAX_CYCLE_LENGTH, getCurrentCycleStartDate, getCurrentCycleDay, getOvulationDay, getPhaseForDay, computeCycleLengths, byStartDateAsc (MenstrualCycle.js), usados na composição local;
- ensureActivityCatalog/ensureChallengeCatalog (ContentRepository.js:68,75,90,97);
- DailyChallenge export nomeado (:9) também exportado default (:72) e consumido assim;
- FEMALE_AVATARS/MALE_AVATARS (AvatarCatalog.js:178,205,232,248), INVITE_CODE_ALPHABET/INVITE_CODE_LENGTH (inviteCode.js:21-22,27,53), isPushSupported (pushSubscription.js:74,97).

Inventário completo (inclusive linhas locais) em `module-audit.json` e `export-local-references.json`. Nenhum arquivo de teste de módulo removido encontrado: não há imports relativos pendurados, 43 suítes executam e nenhum módulo foi removido nesta branch.

Verificação do item: npm test 397/397, npm run build exit 0. Nada removido. Esta auditoria não autoriza limpeza automática dos candidatos; diferencia APIs não consumidas, helpers locais vivos e resíduos confirmados.
