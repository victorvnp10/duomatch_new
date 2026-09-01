// Catalogo central de conteudo (atividades e desafios).
// FONTE DE SEED: este modulo e usado para popular as colecoes raiz do
// Firestore (contentActivities / contentChallenges) quando estao vazias.
// Depois disso, o app LE do banco (ver infrastructure/firebase/repositories/
// ContentRepository.js) e este arquivo so precisa mudar para ampliar o
// portfolio (basta adicionar itens e fazer o re-seed). Para re-plantar,
// basta rodar npm run build apos o app limpar/reescrever as colecoes.

export const ACTIVITY_CATALOG = [
  {
    "id": "act-hot-1-jogo-dos-5-sentidos",
    "name": "Jogo dos 5 Sentidos",
    "category": "Hot",
    "points": 20,
    "description": "Separe 5 itens para estimular cada sentido (visão, olfato, paladar, tato, audição) e use-os para provocar seu parceiro(a) de olhos vendados.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-2-vale-striptease-exclusiv",
    "name": "Vale-Striptease Exclusivo",
    "category": "Hot",
    "points": 15,
    "description": "Escolha a música, a iluminação e prepare uma dança sensual surpresa para o seu amor.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-3-cozinhando-de-avental-e-",
    "name": "Cozinhando de Avental... e só!",
    "category": "Hot",
    "points": 20,
    "description": "Preparem uma refeição juntos vestindo apenas aventais. O risco de se sujar nunca foi tão divertido.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-4-sessao-de-fotos-boudoir",
    "name": "Sessão de Fotos Boudoir",
    "category": "Hot",
    "points": 25,
    "description": "Seja com o celular ou uma câmera, criem um ambiente e façam uma sessão de fotos íntimas e sensuais um do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-5-caca-ao-tesouro-picante",
    "name": "Caça ao Tesouro Picante",
    "category": "Hot",
    "points": 15,
    "description": "Esconda pistas pela casa que levem a um 'tesouro' final, como uma lingerie nova, um brinquedo ou você.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-6-leitura-de-contos-erotic",
    "name": "Leitura de Contos Eróticos",
    "category": "Hot",
    "points": 10,
    "description": "Encontrem ou escrevam pequenos contos eróticos e leiam em voz alta um para o outro, com a entonação certa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-7-poker-strip",
    "name": "Poker Strip",
    "category": "Hot",
    "points": 10,
    "description": "Uma partida de qualquer jogo de cartas onde a aposta para o perdedor da rodada é tirar uma peça de roupa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-8-recriando-um-beijo-de-ci",
    "name": "Recriando um Beijo de Cinema",
    "category": "Hot",
    "points": 15,
    "description": "Escolham a cena de beijo mais icônica de um filme e se dediquem a recriá-la nos mínimos detalhes.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-9-pintura-corporal-comesti",
    "name": "Pintura Corporal Comestível",
    "category": "Hot",
    "points": 20,
    "description": "Use chocolate derretido, chantilly ou caldas de sobremesa para pintar o corpo um do outro. A 'limpeza' é a melhor parte.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-10-uma-noite-como-estranhos",
    "name": "Uma Noite como Estranhos",
    "category": "Hot",
    "points": 25,
    "description": "Marquem de se encontrar em um bar como se nunca tivessem se visto. Usem a criatividade para seduzir e 'conquistar' um ao outro de novo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-11-degustacao-as-cegas",
    "name": "Degustação às Cegas",
    "category": "Hot",
    "points": 15,
    "description": "Vende os olhos do(a) parceiro(a) e dê diferentes alimentos (morangos, chocolate, mel) para ele(a) provar, usando a boca ou o corpo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-12-cafe-da-manha-na-cama-co",
    "name": "Café da Manhã na Cama (com um extra)",
    "category": "Hot",
    "points": 15,
    "description": "Surpreenda seu amor com um café da manhã na cama, e ofereça-se como 'prato principal'.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-13-vale-audio-provocante",
    "name": "Vale-Áudio Provocante",
    "category": "Hot",
    "points": 10,
    "description": "No meio do dia, envie um áudio inesperado descrevendo uma fantasia ou o que você gostaria de fazer mais tarde.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-14-desafio-do-gelo",
    "name": "Desafio do Gelo",
    "category": "Hot",
    "points": 10,
    "description": "Use uma pedra de gelo para percorrer e beijar o corpo um do outro, explorando as sensações de quente e frio.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-15-noite-de-fondue-no-quart",
    "name": "Noite de Fondue no Quarto",
    "category": "Hot",
    "points": 20,
    "description": "Prepare um fondue de queijo ou chocolate e comam na cama ou no chão do quarto, sem regras de etiqueta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-16-criar-uma-playlist-proib",
    "name": "Criar uma Playlist 'Proibida'",
    "category": "Hot",
    "points": 10,
    "description": "Juntos, criem uma playlist com as músicas mais sensuais que conhecem para servir de trilha sonora para os momentos a sós.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-17-massagem-nos-pes-que-sob",
    "name": "Massagem nos Pés... que Sobe",
    "category": "Hot",
    "points": 15,
    "description": "Comece com uma massagem relaxante nos pés e, lentamente, vá subindo e explorando o resto do corpo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-18-escolher-um-sex-toy-junt",
    "name": "Escolher um Sex Toy Juntos",
    "category": "Hot",
    "points": 15,
    "description": "Seja online ou numa loja física, divirtam-se escolhendo um novo brinquedo para apimentar a relação.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-19-um-dia-maos-livres",
    "name": "Um Dia 'Mãos Livres'",
    "category": "Hot",
    "points": 25,
    "description": "O desafio é passar o dia (ou algumas horas) se tocando e se beijando sem usar as mãos. Usem a criatividade e o corpo!",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-20-sussurros-de-fantasias",
    "name": "Sussurros de Fantasias",
    "category": "Hot",
    "points": 20,
    "description": "Apaguem as luzes e deitem-se de conchinha. Cada um sussurra no ouvido do outro uma fantasia secreta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-21-danca-intima-no-escuro",
    "name": "Dança Íntima no Escuro",
    "category": "Hot",
    "points": 15,
    "description": "Coloquem uma música lenta, apaguem as luzes e dancem bem abraçados no meio da sala, sentindo cada movimento.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-22-a-primeira-mensagem",
    "name": "A Primeira Mensagem",
    "category": "Hot",
    "points": 10,
    "description": "Encontrem e releiam as primeiras mensagens que trocaram. Tentem recriar a empolgação daquele início.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-23-vale-banho-de-espuma-sur",
    "name": "Vale-Banho de Espuma Surpresa",
    "category": "Hot",
    "points": 20,
    "description": "Prepare um banho de banheira (ou um chuveiro especial) com velas, música e espuma para quando seu amor chegar em casa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-24-kama-sutra-challenge",
    "name": "Kama Sutra Challenge",
    "category": "Hot",
    "points": 20,
    "description": "Abram o Kama Sutra (livro ou app) em uma página aleatória e se comprometam a tentar a posição que aparecer.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-25-jantar-tematico-sensual",
    "name": "Jantar Temático Sensual",
    "category": "Hot",
    "points": 25,
    "description": "Escolham um tema (árabe, japonês, etc) e preparem tudo: a comida, a música, a roupa. Comam no chão, com as mãos, e entrem no personagem.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-26-guerra-de-cocegas-com-re",
    "name": "Guerra de Cócegas (com rendição)",
    "category": "Hot",
    "points": 10,
    "description": "Comece uma guerra de cócegas. O 'perdedor' tem que se render e cumprir um desejo do 'vencedor'.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-27-beijo-de-3-minutos",
    "name": "Beijo de 3 Minutos",
    "category": "Hot",
    "points": 15,
    "description": "Coloque um cronômetro para 3 minutos. Durante esse tempo, vocês devem dar um beijo ininterrupto, explorando diferentes ritmos e intensidades.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-28-mapa-do-corpo",
    "name": "Mapa do Corpo",
    "category": "Hot",
    "points": 20,
    "description": "De olhos vendados, um deve 'mapear' o corpo do outro usando apenas os lábios e a ponta da língua.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-29-noite-de-jogos-de-tabule",
    "name": "Noite de Jogos de Tabuleiro Adulto",
    "category": "Hot",
    "points": 15,
    "description": "Comprem ou criem um jogo de tabuleiro com casas que tenham desafios, perguntas íntimas e recompensas picantes.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-30-um-elogio-por-hora",
    "name": "Um Elogio por Hora",
    "category": "Hot",
    "points": 10,
    "description": "Durante um dia, enviem a cada hora um elogio um para o outro, começando inocente e terminando mais ousado.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-31-adivinhe-a-palavra",
    "name": "Adivinhe a Palavra",
    "category": "Hot",
    "points": 10,
    "description": "Um escreve uma palavra (relacionada a desejo ou amor) nas costas do outro com o dedo. O outro tem que adivinhar.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-32-banho-de-piscina-ou-mar-",
    "name": "Banho de Piscina (ou Mar) à Noite",
    "category": "Hot",
    "points": 25,
    "description": "Se tiverem acesso, um mergulho noturno a sós pode ser extremamente excitante e libertador.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-33-concurso-de-gemidos",
    "name": "Concurso de Gemidos",
    "category": "Hot",
    "points": 15,
    "description": "Uma brincadeira boba e excitante: quem consegue fazer o gemido mais convincente ou criativo? A risada é garantida.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-34-assistir-ao-por-do-sol-c",
    "name": "Assistir ao Pôr do Sol com 'After Party'",
    "category": "Hot",
    "points": 20,
    "description": "Encontrem um lugar bonito para ver o pôr do sol. Assim que o sol sumir, comecem uma sessão de amassos intensa no carro ou em um lugar reservado.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-35-comando-por-um-dia",
    "name": "Comando por um Dia",
    "category": "Hot",
    "points": 25,
    "description": "Um dos dois tem o poder de dar 'ordens' e fazer pedidos ao longo do dia, e o outro deve obedecer. Troquem de papel no dia seguinte.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-36-catalogo-de-posicoes",
    "name": "Catálogo de Posições",
    "category": "Hot",
    "points": 15,
    "description": "Peguem um livro ou app de posições sexuais e cada um escolhe uma que nunca tentou para experimentarem na mesma noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-37-o-jogo-do-espelho",
    "name": "O Jogo do Espelho",
    "category": "Hot",
    "points": 15,
    "description": "Fiquem de frente um para o outro. Um faz um movimento sensual lento (tirar uma alça da blusa, passar a mão no corpo) e o outro deve imitar exatamente.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-38-amigo-secreto-de-lingeri",
    "name": "Amigo Secreto de Lingerie/Cueca",
    "category": "Hot",
    "points": 20,
    "description": "Cada um compra uma peça de roupa íntima para o outro e entrega de surpresa. A regra é usar a peça na mesma noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-39-spa-day-de-casal-em-casa",
    "name": "SPA Day de Casal em Casa",
    "category": "Hot",
    "points": 20,
    "description": "Preparem máscaras faciais, escalda-pés e se revezem fazendo esfoliação e hidratação um no outro. O foco é o cuidado e o toque.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-40-duelo-de-olhares",
    "name": "Duelo de olhares",
    "category": "Hot",
    "points": 10,
    "description": "Sentem-se um de frente para o outro e se olhem nos olhos sem desviar. O primeiro a rir ou desviar o olhar tem que dar um beijo onde o outro mandar.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-41-vale-troca-de-5-mensagen",
    "name": "Vale-Troca de 5 mensagens picantes",
    "category": "Hot",
    "points": 10,
    "description": "Durante o dia, enviem 5 mensagens mais ousadas um para o outro para esquentar o clima.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-42-noite-de-cinema-com-um-t",
    "name": "Noite de cinema... com um 'twist'",
    "category": "Hot",
    "points": 15,
    "description": "Escolham um filme, mas com uma regra: a cada cena de beijo, uma peça de roupa sai.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-43-jantar-a-luz-de-velas-no",
    "name": "Jantar à luz de velas no chão do quarto",
    "category": "Hot",
    "points": 20,
    "description": "Esqueçam a mesa. Preparem um cantinho aconchegante no chão do quarto para um jantar mais íntimo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-44-criar-um-drink-com-nomes",
    "name": "Criar um drink com nomes sugestivos",
    "category": "Hot",
    "points": 10,
    "description": "Misturem seus ingredientes favoritos e batizem o coquetel com um nome secreto e provocante.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-45-sessao-de-massagem-com-o",
    "name": "Sessão de massagem com óleos essenciais",
    "category": "Hot",
    "points": 15,
    "description": "Prepare o ambiente com música e pouca luz para uma massagem relaxante e sensual.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-46-batalha-de-verdade-ou-co",
    "name": "Batalha de 'verdade ou consequência' apimentado",
    "category": "Hot",
    "points": 10,
    "description": "Preparem perguntas e desafios mais ousados para uma versão adulta do jogo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-47-recriar-a-primeira-noite",
    "name": "Recriar a primeira noite juntos",
    "category": "Hot",
    "points": 25,
    "description": "Seja com a mesma comida, música ou roupas... tentem recriar a atmosfera da primeira vez.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-48-tomar-um-banho-de-banhei",
    "name": "Tomar um banho de banheira (ou de chuveiro) juntos",
    "category": "Hot",
    "points": 15,
    "description": "Um momento para relaxar, conversar e cuidar um do outro de forma mais íntima.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-49-mordidas-provocantes",
    "name": "Mordidas Provocantes",
    "category": "Hot",
    "points": 15,
    "description": "Explorem mordidas suaves pelo corpo do parceiro, descobrindo quais pontos provocam mais arrepios e gemidos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-50-desafio-da-respiracao-no",
    "name": "Desafio da Respiração no Ouvido",
    "category": "Hot",
    "points": 10,
    "description": "Sussurrem, soprem e respirem no ouvido um do outro enquanto se abraçam. O objetivo é provocar o máximo de arrepios.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-51-noite-de-roleplay-fantas",
    "name": "Noite de Roleplay Fantasioso",
    "category": "Hot",
    "points": 25,
    "description": "Escolham personagens (médico/paciente, professor/aluno, etc.) e interpretem uma cena com figurino e diálogos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-52-massagem-com-penas",
    "name": "Massagem com Penas",
    "category": "Hot",
    "points": 15,
    "description": "Usem penas macias para fazer cócegas e carícias pelo corpo todo, explorando a sensibilidade da pele.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-53-competicao-de-beijos-cri",
    "name": "Competição de Beijos Criativos",
    "category": "Hot",
    "points": 10,
    "description": "Criem diferentes tipos de beijos (beijo borboleta, beijo esquimó, beijo francês intenso) e votem no melhor.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-54-sessao-de-amarracao-sens",
    "name": "Sessão de Amarração Sensual",
    "category": "Hot",
    "points": 20,
    "description": "Usem lenços de seda ou cordas macias para explorar a sensação de estar no controle e de se entregar.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-55-confessionario-intimo",
    "name": "Confessionário Íntimo",
    "category": "Hot",
    "points": 15,
    "description": "Compartilhem as fantasias mais secretas que nunca contaram para ninguém, criando um espaço de total confiança.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-56-desafio-dos-30-segundos",
    "name": "Desafio dos 30 Segundos",
    "category": "Hot",
    "points": 10,
    "description": "Estabeleçam um timer de 30 segundos para provocar uma parte específica do corpo do parceiro da forma mais criativa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-57-banquete-sensual-na-cama",
    "name": "Banquete Sensual na Cama",
    "category": "Hot",
    "points": 20,
    "description": "Preparem frutas, chocolates e champagne para comer na cama, se alimentando mutuamente de forma provocante.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-58-jogo-da-temperatura",
    "name": "Jogo da Temperatura",
    "category": "Hot",
    "points": 15,
    "description": "Alternem entre bebidas geladas e quentes na boca antes de beijar diferentes partes do corpo do parceiro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-59-carta-de-amor-erotica",
    "name": "Carta de Amor Erótica",
    "category": "Hot",
    "points": 15,
    "description": "Escrevam cartas descrevendo em detalhes o que gostariam de fazer um com o outro, depois leiam em voz alta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-60-danca-do-ventre-sedutora",
    "name": "Dança do Ventre Sedutora",
    "category": "Hot",
    "points": 20,
    "description": "Um dos dois aprende movimentos básicos de dança do ventre e apresenta uma performance sensual para o outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-61-caca-palavras-picante",
    "name": "Caça-Palavras Picante",
    "category": "Hot",
    "points": 10,
    "description": "Criem um caça-palavras com termos sensuais e a cada palavra encontrada, cumpram uma ação correspondente.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-62-sessao-de-dirty-talk",
    "name": "Sessão de Dirty Talk",
    "category": "Hot",
    "points": 15,
    "description": "Pratiquem falar de forma provocante e sensual, sussurrando desejos e intenções um para o outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-63-desfile-de-lingerie-roup",
    "name": "Desfile de Lingerie/Roupa Íntima",
    "category": "Hot",
    "points": 20,
    "description": "Organizem um desfile privado onde cada um modela suas peças mais sensuais para o outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-64-massagem-tantrica-basica",
    "name": "Massagem Tântrica Básica",
    "category": "Hot",
    "points": 25,
    "description": "Pesquisem técnicas básicas de massagem tântrica e dediquem uma noite inteira para explorar essa prática.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-65-jogo-das-zonas-erogenas",
    "name": "Jogo das Zonas Erógenas",
    "category": "Hot",
    "points": 20,
    "description": "Façam um mapa das zonas erógenas um do outro, testando diferentes toques e pressões em cada área.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-66-videoconferencia-provoca",
    "name": "Videoconferência Provocante",
    "category": "Hot",
    "points": 15,
    "description": "Mesmo estando em casa, façam uma videochamada de quartos separados para se provocarem virtualmente.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-67-competicao-de-striptease",
    "name": "Competição de Striptease",
    "category": "Hot",
    "points": 20,
    "description": "Cada um prepara uma performance de striptease e depois votem quem foi mais criativo e sensual.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-68-trilha-de-beijos-pelo-co",
    "name": "Trilha de Beijos pelo Corpo",
    "category": "Hot",
    "points": 15,
    "description": "Criem um caminho de beijos começando pelos pés e subindo lentamente até chegarem aos lábios.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-69-sessao-de-fotos-sensuais",
    "name": "Sessão de Fotos Sensuais Polaroid",
    "category": "Hot",
    "points": 20,
    "description": "Usem uma câmera polaroid para criar fotos íntimas instantâneas que vocês podem guardar como recordação.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-70-despertar-com-caricias",
    "name": "Despertar com Carícias",
    "category": "Hot",
    "points": 15,
    "description": "Quem acordar primeiro deve despertar o parceiro apenas com carícias suaves e beijos pelo corpo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-71-banho-de-lua-com-provoca",
    "name": "Banho de Lua com Provocações",
    "category": "Hot",
    "points": 25,
    "description": "Numa noite de lua cheia, encontrem um local reservado ao ar livre para um momento íntimo sob as estrelas.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-72-escrita-no-corpo-com-gel",
    "name": "Escrita no Corpo com Gelo",
    "category": "Hot",
    "points": 15,
    "description": "Usem cubos de gelo para 'escrever' palavras de amor e desejo na pele um do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-73-jogo-da-seducao-progress",
    "name": "Jogo da Sedução Progressiva",
    "category": "Hot",
    "points": 20,
    "description": "Estabeleçam níveis de sedução (olhares, sussurros, toques) e progridam lentamente ao longo da noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-normal-1-maratona-de-um-filme-que",
    "name": "Maratona de um filme que um indicou ao outro",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Cada um escolhe um filme que o outro nunca viu. Prepare a pipoca e abrace o desconhecido!",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-2-recriar-uma-foto-antiga-",
    "name": "Recriar uma foto antiga do casal",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Procurem uma foto do início do namoro e tentem recriá-la com o máximo de detalhes possível.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-3-passeio-sem-destino",
    "name": "Passeio sem destino",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Entrem no carro ou peguem um ônibus e simplesmente explorem uma área da cidade que vocês não conhecem bem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-4-noite-de-detox-digital",
    "name": "Noite de 'detox digital'",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Desliguem os celulares e computadores por pelo menos 2 horas e conversem, joguem ou apenas curtam o silêncio.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-5-montar-uma-playlist-cola",
    "name": "Montar uma playlist colaborativa",
    "category": "Música",
    "points": 5,
    "description": "Criem uma playlist no Spotify ou YouTube com músicas que marcaram o relacionamento de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-6-cozinhar-o-prato-favorit",
    "name": "Cozinhar o prato favorito do outro",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Uma pessoa cozinha o prato predileto da outra, como um gesto de carinho e atenção.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-7-planejar-uma-viagem-dos-",
    "name": "Planejar uma 'viagem dos sonhos' no papel",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Mesmo que não seja para agora, pesquisem um destino, montem um roteiro e sonhem juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-8-escrever-3-coisas-que-ad",
    "name": "Escrever 3 coisas que admira no outro",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Cada um escreve em um papel 3 qualidades que mais admira no parceiro e depois compartilham.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-9-manha-de-cafe-da-manha-n",
    "name": "Manhã de café da manhã na cama",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Quem acordar primeiro prepara uma bandeja de café da manhã surpresa para o outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-10-aula-online-de-algo-novo",
    "name": "Aula online de algo novo",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam juntos uma aula online no YouTube, seja de dança, yoga, desenho ou qualquer outra habilidade.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-101-jogo-de-tabuleiro-em-dup",
    "name": "Jogo de tabuleiro em dupla",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escolham um jogo de tabuleiro ou cartas e joguem por pelo menos 40 minutos, valendo o chocolate da vitória.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-102-quebra-cabeca-colaborati",
    "name": "Quebra-cabeça colaborativo",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Montem um quebra-cabeça juntos, dividindo as peças de cada lado da mesa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-103-aula-de-danca-online",
    "name": "Aula de dança online",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Sigam uma aula de dança no YouTube e tentem acompanhar os passos mesmo sem ritmo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-104-noite-de-karaoke",
    "name": "Noite de karaokê",
    "category": "Música",
    "points": 12,
    "description": "Cantem suas músicas favoritas no karaokê e riam dos erros juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-105-concurso-de-pior-melhor-",
    "name": "Concurso de pior/ melhor comida",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Cada um prepara uma receita surpresa e o outro avalia com nota de 0 a 10.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-106-degustacao-as-cegas",
    "name": "Degustação às cegas",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Vendados, provem 5 alimentos e tentem adivinhar quais são.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-107-picnic-no-parque",
    "name": "Picnic no parque",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Preparem uma cesta e façam um piquenique ao ar livre, longe das telas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-108-caminhada-de-domingo",
    "name": "Caminhada de domingo",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Façam uma caminhada em um parque ou bairro novo e conversem sem pressa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-109-noite-de-filmes-com-tema",
    "name": "Noite de filmes com tema",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Escolham um tema (terror, comédia, anos 80) e assistam 2 filmes seguindo-o.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-110-sessao-dupla-de-series",
    "name": "Sessão dupla de séries",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Maratonem 3 episódios seguidos da série preferida do casal, com direito a pipoca.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-111-mercado-de-misterios",
    "name": "Mercado de mistérios",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Cada um compra 3 itens secretos no mercado e o outro precisa criar um lanche com eles.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-112-playlist-dos-10-anos",
    "name": "Playlist dos 10 anos",
    "category": "Música",
    "points": 10,
    "description": "Montem uma playlist com 10 músicas que contam a história de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-113-carta-para-o-futuro",
    "name": "Carta para o futuro",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escrevam cartas um para o outro para abrir daqui a 1 ano.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-114-desenho-retrato-do-outro",
    "name": "Desenho retrato do outro",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Desenhem um retrato um do outro e comparem (se preparem para rir).",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-115-cozinhar-receita-de-fami",
    "name": "Cozinhar receita de família",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Peguem uma receita que marcou a infância de um dos dois e tentem recriá-la.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-116-noite-de-jogos-de-celula",
    "name": "Noite de jogos de celular",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Duelos em jogos de celular em modo versus, valendo um favor do perdedor.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-117-banho-de-mar-ou-piscina",
    "name": "Banho de mar ou piscina",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Aproveitem um bate-papo e mergulho em mar, piscina ou até mesmo banheira.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-118-observar-o-movimento-da-",
    "name": "Observar o movimento da cidade",
    "category": "Viagens & Passeios",
    "points": 8,
    "description": "Sentem num café ou banco e observem o movimento, inventando histórias sobre as pessoas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-119-hora-do-cha-e-conversa",
    "name": "Hora do chá e conversa",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem um chá ou café especial e conversem sobre coisas que nunca falaram.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-120-visita-a-museu-ou-galeri",
    "name": "Visita a museu ou galeria",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Visitem um museu, galeria ou exposição e escolham juntos a obra favorita.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-121-gincana-caseira",
    "name": "Gincana caseira",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Crie uma gincana com 5 mini-desafios dentro de casa e cumpram juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-122-hora-do-livro-em-dupla",
    "name": "Hora do livro em dupla",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Leiam em voz alta um trecho de um livro que um escolheu para o outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-123-dia-de-acampamento-na-sa",
    "name": "Dia de acampamento na sala",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Montem uma barraca ou fortaleza de cobertores, com lanternas e histórias.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-124-cozinhar-sob-pressao",
    "name": "Cozinhar sob pressão",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Cada um tem 20 minutos para preparar um prato com ingredientes sorteados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-125-quiz-um-sobre-o-outro",
    "name": "Quiz um sobre o outro",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Respondam perguntas sobre a vida do parceiro e vejam quem conhece mais o outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-126-plantar-algo-juntos",
    "name": "Plantar algo juntos",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Comprem uma planta ou semente e cuidem dela juntos durante as semanas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-127-noite-de-comedia-stand-u",
    "name": "Noite de comédia stand-up",
    "category": "Filmes & Séries",
    "points": 8,
    "description": "Assistam a um especial de stand-up e listem as piadas que mais riram.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-128-viagem-no-tempo-da-memor",
    "name": "Viagem no tempo da memória",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Revirem fotos e mensagens antigas e contem a história por trás de cada uma.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-129-aula-de-barista-em-casa",
    "name": "Aula de barista em casa",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Tentem fazer leite cremoso e latte art com a cafeteira que tiverem em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-130-desafio-de-fotografia",
    "name": "Desafio de fotografia",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Saiam por 30 minutos e fotografe 10 coisas que representam o amor de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-131-noite-de-bordar-artesana",
    "name": "Noite de bordar/artesanato",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Façam um artesanato simples juntos (pulseira, bordado, origami) e presenteiem-se.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-132-karaoke-do-cafe-da-manha",
    "name": "Karaokê do café da manhã",
    "category": "Música",
    "points": 8,
    "description": "Cantem músicas fofas enquanto preparam o café da manhã juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-133-montar-roteiro-de-bairro",
    "name": "Montar roteiro de bairro",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Escolham 3 lugares do seu bairro que nunca visitaram e visitem nesse dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-134-dia-de-sim-para-tudo",
    "name": "Dia de 'sim' para tudo",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Por 3 horas, aceitem as sugestões um do outro sem reclamar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-135-noite-de-ciencia-em-casa",
    "name": "Noite de ciência em casa",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Façam um experimento simples (vulcão de bicarbonato, slime) e divirtam-se.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-136-comparar-listas-de-sonho",
    "name": "Comparar listas de sonhos",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Cada um escreve 10 sonhos e depois encontram os que têm em comum.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-137-trocar-de-papel-por-um-d",
    "name": "Trocar de papel por um dia",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Passem algumas horas cumprindo as tarefas do outro (café, arrumação, escolhas).",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-138-noite-de-jazz-e-vinho",
    "name": "Noite de jazz e vinho",
    "category": "Música",
    "points": 12,
    "description": "Preparem um ambiente com jazz, vinho ou suco e conversem na penumbra.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-139-conte-me-uma-historia",
    "name": "Conte-me uma história",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Cada um inventa uma história em 5 minutos e o outro desenha o que imaginou.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-140-desafio-do-sorriso",
    "name": "Desafio do sorriso",
    "category": "Hobbies & Outros",
    "points": 6,
    "description": "Vejam quem consegue fazer o outro rir primeiro; o mais sério perde um mimo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-141-mapa-dos-momentos-felize",
    "name": "Mapa dos momentos felizes",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Marquem num mapa (ou desenho) os lugares onde tiveram momentos especiais.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-142-noite-de-estrelas-no-tet",
    "name": "Noite de estrelas no teto",
    "category": "Viagens & Passeios",
    "points": 8,
    "description": "Coloquem um projetor de estrelas ou desliguem as luzes e conversem deitados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-143-feira-livre-do-domingo",
    "name": "Feira livre do domingo",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Vão à feira, escolham frutas exóticas e provem juntas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-144-aprender-uma-palavra-nov",
    "name": "Aprender uma palavra nova por dia",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Escolham uma palavra nova em outro idioma e tentem usá-la no dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-145-desafio-do-desenho-de-me",
    "name": "Desafio do desenho de memória",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Desenhem um lugar especial de memória e comparem o que cada um lembrou.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-146-montar-o-quebra-gelo-de-",
    "name": "Montar o quebra-gelo de perguntas",
    "category": "Hobbies & Outros",
    "points": 6,
    "description": "Usem cartas de perguntas profundas e respondam honestamente.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-147-noite-de-pega-na-mentira",
    "name": "Noite de 'pega na mentira'",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Contem 3 histórias, uma delas falsa, e o outro precisa descobrir qual.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-148-preparar-marmita-do-outr",
    "name": "Preparar marmita do outro",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Preparem a marmita do trabalho ou estudos um para o outro, com bilhetinho.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-149-desenhar-o-dia-do-outro",
    "name": "Desenhar o dia do outro",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Descrevam como foi o dia do outro e ele corrige os detalhes errados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-150-lista-de-5-lugares-para-",
    "name": "Lista de 5 lugares para viajar",
    "category": "Viagens & Passeios",
    "points": 8,
    "description": "Cada um elege 5 lugares no mundo e juntos escolhem o próximo destino.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-151-hora-do-jogo-de-pergunta",
    "name": "Hora do jogo de perguntas do app",
    "category": "Hobbies & Outros",
    "points": 6,
    "description": "Respondam juntos os desafios de perguntas do app e comparem respostas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-152-noite-de-massagem-em-cas",
    "name": "Noite de massagem em casa",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Preparem óleo e música e façam uma massagem relaxante um no outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-153-fazer-yoga-juntos",
    "name": "Fazer yoga juntos",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Sigam uma aula de yoga para casais de 20 minutos no YouTube.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-154-recriar-prato-de-restaur",
    "name": "Recriar prato de restaurante",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Tentem recriar em casa o prato favorito de um restaurante que costumam ir.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-155-noite-de-narrativa-de-vi",
    "name": "Noite de narrativa de viagem",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Contem as piores e melhores viagens de cada um e riam dos perrengues.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-156-desafio-do-abraco-de-30s",
    "name": "Desafio do abraço de 30s",
    "category": "Hobbies & Outros",
    "points": 6,
    "description": "Abracem por 30 segundos em silêncio e depois conversem sobre como se sentiram.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-157-maratona-de-curtas",
    "name": "Maratona de curtas",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Assistam 3 curtas-metragens surpreendentes e elejam o melhor.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-158-dia-sem-reclamar",
    "name": "Dia sem reclamar",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Cada vez que um reclamar, deposita um valor no pote do próximo encontro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-159-montar-album-fisico",
    "name": "Montar álbum físico",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Imprimam fotos e montem um álbum físico ou scrapbook com legendas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-160-hora-do-conto-antes-de-d",
    "name": "Hora do conto antes de dormir",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Contem uma história infantil um para o outro na cama, como antigamente.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-161-desafio-do-restaurante-n",
    "name": "Desafio do restaurante novo",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Vão a um restaurante que nenhum dos dois conhece e peçam algo fora do comum.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-162-aula-de-culinaria-de-coz",
    "name": "Aula de culinária de cozinha do mundo",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Escolham um país e preparem juntos um prato típico de lá",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-hot-201-massagem-com-oleo-aromat",
    "name": "Massagem com óleo aromático",
    "category": "Hot",
    "points": 20,
    "description": "Com óleo e luz baixa, façam uma massagem sensual de corpo inteiro um no outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-202-danca-lenta-no-escuro",
    "name": "Dança lenta no escuro",
    "category": "Hot",
    "points": 15,
    "description": "Coloquem uma música lenta e dancem colados no escuro, sem pressa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-203-banho-a-dois",
    "name": "Banho a dois",
    "category": "Hot",
    "points": 20,
    "description": "Compartilhem um banho demorado com espuma e muita intimidade.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-204-jogo-de-verdade-ou-desaf",
    "name": "Jogo de verdade ou desafio picante",
    "category": "Hot",
    "points": 25,
    "description": "Usem um dado ou cartas com perguntas e desafios sensuais para ambos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-205-beijo-que-marca-a-semana",
    "name": "Beijo que marca a semana",
    "category": "Hot",
    "points": 15,
    "description": "Dediquem um beijo longo e intenso, como se fosse a despedida de uma viagem.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-206-sessao-de-caricias-cegas",
    "name": "Sessão de caricias cegas",
    "category": "Hot",
    "points": 20,
    "description": "Vendados, explorem o corpo um do outro apenas com o toque e adivinhem a região.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-207-cafe-da-manha-sensual",
    "name": "Café da manhã sensual",
    "category": "Hot",
    "points": 18,
    "description": "Preparem uma bandeja de frutas e se alimentem um ao outro na cama.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-208-noite-de-fantasias",
    "name": "Noite de fantasias",
    "category": "Hot",
    "points": 25,
    "description": "Façam uma escolha de fantasia ou lingerie para surpreender na hora H.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-209-pijama-party-picante",
    "name": "Pijama party picante",
    "category": "Hot",
    "points": 15,
    "description": "Combinem de só usar camisas ou pijamas sensuais e disputem quem provoca mais.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-210-brincadeira-de-congelar",
    "name": "Brincadeira de congelar",
    "category": "Hot",
    "points": 20,
    "description": "Toque e beije livremente, mas congele quando a música parar e reveze quem lidera.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-211-diario-da-intimidade",
    "name": "Diário da intimidade",
    "category": "Hot",
    "points": 12,
    "description": "Cada um escreve 3 desejos em papel e trocam para descobrir segredos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-212-chuva-de-elogios-nus",
    "name": "Chuva de elogios nus",
    "category": "Hot",
    "points": 15,
    "description": "Sem roupa, elogiem uma parte do corpo do outro por vez, sem repetir.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-213-desafio-do-espelho",
    "name": "Desafio do espelho",
    "category": "Hot",
    "points": 20,
    "description": "Na frente do espelho, dancem e se admirem como casal.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-214-sombra-chinesa-apaixonad",
    "name": "Sombra chinesa apaixonada",
    "category": "Hot",
    "points": 12,
    "description": "Com uma luz, criem sombras sensuais no corpo um do outro nas paredes.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-215-massagem-que-progressiva",
    "name": "Massagem que progressiva",
    "category": "Hot",
    "points": 22,
    "description": "Comecem pela cabeça e desçam devagar, aumentando a intensidade a cada parada.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-216-brincadeira-do-obstaculo",
    "name": "Brincadeira do obstáculo",
    "category": "Hot",
    "points": 18,
    "description": "Vendado, o parceiro caminha até você guiado apenas por beijos e toques.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-217-hora-de-perder-a-vergonh",
    "name": "Hora de perder a vergonha",
    "category": "Hot",
    "points": 20,
    "description": "Cada um declara 1 fetiche leve e o outro decide se topa experimentar hoje.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-218-noite-de-velas-e-petalas",
    "name": "Noite de velas e petalas",
    "category": "Hot",
    "points": 15,
    "description": "Preparem o quarto com velas e pétalas e façam um momento de amor lento.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-219-desafio-do-nao-pode-toca",
    "name": "Desafio do 'não pode tocar'",
    "category": "Hot",
    "points": 25,
    "description": "Um provoca com elogios e proximidade enquanto o outro resiste ao toque.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-220-bilhetes-sensuais-escond",
    "name": "Bilhetes sensuais escondidos",
    "category": "Hot",
    "points": 18,
    "description": "Escondam bilhetes sensuais na casa e dêem dicas para encontrá-los no dia.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-221-spa-do-casal-em-casa",
    "name": "Spa do casal em casa",
    "category": "Hot",
    "points": 20,
    "description": "Façam esfoliação, máscara e hidratação um no outro, terminando em carinho.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-222-desafio-da-roupa-de-baix",
    "name": "Desafio da roupa de baixo surpresa",
    "category": "Hot",
    "points": 18,
    "description": "Escolham uma peça diferente do usual e mostrem apenas no momento certo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-223-video-ligacao-picante",
    "name": "Vídeo-ligação picante",
    "category": "Hot",
    "points": 22,
    "description": "Se estiverem longe, façam uma chamada de vídeo íntima e combinada.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-224-noite-de-beijo-com-music",
    "name": "Noite de beijo com música",
    "category": "Hot",
    "points": 12,
    "description": "A cada música, mudem o ritmo e o tipo de beijo, do romântico ao intenso.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-225-jogo-dos-sentidos-vendad",
    "name": "Jogo dos sentidos vendado",
    "category": "Hot",
    "points": 25,
    "description": "Vendado, adivinhe qual parte do corpo o parceiro está tocando ou beijando.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-226-amor-sob-as-estrelas",
    "name": "Amor sob as estrelas",
    "category": "Hot",
    "points": 20,
    "description": "Aproveitem uma noite ao ar livre, num terraço ou varanda, com momento íntimo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-227-banho-juntos-com-musica",
    "name": "Banho juntos com música",
    "category": "Hot",
    "points": 18,
    "description": "Coloquem uma playlist e fiquem no chuveiro prolongando o momento a dois.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-228-massagem-nos-pes-carinho",
    "name": "Massagem nos pés + carinho",
    "category": "Hot",
    "points": 12,
    "description": "Façam uma massagem demorada nos pés um do outro como aquecimento.",
    "flavor": "hot",
    "active": true
  }
];

