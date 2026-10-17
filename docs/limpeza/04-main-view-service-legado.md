# 4. mainViewService órfão: preservar e recomendar legado

- `src/application/services/mainViewService.js:5,22` exporta recordActivitySelectionStreak/recordSuggestionSelectionStreak.
- `src/application/services/mainViewService.test.js:1` é o **único importador**. Busca repositório inteiro por nome do módulo e dos dois exports, excluindo só estes documentos de relatório, não encontrou consumidor de produção. AST de todos os imports/exports/require/import() literais em src confirma o mesmo (`module-audit.json`).
- `src/presentation/components/MainView.js:24,269-280,299,320` usa diretamente updateStreak do streakService e **aguarda/captura rejeição**. A referência textual a mainViewService em :269 é comentário, não import.
- `mainViewService.js:4,12-18,26` descarta o Promise de propósito; reintroduzi-lo como camada do MainView perderia tratamento de erro já implementado. Não reaproveitar como se as interfaces fossem equivalentes.

Decisão autorizada pelo enunciado: **registrar recomendação**, não mover nem deletar nesta limpeza. Recomendação: em tarefa explícita de migração para legado, mover módulo e seu teste juntos para uma pasta de legado documentada (e conferir descoberta do Jest), ou arquivar quando a política permitir remoção. Evitei mover arquivos pois a tarefa proíbe deleção e git detectaria rename como remoção/adição em alguns consumidores de diff; não há ganho de execução em fazê-lo agora.

Custo de manter: um serviço de 28 linhas, suíte própria de testes, sem usuário em produção; sugere uma camada inexistente e um contrato fire-and-forget obsoleto. Mantê-lo fora do grafo de runtime não aumenta o bundle, mas mantém custo cognitivo e execução/manutenção de testes. Os testes não são de módulo removido: o módulo continua presente.

Verificação do item: npm test 397/397 e npm run build exit 0; serviço e teste intactos. Sem promessa de que o módulo será movido por esta branch.
