# 3. Blocos pequenos inline: avaliação, não extração automática

Fonte histórica consultada: `duomatch-fixes/10-visual/RELATORIO-VISUAL.md:51-59,86-99`. Confirmado no código atual, não tomado como verdade sem busca.

| Bloco atual (src/presentation/components/) | Decisão e custo de extração |
|---|---|
| HotZone.js:109-129, header (não há componente Head) | Manter: um uso, 21 linhas de marcação, só setView e ícones. Nova unidade exigiria arquivo/import/prop de navegação sem reutilização nem estado a isolar. Redução de linhas não compensa dispersão da estrutura da tela. |
| HotZone.js:103-107, fundo decorativo | Manter: cinco linhas estáticas, um uso; extração seria só indirection visual. |
| HotZone.js:171-189, overlays de animação | Manter composição ao lado dos estados locais; LevelUpAnimation e MatchNotification já são componentes extraídos. Um wrapper só repassaria booleans/callbacks e esconderia guardas úteis para inspecionar a tela. |
| DailyChallenge.js:40-55, wrapper | Manter estrutura do cartão; Info/Actions já estão extraídos. Novo wrapper passaria categoryStyle e todas as props dos filhos sem responsabilidade nova. |
| DailyChallenge.js:57-63, aviso !activeRound | Manter bloco de uma frase condicionado ao estado do cartão; não há estado/evento/reuso próprio. |
| DailyChallenge.js:65-67, rodapé | Manter três linhas estáticas, um uso. |

Busca: `git grep -n -E '<header|Background decorative|Animações|bg-black/20|Novos desafios toda|Crie uma rodada ativa' -- src/presentation/components/HotZone.js src/presentation/components/DailyChallenge.js`. Header maior de MainView (:334-478) não é um resíduo pequeno desta decomposição; decompor navegação/tour/mobile é refatoração própria, não incluída nesta limpeza.

Nenhum JSX alterado neste item. `verify-inline.cjs` compara subárvores JSX dos cinco blocos de marcação com Babel contra 04c99fd, ignorando apenas metadados: identidade, sem normalização funcional. Na primeira execução o script usou :57-63 como JSXElement, mas esse intervalo contém expressão condicional; corrigido para o div real :58-62. Saída inicial preservada separadamente; saída final passa. Os overlays já entram na comparação total HotZone do item 1.

Verificação desta decisão: npm test 397/397 e npm run build exit 0. Não foi preciso mexer em estado, hooks nem componentes. Ruling: não extrair por tamanho apenas; custo se errado é organização local menos fragmentada, não mudança funcional.