export const CHALLENGE_CATALOG = [
  {
    "id": "week-msg-5",
    "title": "5 mensagens carinhosas",
    "description": "Troquem pelo menos 5 mensagens especiais de carinho durante a semana",
    "points": 10,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-date-night",
    "title": "1 encontro especial",
    "description": "Organizem pelo menos 1 momento romântico juntos durante a semana",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-surprise",
    "title": "Uma surpresa carinhosa",
    "description": "Cada um deve fazer pelo menos 1 pequena surpresa para o outro",
    "points": 12,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-activities",
    "title": "3 atividades juntos",
    "description": "Realizem pelo menos 3 atividades do app juntos durante a semana",
    "points": 18,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-appreciation",
    "title": "3 dias de gratidão",
    "description": "Em 3 dias da semana, digam uma coisa que amam no parceiro",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-photos",
    "title": "3 fotos da semana",
    "description": "Tirem pelo menos 3 fotos juntos durante a semana",
    "points": 8,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-planning",
    "title": "Planos para próxima semana",
    "description": "Sentem juntos e planejem algo especial para a próxima semana",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-cooking",
    "title": "Cozinhar juntos 1 vez",
    "description": "Preparem pelo menos 1 refeição juntos durante a semana",
    "points": 15,
    "type": "together",
    "active": true
  },
  {
    "id": "week-compliments",
    "title": "2 elogios sinceros",
    "description": "Façam pelo menos 2 elogios genuínos um para o outro durante a semana",
    "points": 8,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-quality-time",
    "title": "30 minutos sem celular",
    "description": "Passem pelo menos 30 minutos juntos sem usar o celular",
    "points": 10,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-touch",
    "title": "Mais carinho físico",
    "description": "Aumentem o carinho físico: abraços, beijos e carícias ao longo da semana",
    "points": 12,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-laugh",
    "title": "Momentos de risada",
    "description": "Assistam algo engraçado ou contem piadas para se divertirem juntos",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-walk",
    "title": "1 caminhada juntos",
    "description": "Façam pelo menos 1 caminhada ou passeio ao ar livre durante a semana",
    "points": 10,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-movie",
    "title": "Assistir algo juntos",
    "description": "Escolham um filme, série ou vídeo para assistirem juntos",
    "points": 8,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-music",
    "title": "Playlist do casal",
    "description": "Criem uma playlist com 5 músicas que representam vocês",
    "points": 10,
    "type": "music",
    "active": true
  },
  {
    "id": "week-massage",
    "title": "Massagem relaxante",
    "description": "Façam uma massagem relaxante um no outro durante a semana",
    "points": 15,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-morning",
    "title": "Café da manhã especial",
    "description": "Preparem um café da manhã especial juntos em um dia da semana",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-dreams",
    "title": "Conversa sobre sonhos",
    "description": "Conversem sobre seus sonhos e planos futuros como casal",
    "points": 15,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-game",
    "title": "Jogo para dois",
    "description": "Joguem um jogo de tabuleiro, cartas ou videogame juntos",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-dance",
    "title": "Dança em casa",
    "description": "Dancem juntos na sala de casa, mesmo que por 5 minutos",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-memory",
    "title": "Memória especial",
    "description": "Compartilhem uma memória especial de quando se conheceram",
    "points": 10,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-learning",
    "title": "Aprender algo novo",
    "description": "Aprendam algo novo juntos: receita, habilidade ou hobby",
    "points": 15,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-gratitude",
    "title": "Lista de gratidão",
    "description": "Façam uma lista de 3 coisas pelas quais são gratos no relacionamento",
    "points": 12,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-adventure",
    "title": "Mini aventura",
    "description": "Façam uma pequena aventura: novo restaurante, lugar ou atividade",
    "points": 18,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-phone-free",
    "title": "Jantar sem celular",
    "description": "Tenham pelo menos 1 refeição juntos sem usar o celular",
    "points": 10,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-surprise-note",
    "title": "Bilhetinho carinhoso",
    "description": "Deixem pelo menos 1 bilhetinho carinhoso para o outro encontrar",
    "points": 8,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-workout",
    "title": "Exercício juntos",
    "description": "Façam algum exercício físico juntos: caminhada, dança, alongamento",
    "points": 12,
    "type": "health",
    "active": true
  },
  {
    "id": "week-stargazing",
    "title": "Observar as estrelas",
    "description": "Passem alguns minutos observando o céu noturno juntos",
    "points": 10,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-breakfast-bed",
    "title": "Café na cama",
    "description": "Um prepare café da manhã na cama para o outro",
    "points": 15,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-pet-names",
    "title": "Novos apelidos carinhosos",
    "description": "Criem novos apelidos carinhosos um para o outro",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-plan-weekend",
    "title": "Planejar fim de semana",
    "description": "Planejem juntos como querem passar o próximo fim de semana",
    "points": 10,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-meditation",
    "title": "5 minutos de relaxamento",
    "description": "Façam 5 minutos de respiração profunda ou meditação juntos",
    "points": 10,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-video-call",
    "title": "Chamada de vídeo especial",
    "description": "Se estiverem distantes, façam uma chamada de vídeo romântica",
    "points": 12,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-handwritten",
    "title": "Carta manuscrita",
    "description": "Escrevam uma pequena carta de próprio punho um para o outro",
    "points": 15,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-favorite-things",
    "title": "Coisas favoritas",
    "description": "Compartilhem 3 coisas favoritas de cada um que o outro ainda não sabe",
    "points": 10,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-sunset",
    "title": "Assistir pôr do sol",
    "description": "Assistam ao pôr do sol juntos, mesmo que seja da janela",
    "points": 8,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-compliment-public",
    "title": "Elogio público",
    "description": "Façam um elogio público um ao outro nas redes sociais",
    "points": 12,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-bucket-list",
    "title": "Lista de desejos",
    "description": "Criem uma lista de 5 coisas que querem fazer juntos este ano",
    "points": 15,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-random-kiss",
    "title": "Beijo surpresa",
    "description": "Deem pelo menos 3 beijos surpresa um no outro durante a semana",
    "points": 8,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-photo-album",
    "title": "Álbum de memórias",
    "description": "Olhem fotos antigas juntos e relembrem momentos especiais",
    "points": 12,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-future-talk",
    "title": "Conversa sobre o futuro",
    "description": "Conversem sobre onde se veem como casal daqui a 5 anos",
    "points": 18,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-silly-dance",
    "title": "Dança boba",
    "description": "Façam uma dança boba e engraçada juntos para se divertirem",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-love-language",
    "title": "Linguagem do amor",
    "description": "Descubram e pratiquem a linguagem do amor preferida do parceiro",
    "points": 15,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-no-tv",
    "title": "Noite sem TV",
    "description": "Passem uma noite juntos sem assistir TV, só conversando",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-favorite-meal",
    "title": "Refeição favorita",
    "description": "Preparem a refeição favorita um do outro durante a semana",
    "points": 15,
    "type": "together",
    "active": true
  },
  {
    "id": "week-vision-board",
    "title": "Quadro de sonhos",
    "description": "Criem um quadro visual com seus sonhos e objetivos como casal",
    "points": 20,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-thank-you",
    "title": "3 agradecimentos",
    "description": "Agradeçam especificamente por 3 coisas que o parceiro fez na semana",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-childhood",
    "title": "Histórias da infância",
    "description": "Compartilhem uma história engraçada ou marcante da infância",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-goals",
    "title": "Metas pessoais",
    "description": "Conversem sobre suas metas pessoais e como podem se apoiar",
    "points": 15,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-creative",
    "title": "Projeto criativo",
    "description": "Façam algo criativo juntos: desenho, artesanato, decoração",
    "points": 18,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-local-explore",
    "title": "Explorar o bairro",
    "description": "Explorem algo novo no seu bairro ou cidade natal",
    "points": 15,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-week-gratitude-5-0",
    "title": "5 agradecimentos por dia",
    "description": "Agradecer em voz alta 5 coisas do parceiro em 3 dias da semana",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-week-shared-playlist-1",
    "title": "Playlist do casal em dupla",
    "description": "Cada um adiciona 5 músicas que dedica ao outro na mesma playlist",
    "points": 10,
    "type": "music",
    "active": true
  },
  {
    "id": "week-week-no-sugar-2",
    "title": "Sem açúcar por 3 dias",
    "description": "Desafiem-se a ficar 3 dias sem açúcar e apoiem um ao outro",
    "points": 12,
    "type": "health",
    "active": true
  },
  {
    "id": "week-week-hydration-3",
    "title": "Hidratação em dupla",
    "description": "Durante 5 dias, lembrem um ao outro de beber 2L de água",
    "points": 8,
    "type": "health",
    "active": true
  },
  {
    "id": "week-week-books-4",
    "title": "Ler 10 páginas juntos",
    "description": "Leiam 10 páginas do mesmo livro em voz alta em 2 dias",
    "points": 8,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-early-5",
    "title": "Acordar cedo juntos",
    "description": "Acordem e vejam o nascer do sol ou tomem café na varanda uma vez",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-photo-word-6",
    "title": "Foto com uma palavra",
    "description": "Tirem uma foto juntos segurando um papel com a palavra que define a semana",
    "points": 8,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-week-favorite-song-7",
    "title": "Revelar a música favorita",
    "description": "Cada um mostra a música favorita e explica por que ela é especial",
    "points": 6,
    "type": "music",
    "active": true
  },
  {
    "id": "week-week-couple-quiz-8",
    "title": "Quiz do casal",
    "description": "Respondam 10 perguntas um sobre o outro e acertem ao menos 7",
    "points": 12,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-laugh-9",
    "title": "Fazer rir 1 vez por dia",
    "description": "Em 5 dias, façam o outro rir de verdade ao menos uma vez",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-handwritten-10",
    "title": "Carta manuscrita na semana",
    "description": "Escrevam uma carta manuscrita e leiam juntos no fim da semana",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-coffee-date-11",
    "title": "Encontro de café em casa",
    "description": "Preparem um café especial e conversem sem telas por 1 hora",
    "points": 10,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-5-kisses-12",
    "title": "5 beijos por dia",
    "description": "Em 5 dias, troquem pelo menos 5 beijos por dia",
    "points": 10,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-hug-30-13",
    "title": "Abraço de 30 segundos",
    "description": "Em 3 dias, deem um abraço de pelo menos 30 segundos",
    "points": 6,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-dinner-candle-14",
    "title": "Jantar à luz de velas",
    "description": "Um jantar à luz de velas em casa, sem distrações",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-new-hobby-15",
    "title": "Experimentar hobby novo",
    "description": "Escolham um hobby novo e comecem juntos nesta semana",
    "points": 15,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-walk-1h-16",
    "title": "Caminhada de 1 hora",
    "description": "Uma caminhada de pelo menos 1 hora conversando sobre o futuro",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-week-phone-free-17",
    "title": "2h sem celular em dupla",
    "description": "Passem 2 horas juntos sem celular, TV ou computador",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-compliment-family-18",
    "title": "Elogiar na frente dos outros",
    "description": "Elogiem o outro na frente de amigos ou família",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-week-plan-trip-19",
    "title": "Planejar próxima viagem",
    "description": "Montem juntos o roteiro completo da próxima viagem do casal",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-week-stars-20",
    "title": "Noite de observação",
    "description": "Observem as estrelas e deem nome a uma estrela especial do casal",
    "points": 8,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-play-games-21",
    "title": "Noite de jogos em dupla",
    "description": "Joguem 3 jogos diferentes e façam um combinado para o vencedor",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-dance-1-22",
    "title": "Dançar 1 música por dia",
    "description": "Em 4 dias, dancem ao menos uma música juntos",
    "points": 12,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-memory-map-23",
    "title": "Mapa de memórias",
    "description": "Listem os 5 momentos mais importantes da relação",
    "points": 15,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-week-gift-mini-24",
    "title": "Presente de baixo custo",
    "description": "Cada um dá um presente criativo e de baixo custo até o fim da semana",
    "points": 15,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-week-chef-25",
    "title": "Noite do chef em dupla",
    "description": "Preparem juntos um jantar de 3 pratos (entrada, principal, sobremesa)",
    "points": 20,
    "type": "together",
    "active": true
  },
  {
    "id": "week-week-brunch-26",
    "title": "Brunch de fim de semana",
    "description": "Preparem um brunch caprichado no sábado ou domingo",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-week-redecorate-27",
    "title": "Reorganizar um cômodo",
    "description": "Redeecorem ou reorganizem juntos um canto da casa",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-week-letters-future-28",
    "title": "Cartas para o futuro",
    "description": "Escrevam cartas para abrir daqui a 1 ano",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-water-fight-29",
    "title": "Guerra de água ou balão",
    "description": "Uma guerra de água ou bexigas para extravasar e rir juntos",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-sunrise-30",
    "title": "Ver o nascer do sol",
    "description": "Acordem cedo para ver o nascer do sol juntos",
    "points": 12,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-mini-date-31",
    "title": "3 mini-encontros",
    "description": "Façam 3 encontros rápidos e criativos ao longo da semana",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-thanks-letter-32",
    "title": "Carta de agradecimento",
    "description": "Cada um escreve o que agradece ao outro nos últimos meses",
    "points": 12,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-week-couple-money-33",
    "title": "Planejar poupança do casal",
    "description": "Definam juntos uma meta financeira e um plano simples",
    "points": 10,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-week-sport-34",
    "title": "Atividade física em dupla",
    "description": "Façam 2 atividades físicas juntos (corrida, bike, yoga, academia)",
    "points": 15,
    "type": "health",
    "active": true
  },
  {
    "id": "week-week-sleep-early-35",
    "title": "Dormir cedo em dupla",
    "description": "Em 3 dias, desliguem tudo e durmam mais cedo juntos",
    "points": 8,
    "type": "health",
    "active": true
  },
  {
    "id": "week-week-no-tv-day-36",
    "title": "Dia sem TV",
    "description": "Um dia inteiro sem TV nem streaming, só interação",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-think-aloud-37",
    "title": "Compartilhar um segredo",
    "description": "Cada um conta algo que nunca contou e recebe acolhimento",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-slow-kiss-38",
    "title": "Beijo lento de 1 minuto",
    "description": "Um beijo contínuo de pelo menos 1 minuto, focado só no momento",
    "points": 8,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-hug-tree-39",
    "title": "Abraço de árvore",
    "description": "Finja a pose de abraçar uma árvore e riam juntos da foto",
    "points": 6,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-week-music-album-40",
    "title": "Fazer um 'álbum' musical",
    "description": "Montem uma playlist dessa semana e deem um nome a ela",
    "points": 8,
    "type": "music",
    "active": true
  },
  {
    "id": "week-week-neighbor-tour-41",
    "title": "Explorar o próprio bairro",
    "description": "Descubram 3 lugares do bairro que nunca visitaram",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-week-future-letter-42",
    "title": "Escrever o futuro juntos",
    "description": "Escrevam como imaginam a vida juntos daqui a 5 anos",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-week-kiss-o-clock-43",
    "title": "Beijo a cada hora",
    "description": "Em um dia, troquem um beijo a cada hora em que se verem",
    "points": 12,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-week-question-deck-44",
    "title": "Baralho de perguntas",
    "description": "Respondam 15 perguntas profundas de um baralho de conversa",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-week-price-dinner-45",
    "title": "Jantar de 'premio'",
    "description": "O parceiro que vencer a disputa da semana escolhe o próximo date",
    "points": 15,
    "type": "surprise",
    "active": true
  }
];
