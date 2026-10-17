# 1. Props sem leitura no IntimacyMeter

Base: `04c99fd07116964276255f7cc3674bfa574dda20` (ref local hermes/melhorias).

- `src/presentation/components/HotZone.js:133`: único ponto JSX de produção para IntimacyMeter, antes com user/userData/coupleData; agora apenas coupleData.
- `src/presentation/components/hotzone/IntimacyMeter.js:5`: assinatura `({ coupleData })`, sem leitura de user/userData.
- `src/presentation/components/hotzone/IntimacyMeter.test.js:4-14`: getters comprovam que as props antigas não são lidas e renderToStaticMarkup comprova markup idêntico.
- Busca: `git grep -n -E 'IntimacyMeter|mainViewService|recordActivitySelectionStreak|recordSuggestionSelectionStreak'` em todo o repositório; nenhum outro consumidor de produção do medidor.
- Alteração: removidas somente as duas props no ponto de chamada; user/userData continuam necessários em outros filhos e na ordenação, portanto não removidos do HotZone.
- Prova estrutural: parser Babel instalado; comparação dos roots JSX antes/depois com posições/comentários removidos e normalização APENAS dos atributos user/userData do IntimacyMeter. Assertion de contrato falhou antes (atributos extras) e passou depois. Não é identidade literal do JSX de componente (essas duas props são a alteração autorizada), mas o teste existente prova identidade do HTML do medidor.
- Verificação executada: npm test (394/394), npm run build (exit 0). Logs crus e script em `../duomatch-fixes/22-limpeza/` relativo ao diretório de worktrees. Sem alteração de comportamento pretendida.
