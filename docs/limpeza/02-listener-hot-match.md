# 2. Listener global hotActivityMatch

## Encontrado

Na base 04c99fd, `DuoMatchApp.js:270-289` tinha handler próprio para `hotActivityMatch`; `HotZone.js:65` já usava `useMatchNotification(["activityMatch", "hotActivityMatch"])`. É o MESMO evento, não dois eventos de semânticas distintas. `useActivities.js:437-445` e `useSuggestions.js:280-288` emitem `{ activityName }` via dispatcher ou fallback. Os eventos `activityMatch` (não-hot) são distintos e não foram adicionados ao listener do App.

Dois listeners podem atualizar estados em paralelo na view hot, mas **não havia dois overlays visíveis**: a guarda `view !== "hot"` do App (base:342) deixa o HotZone renderizar sua animação. Não eliminar o estado global: ele também cobre outras views e pode sobreviver a navegação.

## Feito e provas

- App agora reutiliza o hook em `src/presentation/components/DuoMatchApp.js:276-281`, apenas para hotActivityMatch. Dispatcher/cleanup global ficam em :283-293. JSX e guarda `view !== "hot"` permanecem; onComplete usa ação hide do hook.
- `src/application/hooks/useMatchNotification.js:29-59`: parser opcional estável, default inalterado para consumidores anteriores. O App fornece `extractHotMatchActivityName` (:48-51), com a MESMA desestruturação antiga. Motivo: usar diretamente o parser tolerante do hook alteraria strings legadas, nomes falsy e erros de payload nulo; não ampliar o contrato em uma limpeza. Estado por instância preservado.
- Teste novo do parser (`useMatchNotification.test.js:72-87`) falhou ANTES da implementação: string inválida para o App aparecia como nome. Depois passa, preservando vazio e nome objeto. Defaults continuam cobertos pelos testes anteriores.
- Dois testes DOM em `DuoMatchApp.errors.test.js:60-78`: App real + HotZone/MatchNotification reais, CustomEvent real, exatamente um overlay em main e hot, fechamento após 3500ms. Demais hooks externos mockados; não é E2E Firebase.
- Comparação Babel de todos os 12 roots JSX do App com a base: idênticos removendo posições/comentários e normalizando APENAS `setShowHotMatchNotification(false)` para `hideHotMatchNotification()`. Contrato estrutural de uso único do hook e ausência do handler próprio falhou antes e passou depois.
- npm test: 397/397 (394 originais + 3); npm run build: exit 0. Saídas cruas externas em `duomatch-fixes/22-limpeza/item2-*`.

## Limite deliberado

Unificação é de implementação do listener, **não** armazenamento compartilhado nem redução forçada a uma assinatura global: remover a assinatura do HotZone ou mover estado para o App mudaria ciclo de vida e comportamento ao navegar. Mantidos ambos os consumidores, cada um com seu escopo visual existente.
