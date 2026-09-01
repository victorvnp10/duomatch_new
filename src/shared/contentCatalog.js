// Catalogo central de conteudo (atividades e desafios).
// FONTE DE SEED: este modulo e usado para popular as colecoes raiz do
// Firestore (contentActivities / contentChallenges). O repositorio (ver
// infrastructure/firebase/repositories/ContentRepository.js) faz "upsert":
// grava no banco os itens que ainda nao existem (por id) e o app LE do banco.
// Para ampliar o portfolio, basta adicionar itens aqui e fazer o deploy —
// o novo conteudo e plantado automaticamente na proxima inicializacao.


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
  },
  {
    "id": "act-normal-m6-jogo-da-verdade-romantico",
    "name": "Jogo da verdade romântico",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Façam perguntas íntimas e carinhosas um ao outro por 10 minutos, sem julgamentos, para se conhecerem ainda mais fundo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-quebra-cabeca-a-dois",
    "name": "Quebra-cabeça a dois",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Montem juntos um quebra-cabeça de pelo menos 200 peças, revezando quem encaixa cada parte e comemorando juntos no final.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-pintura-compartilhada",
    "name": "Pintura a dois",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Dividam uma tela ou folha grande e pintem juntos, cada um contribuindo com uma parte, sem combinar o resultado antes.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-danca-livre-na-sala",
    "name": "Dança livre na sala",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Escolham uma música animada e dancem livremente na sala por 5 minutos, sem coreografia, só se divertindo juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-ensaio-fotografico-tematico",
    "name": "Ensaio fotográfico temático em casa",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escolham um tema divertido e façam um mini ensaio de fotos em casa, usando roupas e objetos que já têm.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-playlist-nossa-historia",
    "name": "Playlist 'nossa história'",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Montem juntos uma playlist com músicas que marcaram momentos importantes do relacionamento de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jogo-de-tabuleiro-classico",
    "name": "Noite de jogo de tabuleiro",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Escolham um jogo de tabuleiro clássico e joguem juntos por pelo menos 30 minutos, sem celular por perto.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-origami-a-dois",
    "name": "Origami a dois",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Aprendam a dobrar uma figura de origami juntos, seguindo um tutorial, e troquem as criações como lembrança.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-caca-ao-tesouro-em-casa",
    "name": "Caça ao tesouro em casa",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Um de vocês esconde pequenos bilhetes com pistas pela casa, e o outro precisa segui-las até encontrar uma surpresa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cartas-de-agradecimento",
    "name": "Cartas de agradecimento mútuo",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escrevam uma carta curta agradecendo coisas específicas que o outro fez recentemente, e leiam em voz alta juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-meditacao-guiada-em-dupla",
    "name": "Meditação guiada em dupla",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Sentem-se lado a lado e sigam uma meditação guiada de 10 minutos, focando em respirar no mesmo ritmo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-desenhar-um-ao-outro",
    "name": "Desenhar um ao outro",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Peguem papel e lápis e desenhem o rosto um do outro em 5 minutos, depois riam juntos do resultado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-album-de-memorias-digital",
    "name": "Álbum de memórias digital",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Selecionem juntos 20 fotos favoritas do relacionamento e organizem em um álbum digital com legendas carinhosas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jogo-eu-nunca",
    "name": "Jogo 'eu nunca' do casal",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Joguem uma versão romântica do 'eu nunca', revelando curiosidades e histórias que ainda não contaram um ao outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-massagem-relaxante-revezada",
    "name": "Massagem relaxante revezada",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Façam uma massagem de 10 minutos nos ombros um do outro, revezando quem recebe primeiro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-organizar-gaveta-recordacoes",
    "name": "Organizar a gaveta de recordações",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Separem 20 minutos para organizar juntos objetos e lembranças guardadas, relembrando a história por trás de cada um.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-aprender-truque-de-magica",
    "name": "Aprender um truque de mágica juntos",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Assistam a um tutorial e aprendam um truque de mágica simples para apresentar um ao outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-carta-para-o-futuro-casal",
    "name": "Carta para o futuro casal",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Escrevam juntos uma carta para serem abertos daqui a um ano, com sonhos e planos para o relacionamento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jogo-de-tabuleiro-inventado",
    "name": "Inventar um jogo de tabuleiro",
    "category": "Hobbies & Outros",
    "points": 22,
    "description": "Criem juntos as regras de um jogo de tabuleiro simples usando papel e objetos que tiverem em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-sessao-de-ioga-a-dois",
    "name": "Sessão de ioga a dois",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Sigam um vídeo de ioga para casais por 15 minutos, ajudando um ao outro nas posições.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-video-engracado-juntos",
    "name": "Criar um vídeo engraçado juntos",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Gravem um vídeo curto e divertido juntos, como uma cena inventada ou dublagem de música, só para rir depois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-mapa-de-sonhos",
    "name": "Mapa de sonhos do casal",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Recortem imagens e palavras de revistas ou impressos e montem juntos um quadro com os sonhos que querem realizar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jogo-perguntas-sobre-futuro",
    "name": "Jogo de perguntas sobre o futuro",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Façam perguntas um ao outro sobre onde se veem daqui a 5 anos e comparem as respostas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-aprender-palavras-outro-idioma",
    "name": "Aprender 5 palavras em outro idioma",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Escolham um idioma novo e aprendam juntos 5 palavras ou expressões, praticando a pronúncia um com o outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-teste-personalidade-comparar",
    "name": "Teste de personalidade a dois",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam o mesmo teste de personalidade online separadamente e depois comparem e conversem sobre os resultados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-criar-apelidos-carinhosos",
    "name": "Criar apelidos carinhosos novos",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Pensem juntos em pelo menos 3 apelidos carinhosos novos para usarem um com o outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-videogame-cooperativo",
    "name": "Sessão de videogame cooperativo",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Joguem juntos um jogo cooperativo por pelo menos 30 minutos, trabalhando em equipe para vencer os desafios.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-lista-motivos-para-amar",
    "name": "Lista de 10 motivos para amar o outro",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Escrevam separadamente uma lista com 10 motivos pelos quais amam o outro e troquem as listas ao final.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-reorganizar-comodo-juntos",
    "name": "Reorganizar um cômodo juntos",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escolham um cômodo da casa e reorganizem juntos a decoração ou arrumação, deixando o espaço com a cara de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-origami-coracao",
    "name": "Origami de coração",
    "category": "Hobbies & Outros",
    "points": 8,
    "description": "Dobrem juntos um coração de papel seguindo um tutorial simples e escrevam uma mensagem dentro dele.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-capsula-do-tempo",
    "name": "Criar uma cápsula do tempo",
    "category": "Hobbies & Outros",
    "points": 22,
    "description": "Guardem juntos objetos e uma carta em uma caixa, combinando uma data futura para abrir e relembrar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-mimica-romantica",
    "name": "Jogo de mímica romântica",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Façam mímicas de momentos marcantes do relacionamento para o outro adivinhar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-assistir-por-do-sol",
    "name": "Assistir ao pôr do sol juntos",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Parem o que estão fazendo e observem juntos o pôr do sol pela janela ou varanda, sem celular.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-historia-inventada-alternando",
    "name": "Criar uma história alternando frases",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Inventem uma história juntos, cada um contribuindo com uma frase por vez, até chegar a um final engraçado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-verdade-ou-desafio-leve",
    "name": "Jogo 'verdade ou desafio' leve",
    "category": "Hobbies & Outros",
    "points": 14,
    "description": "Joguem uma rodada de verdade ou desafio com perguntas e tarefas leves e divertidas, sem constrangimento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cozinhar-receita-nova",
    "name": "Cozinhar uma receita nova juntos",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Escolham uma receita que nenhum dos dois já fez e preparem juntos, dividindo as tarefas na cozinha.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-prova-as-cegas",
    "name": "Prova às cegas de sabores",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Um de vocês venda os olhos do outro e ofereça pequenas porções de alimentos diferentes para adivinhar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-fazer-sobremesa-juntos",
    "name": "Fazer sobremesa juntos",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Escolham uma sobremesa simples e preparem juntos, terminando com uma degustação especial.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-noite-pizza-caseira",
    "name": "Noite de pizza caseira",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Preparem a massa e escolham os recheios juntos para uma pizza 100% feita por vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-harmonizacao-vinho-queijos",
    "name": "Harmonização de vinho e queijos",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Montem uma tábua simples de queijos e escolham uma bebida para harmonizar, conversando sobre os sabores.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cafe-da-manha-na-cama",
    "name": "Café da manhã na cama",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Um de vocês prepara e serve o café da manhã na cama para o outro, como uma surpresa carinhosa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-piquenique-na-sala",
    "name": "Piquenique na sala",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Montem um piquenique com manta e petiscos dentro de casa, mudando a rotina das refeições.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-drink-autoral-a-dois",
    "name": "Criar um drink autoral a dois",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Misturem ingredientes que têm em casa e criem juntos uma bebida (com ou sem álcool) só de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-pao-caseiro-juntos",
    "name": "Fazer pão caseiro juntos",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Preparem uma receita simples de pão caseiro, revezando quem sova a massa e quem cuida do forno.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-noite-comida-etnica",
    "name": "Noite de comida étnica",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Escolham um país e preparem juntos um prato típico dele, pesquisando a receita antes.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-desafio-decorar-bolo",
    "name": "Desafio de decorar um bolo",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Comprem ou façam um bolo simples e decorem juntos, cada um com um lado, comparando o resultado no final.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jantar-luz-de-velas",
    "name": "Jantar à luz de velas",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Preparem um jantar simples e montem a mesa com velas para criar um clima especial, só para os dois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-receita-familia-nova",
    "name": "Criar uma receita de família nova",
    "category": "Comida & Bebida",
    "points": 22,
    "description": "Combinem ingredientes que os dois gostam e criem juntos uma receita que pode virar tradição de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-chocolate-quente-especial",
    "name": "Fazer chocolate quente especial",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem juntos um chocolate quente com um toque especial (canela, chantilly, especiarias) e tomem conversando.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-provar-tres-queijos",
    "name": "Provar 3 queijos diferentes",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Comprem 3 tipos de queijo diferentes e façam uma degustação, elegendo o favorito de cada um.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cozinhar-sem-receita",
    "name": "Cozinhar sem receita",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Usem apenas o que tiverem na geladeira para criar um prato juntos, sem seguir nenhuma receita pronta.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-smoothie-personalizado",
    "name": "Smoothie personalizado um para o outro",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Cada um prepara um smoothie pensando no gosto do outro, e trocam para experimentar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-recriar-prato-primeiro-encontro",
    "name": "Recriar o prato do primeiro encontro",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Lembrem o que comeram no primeiro encontro e tentem recriar o prato juntos em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-noite-fondue-caseiro",
    "name": "Noite de fondue caseiro",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Preparem um fondue de queijo ou chocolate e aproveitem a noite compartilhando os mergulhos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-marmita-saudavel-semana",
    "name": "Preparar marmitas saudáveis da semana",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Cozinhem juntos as refeições saudáveis para os próximos dias, dividindo em marmitas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-testar-tempero-novo",
    "name": "Testar um tempero novo",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Escolham um tempero que nunca usaram e adicionem a um prato simples do dia a dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-tabua-de-frios",
    "name": "Montar uma tábua de frios",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Selecionem frios, pães e acompanhamentos para montar juntos uma tábua para compartilhar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-pipoca-gourmet",
    "name": "Fazer pipoca gourmet",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Preparem uma pipoca com um tempero diferente (queijo, doce de leite, páprica) para acompanhar um filme.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cha-especial-conversar",
    "name": "Preparar chá especial e conversar",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Façam um chá diferente do habitual e sentem-se juntos para conversar sobre como foi o dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-menu-surpresa-um-para-outro",
    "name": "Criar um menu surpresa",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Cada um prepara secretamente um prato ou lanche surpresa para o outro, sem revelar antes.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-suco-natural-diferente",
    "name": "Fazer um suco natural diferente",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Combinem frutas que normalmente não usam juntas e criem um suco novo para experimentar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-prato-da-infancia",
    "name": "Cozinhar um prato da infância",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Cada um ensina ao outro a fazer um prato que lembra a própria infância.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-receitas-de-app-culinaria",
    "name": "Testar receita de app de culinária",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Escolham uma receita popular em um aplicativo de culinária e preparem juntos, seguindo o passo a passo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-brinde-especial-relacionamento",
    "name": "Fazer um brinde especial",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem uma bebida simples e façam um brinde falando o que mais valorizam no relacionamento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-ritual-cafe-da-tarde",
    "name": "Criar um ritual de café da tarde",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Reservem um horário fixo para tomarem café da tarde juntos, sem celular, conversando sobre o dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-planejar-viagem-dos-sonhos",
    "name": "Planejar a viagem dos sonhos",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Escolham um destino dos sonhos e pesquisem juntos roteiro, passeios e comidas típicas, mesmo sem comprar nada ainda.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-passeio-bairro-novo",
    "name": "Passeio a pé por um bairro novo",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Escolham um bairro que nunca exploraram na cidade e caminhem juntos descobrindo ruas e lugares novos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-visitar-parque-local",
    "name": "Visitar um parque local",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Vão juntos a um parque próximo e caminhem, conversando ou apenas aproveitando o ambiente.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-explorar-feira-mercado",
    "name": "Explorar uma feira ou mercado",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Visitem juntos uma feira ou mercado da cidade e experimentem algo que nunca provaram.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-por-do-sol-mirante",
    "name": "Pôr do sol em um mirante",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Encontrem um ponto alto ou mirante na cidade e assistam juntos ao pôr do sol.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-trilha-leve-juntos",
    "name": "Fazer uma trilha leve",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Escolham uma trilha curta e leve na região e façam juntos, aproveitando a natureza.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-visitar-museu-exposicao",
    "name": "Visitar um museu ou exposição",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Escolham um museu ou exposição na cidade e visitem juntos, comentando o que mais gostaram.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-passeio-de-bicicleta",
    "name": "Passeio de bicicleta juntos",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Peguem as bicicletas (ou alugem) e façam um passeio juntos por um trajeto novo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cafeteria-nova-cidade",
    "name": "Descobrir uma cafeteria nova",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Pesquisem uma cafeteria bem avaliada que nunca foram e vão experimentar juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-turista-na-propria-cidade",
    "name": "Roteiro de turista na própria cidade",
    "category": "Viagens & Passeios",
    "points": 18,
    "description": "Montem um mini roteiro visitando pontos turísticos da própria cidade como se fossem turistas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-visitar-livraria",
    "name": "Visitar uma livraria juntos",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Vão a uma livraria e escolham juntos um livro para lerem a dois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-passeio-noturno-luzes",
    "name": "Passeio noturno pelas luzes da cidade",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Saiam à noite para caminhar e observar as luzes e movimento da cidade juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-explorar-praca-historica",
    "name": "Explorar uma praça histórica",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Visitem uma praça ou ponto histórico da cidade e pesquisem juntos sobre a origem do lugar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-piquenique-ao-ar-livre",
    "name": "Piquenique ao ar livre",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Montem uma cesta com lanches e façam um piquenique em um parque ou área verde.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-feira-de-artesanato",
    "name": "Visitar uma feira de artesanato",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Vão juntos a uma feira de artesanato e escolham uma lembrança para levar para casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-passeio-carro-sem-destino",
    "name": "Passeio de carro sem destino certo",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Peguem o carro e saiam para rodar sem destino definido, deixando a curiosidade guiar o caminho.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-restaurante-novo-bairro",
    "name": "Descobrir um restaurante novo",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Escolham um restaurante que nunca foram no bairro e experimentem juntos algo do cardápio.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-nascer-do-sol-juntos",
    "name": "Assistir ao nascer do sol",
    "category": "Viagens & Passeios",
    "points": 18,
    "description": "Acordem cedo e assistam juntos ao nascer do sol, aproveitando o início do dia a dois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-passeio-barco-lago",
    "name": "Passeio de barco ou lago",
    "category": "Viagens & Passeios",
    "points": 22,
    "description": "Se houver um lago ou rio na região, façam um passeio de barco ou caminhem pela beira dele.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-vinicola-cervejaria-local",
    "name": "Visitar uma vinícola ou cervejaria local",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Pesquisem uma vinícola ou cervejaria na região e façam uma visita ou degustação juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-trilha-urbana-grafites",
    "name": "Trilha urbana de grafites",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Caminhem por uma região conhecida por grafites e murais, fotografando os que mais gostarem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-jardim-botanico",
    "name": "Passeio a um jardim botânico",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Visitem um jardim botânico ou parque com plantas e façam uma caminhada tranquila juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-roteiro-food-trucks",
    "name": "Roteiro gastronômico de food trucks",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Procurem um evento ou ponto com food trucks e experimentem pratos diferentes juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-visitar-cidade-vizinha",
    "name": "Visitar uma cidade vizinha por um dia",
    "category": "Viagens & Passeios",
    "points": 25,
    "description": "Escolham uma cidade próxima que nunca visitaram e façam um bate-volta de um dia juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-show-evento-cultural",
    "name": "Assistir a um show ou evento cultural",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Procurem um show, peça ou evento cultural acontecendo na região e vão juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-maratona-decada-do-casal",
    "name": "Maratona de filmes da década de vocês",
    "category": "Filmes & Séries",
    "points": 15,
    "description": "Escolham filmes lançados na década em que nasceram e façam uma maratona juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-filme-nenhum-viu",
    "name": "Assistir a um filme que nenhum viu",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Escolham juntos um filme que nenhum dos dois assistiu e comentem as impressões depois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-recriar-cena-filme",
    "name": "Recriar uma cena de filme favorito",
    "category": "Filmes & Séries",
    "points": 18,
    "description": "Escolham uma cena marcante de um filme que os dois amam e tentem recriá-la em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-cinema-em-casa-tematico",
    "name": "Cinema em casa temático",
    "category": "Filmes & Séries",
    "points": 15,
    "description": "Escolham um tema (terror, comédia, romance) e montem uma sessão de cinema em casa com pipoca e luz apagada.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-documentario-debater",
    "name": "Assistir a um documentário e debater",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Escolham um documentário sobre um tema que interesse os dois e conversem sobre ele depois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-filme-por-sorteio",
    "name": "Escolher um filme por sorteio",
    "category": "Filmes & Séries",
    "points": 8,
    "description": "Escrevam nomes de filmes em papéis, sorteiem um e assistam juntos, seja qual for o resultado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-serie-favorita-infancia",
    "name": "Assistir à série favorita da infância",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Um de vocês escolhe uma série que marcou a própria infância para o outro conhecer.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-top-5-filmes-cada-um",
    "name": "Criar uma lista de 'top 5 filmes'",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Cada um monta sua lista dos 5 filmes favoritos e comparem as escolhas, explicando os motivos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-filme-outro-idioma",
    "name": "Assistir a um filme em outro idioma",
    "category": "Filmes & Séries",
    "points": 15,
    "description": "Escolham um filme em um idioma diferente do português, com legenda, e assistam juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-noite-curtas-metragens",
    "name": "Noite de curtas-metragens",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Selecionem alguns curtas-metragens disponíveis online e assistam juntos em uma noite tranquila.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-playlist-colaborativa",
    "name": "Criar uma playlist colaborativa",
    "category": "Música",
    "points": 10,
    "description": "Cada um adiciona 5 músicas à mesma playlist e ouçam juntos o resultado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-ensinar-musica-favorita",
    "name": "Ensinar uma música favorita ao outro",
    "category": "Música",
    "points": 8,
    "description": "Toquem ou cantem uma música que é especial para vocês e expliquem por que ela importa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-karaoke-caseiro",
    "name": "Fazer um karaokê caseiro",
    "category": "Música",
    "points": 15,
    "description": "Escolham músicas favoritas e façam um karaokê em casa, sem se preocupar em cantar bem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-descobrir-banda-nova",
    "name": "Descobrir uma banda ou artista novo",
    "category": "Música",
    "points": 10,
    "description": "Pesquisem um artista ou banda que nenhum conhece e ouçam o álbum completo juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-trilha-primeiro-encontro",
    "name": "Recriar a trilha sonora do primeiro encontro",
    "category": "Música",
    "points": 15,
    "description": "Relembrem quais músicas tocavam ou marcaram o primeiro encontro de vocês e ouçam juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-letra-musica-outro-idioma",
    "name": "Aprender letra de música em outro idioma",
    "category": "Música",
    "points": 12,
    "description": "Escolham uma música em outro idioma e aprendam juntos a cantar pelo menos o refrão.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-dancar-musica-relacionamento",
    "name": "Dançar a música do relacionamento",
    "category": "Música",
    "points": 10,
    "description": "Escolham a música que representa o relacionamento de vocês e dancem juntos, mesmo sem jeito.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-compor-musica-paradia",
    "name": "Compor uma paródia juntos",
    "category": "Música",
    "points": 18,
    "description": "Peguem uma música conhecida e criem juntos uma letra nova e engraçada sobre o relacionamento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-show-ao-vivo",
    "name": "Assistir a um show ao vivo",
    "category": "Música",
    "points": 20,
    "description": "Procurem uma live, show local ou apresentação e assistam juntos, presencialmente ou online.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m6-playlist-data-especial",
    "name": "Criar playlist para data especial futura",
    "category": "Música",
    "points": 10,
    "description": "Montem juntos uma playlist pensando em uma data especial que ainda vai acontecer no relacionamento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-hot-m6-massagem-surpresa-oleo",
    "name": "Massagem surpresa com óleo aromático",
    "category": "Hot",
    "points": 22,
    "description": "Preparem o ambiente com música baixa e façam uma massagem surpresa um no outro usando óleo aromático.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-striptease-humor-leve",
    "name": "Striptease de humor",
    "category": "Hot",
    "points": 18,
    "description": "Façam uma dança de striptease engraçada e sem pressão, só para se divertirem e provocarem um ao outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-perguntas-picantes",
    "name": "Jogo de perguntas picantes",
    "category": "Hot",
    "points": 15,
    "description": "Façam perguntas ousadas e picantes um ao outro, respondendo com sinceridade e sem julgamento.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-danca-sensual-a-dois",
    "name": "Dança sensual a dois",
    "category": "Hot",
    "points": 20,
    "description": "Escolham uma música de clima sensual e dancem coladinhos, deixando o momento fluir naturalmente.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-banho-banheira-compartilhado",
    "name": "Banho compartilhado",
    "category": "Hot",
    "points": 25,
    "description": "Preparem um banho relaxante para os dois, com velas e música baixa, aproveitando o momento juntos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-tabuleiro-sorte-picante",
    "name": "Jogo de tabuleiro picante",
    "category": "Hot",
    "points": 20,
    "description": "Criem um jogo simples com cartas de desafios sensuais e joguem juntos, revezando quem tira a carta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-sussurros-elogios",
    "name": "Sussurros ao ouvido",
    "category": "Hot",
    "points": 15,
    "description": "Revezem sussurrando elogios sensuais um no ouvido do outro por alguns minutos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-vendar-adivinhar-toques",
    "name": "Vendar os olhos e adivinhar toques",
    "category": "Hot",
    "points": 22,
    "description": "Um de vocês veda os olhos enquanto o outro faz toques diferentes, e a missão é adivinhar cada um.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-noite-lingerie-surpresa",
    "name": "Noite de roupa especial surpresa",
    "category": "Hot",
    "points": 25,
    "description": "Preparem uma surpresa usando uma roupa ou lingerie especial escolhida para agradar o parceiro(a).",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-beijo-cronometrado",
    "name": "Beijo cronometrado de 60 segundos",
    "category": "Hot",
    "points": 12,
    "description": "Cronometrem um beijo de pelo menos 60 segundos, sem pressa, focando só nesse momento.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-cartas-desafios-sensuais",
    "name": "Jogo de cartas com desafios sensuais",
    "category": "Hot",
    "points": 20,
    "description": "Criem cartas com pequenos desafios sensuais e sorteiem uma por vez para cumprir na hora.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-massagem-pes-provocante",
    "name": "Massagem nos pés relaxante e provocante",
    "category": "Hot",
    "points": 15,
    "description": "Façam uma massagem revezada nos pés um do outro, com calma e atenção total no parceiro(a).",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-danca-seducao-improvisada",
    "name": "Dança sedutora improvisada",
    "category": "Hot",
    "points": 18,
    "description": "Escolham uma música e criem uma coreografia sedutora na hora, sem ensaio, só se soltando.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-verdade-consequencia-picante",
    "name": "Jogo 'verdade ou consequência' picante",
    "category": "Hot",
    "points": 20,
    "description": "Joguem uma rodada de verdade ou consequência com perguntas e desafios mais ousados.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-bilhete-sedutor-escondido",
    "name": "Bilhete sedutor escondido",
    "category": "Hot",
    "points": 12,
    "description": "Escrevam um bilhete sedutor e escondam em um lugar que o parceiro(a) vá encontrar durante o dia.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-ensaio-sensual-privado",
    "name": "Ensaio fotográfico sensual privado",
    "category": "Hot",
    "points": 22,
    "description": "Façam um mini ensaio de fotos sensuais só para vocês, guardado em um local privado e seguro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-jogo-gelo-provocacao",
    "name": "Provocação com cubos de gelo",
    "category": "Hot",
    "points": 20,
    "description": "Usem cubos de gelo para provocar suavemente um ao outro, brincando com a sensação de frio.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-mensagens-picantes-dia",
    "name": "Trocar mensagens picantes durante o dia",
    "category": "Hot",
    "points": 15,
    "description": "Enviem mensagens picantes um para o outro ao longo do dia, criando expectativa para a noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-playlist-clima-noite",
    "name": "Criar uma playlist 'clima' para a noite",
    "category": "Hot",
    "points": 10,
    "description": "Montem juntos uma playlist com músicas de clima intimista para curtirem a noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-jantar-velas-dress-code",
    "name": "Jantar com dress code sensual",
    "category": "Hot",
    "points": 25,
    "description": "Organizem um jantar à luz de velas combinando previamente um dress code sensual para a ocasião.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-tabuleiro-temperatura",
    "name": "Jogo de tabuleiro 'temperatura'",
    "category": "Hot",
    "points": 22,
    "description": "Criem um jogo com desafios que aumentam de intensidade a cada rodada, como uma escala de temperatura.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-caricias-sem-pressa",
    "name": "Sessão de carícias sem pressa",
    "category": "Hot",
    "points": 20,
    "description": "Reservem um tempo só para carícias, sem celular e sem pressa, focando totalmente um no outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-perguntas-fantasias-leves",
    "name": "Jogo de perguntas sobre fantasias",
    "category": "Hot",
    "points": 18,
    "description": "Conversem abertamente sobre fantasias leves um do outro, sem julgamento e com respeito mútuo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-striptease-comico-musica",
    "name": "Striptease cômico com música escolhida",
    "category": "Hot",
    "points": 18,
    "description": "Escolham juntos uma música engraçada e façam um striptease bem humorado, só para se divertir.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-massagem-velas-aromaticas",
    "name": "Massagem com velas aromáticas de baixa temperatura",
    "category": "Hot",
    "points": 25,
    "description": "Usem velas próprias para massagem (baixa temperatura) e façam uma massagem relaxante e sensual.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-toque-cego-tecidos",
    "name": "Jogo 'toque às cegas' com tecidos",
    "category": "Hot",
    "points": 18,
    "description": "Vendem os olhos e usem tecidos diferentes (seda, algodão, pelúcia) para o parceiro(a) sentir e reagir.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-ritual-noturno-so-dois",
    "name": "Criar um ritual noturno só dos dois",
    "category": "Hot",
    "points": 15,
    "description": "Definam um pequeno ritual (massagem, banho, conversa) para fazerem juntos antes de dormir.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-cartas-desejos-secretos",
    "name": "Jogo de cartas 'desejos secretos'",
    "category": "Hot",
    "points": 20,
    "description": "Escrevam desejos secretos em cartas separadas e troquem, tentando realizar um deles ainda essa semana.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-provocacao-pena-plumas",
    "name": "Provocação com pena ou pluma",
    "category": "Hot",
    "points": 18,
    "description": "Usem uma pena ou pluma macia para provocar suavemente a pele um do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-spa-a-dois-em-casa",
    "name": "Noite de spa a dois em casa",
    "category": "Hot",
    "points": 25,
    "description": "Montem uma experiência de spa em casa com máscaras, óleos e massagem revezada entre os dois.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-sussurros-fantasias-leves",
    "name": "Sussurros de fantasias leves",
    "category": "Hot",
    "points": 15,
    "description": "Sussurrem um para o outro pequenas fantasias ou desejos, criando intimidade e cumplicidade.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-danca-lenta-abracados-escuro",
    "name": "Dança lenta abraçados no escuro",
    "category": "Hot",
    "points": 15,
    "description": "Apaguem as luzes, coloquem uma música lenta e dancem abraçados, sentindo o momento juntos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-seduzir-tres-palavras",
    "name": "Jogo 'seduzir em 3 palavras'",
    "category": "Hot",
    "points": 12,
    "description": "Cada um tenta seduzir o outro usando apenas 3 palavras por vez, revezando as rodadas.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-fotos-preto-branco-sensuais",
    "name": "Sessão de fotos em preto e branco sensuais",
    "category": "Hot",
    "points": 22,
    "description": "Façam fotos em preto e branco com um clima mais sensual, guardadas apenas para os dois.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-tabuleiro-ousadia-romantica",
    "name": "Jogo de tabuleiro 'ousadia romântica'",
    "category": "Hot",
    "points": 20,
    "description": "Criem um tabuleiro simples com casas de desafios ousados e joguem juntos até o fim.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-massagem-troca-papeis",
    "name": "Massagem com troca de papéis",
    "category": "Hot",
    "points": 20,
    "description": "Um de vocês assume o comando da massagem por 10 minutos, depois trocam os papéis.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-recriar-clima-filme-romantico",
    "name": "Recriar o clima de uma cena romântica",
    "category": "Hot",
    "points": 18,
    "description": "Escolham uma cena de filme romântico que gostam e recriem o clima dela em casa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-seduza-me-regras-na-hora",
    "name": "Jogo 'seduza-me' com regras inventadas",
    "category": "Hot",
    "points": 18,
    "description": "Criem regras de sedução na hora, um desafiando o outro a cumprir pequenas provocações.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-noite-sem-roupa-dormir-so-carinho",
    "name": "Noite sem roupa de dormir, só carinho",
    "category": "Hot",
    "points": 20,
    "description": "Durmam pele com pele, sem roupa de dormir, focando apenas no carinho e na proximidade.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m6-adivinhar-toques-favoritos",
    "name": "Jogo de adivinhação de toques favoritos",
    "category": "Hot",
    "points": 18,
    "description": "Um de vocês veda os olhos enquanto o outro experimenta toques diferentes até acertar o favorito.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-normal-m7-carta-do-futuro-eu",
    "name": "Carta do 'eu do futuro' a dois",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Escrevam juntos uma carta imaginando como serão daqui a 10 anos e guardem para ler depois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-curiosas",
    "name": "Jogo de perguntas curiosas",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Façam 10 perguntas curiosas um ao outro que nunca perguntaram antes, por mais bobas que pareçam.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-aula-de-danca-online",
    "name": "Aula de dança online a dois",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Sigam um tutorial de dança de casal no vídeo e tentem aprender os passos juntos, rindo dos erros.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-montar-mini-horta",
    "name": "Montar uma mini horta juntos",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Plantem juntos ervas ou temperos em vasos pequenos e cuidem deles ao longo da semana.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-caixa-de-lembrancas-fisica",
    "name": "Criar uma caixa de lembranças física",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Reúnam bilhetes, ingressos e pequenos objetos e guardem juntos em uma caixa de recordações do casal.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desenho-as-cegas",
    "name": "Desenho às cegas",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Um descreve um objeto e o outro tenta desenhá-lo sem ver, de olhos vendados ou sem olhar o papel.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-tabuleiro-perguntas-caseiro",
    "name": "Criar jogo de perguntas caseiro",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escrevam perguntas em pedaços de papel, coloquem em um pote e sorteiem uma por vez para responder.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-sessao-artesanato-simples",
    "name": "Sessão de artesanato simples",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escolham um artesanato fácil (vela, sabonete, bijuteria) e façam juntos seguindo um tutorial rápido.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-organizacao-armario",
    "name": "Desafio de organizar o armário",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Separem 30 minutos para organizar juntos o armário ou closet, doando o que não usam mais.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-de-cartas-classico",
    "name": "Noite de jogo de cartas",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Escolham um jogo de cartas clássico e disputem algumas rodadas juntos, valendo uma prenda simbólica.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-planejar-arvore-genealogica",
    "name": "Planejar a árvore genealógica do casal",
    "category": "Hobbies & Outros",
    "points": 22,
    "description": "Pesquisem juntos a história das famílias de cada um e montem uma pequena árvore genealógica combinada.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-sobre-o-outro",
    "name": "Quanto você me conhece?",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Façam perguntas sobre gostos e hábitos um do outro para testar o quanto realmente se conhecem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-podcast-caseiro",
    "name": "Gravar um podcast caseiro",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Gravem um áudio de 5 minutos conversando sobre um tema qualquer, como se fosse um podcast só de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-montar-quebra-cabeca-3d",
    "name": "Montar um quebra-cabeça 3D",
    "category": "Hobbies & Outros",
    "points": 22,
    "description": "Escolham um quebra-cabeça 3D ou maquete simples e montem juntos, dividindo as etapas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-imitacao-personagens",
    "name": "Jogo de imitação de personagens",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Imitem personagens de filmes ou séries um para o outro adivinhar quem é.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-regras-proprio-jogo",
    "name": "Criar as regras de um jogo próprio",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Inventem um jogo novo, com regras próprias, usando objetos simples que tiverem em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-sessao-tarot-divertida",
    "name": "Sessão de tarot ou horóscopo por diversão",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam uma leitura de tarot ou horóscopo online juntos, só por diversão, e comentem os resultados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-photobooth-caseiro",
    "name": "Desafio de photobooth caseiro",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Montem um cantinho com adereços simples e tirem fotos divertidas juntos, como em uma cabine de fotos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-caligrafia-mensagem-um-para-outro",
    "name": "Caligrafia de uma mensagem especial",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Pratiquem caligrafia escrevendo uma mensagem especial um para o outro em um cartão.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-decisao-rapida",
    "name": "Jogo de decisão rápida",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam perguntas de 'isso ou aquilo' um para o outro, respondendo o mais rápido possível.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-reorganizar-fotos-celular",
    "name": "Reorganizar as fotos do celular juntos",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Revejam as fotos do casal no celular, apaguem as repetidas e criem um álbum favorito juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-sem-celular-uma-tarde",
    "name": "Desafio de uma tarde sem celular",
    "category": "Hobbies & Outros",
    "points": 22,
    "description": "Combinem passar uma tarde inteira sem usar o celular, dedicando o tempo só um ao outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-adivinhar-musica",
    "name": "Jogo de adivinhar a música",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Toquem trechos curtos de músicas para o outro adivinhar o nome e o artista.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-cronograma-sonhos",
    "name": "Criar um cronograma de sonhos do casal",
    "category": "Hobbies & Outros",
    "points": 20,
    "description": "Listem sonhos e coloquem prazos realistas para começarem a planejar como realizá-los juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desenhar-mapa-do-relacionamento",
    "name": "Desenhar o 'mapa' do relacionamento",
    "category": "Hobbies & Outros",
    "points": 18,
    "description": "Desenhem juntos uma linha do tempo ilustrada com os principais marcos do relacionamento.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-e-respostas-engracadas",
    "name": "Jogo de perguntas e respostas engraçadas",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam perguntas absurdas e engraçadas um ao outro, valendo pontos pela resposta mais criativa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-sessao-de-alongamento",
    "name": "Sessão de alongamento a dois",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam juntos uma sequência simples de alongamentos, ajudando um ao outro nos movimentos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-jogo-perguntas-app",
    "name": "Criar um quiz sobre o relacionamento",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Montem um pequeno quiz com perguntas sobre datas e momentos importantes do casal e testem um ao outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-caca-objetos-escondidos",
    "name": "Caça a objetos escondidos pela casa",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Um esconde 5 objetos pequenos pela casa e o outro precisa encontrá-los dentro de um tempo determinado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-desenho-coletivo",
    "name": "Desenho coletivo sem combinar",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Desenhem juntos na mesma folha sem combinar antes o que vai sair, revezando traços.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-passado",
    "name": "Perguntas sobre o passado de cada um",
    "category": "Hobbies & Outros",
    "points": 12,
    "description": "Façam perguntas sobre a infância e adolescência um do outro para conhecerem histórias novas.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-tutorial-habilidade-nova",
    "name": "Assistir a um tutorial de habilidade nova",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Escolham uma habilidade simples (nó de gravata, crochê, malabarismo) e aprendam juntos por vídeo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-adedanha-casal",
    "name": "Jogo de adedanha em dupla",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Joguem uma rodada de adedanha com temas relacionados ao relacionamento de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-ritual-domingo",
    "name": "Criar um ritual de domingo",
    "category": "Hobbies & Outros",
    "points": 15,
    "description": "Definam juntos uma atividade fixa para fazerem todo domingo, criando uma tradição só de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-perguntas-hipoteses",
    "name": "Jogo de hipóteses malucas",
    "category": "Hobbies & Outros",
    "points": 10,
    "description": "Façam perguntas hipotéticas divertidas um ao outro, como 'o que você faria se...'.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-receita-so-tres-ingredientes",
    "name": "Desafio da receita com 3 ingredientes",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Escolham apenas 3 ingredientes da geladeira e criem juntos um prato com eles.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-noite-comida-de-boteco",
    "name": "Noite de comida de boteco",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Preparem petiscos de boteco em casa e criem um clima descontraído para a noite.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-degustacao-cafes-especiais",
    "name": "Degustação de cafés especiais",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Preparem cafés de origens ou métodos diferentes e comparem os sabores juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-receita-secreta-familia",
    "name": "Criar uma receita secreta do casal",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Inventem juntos uma receita que será o 'segredo' de vocês, para repetir em ocasiões especiais.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-mini-festival-street-food-caseiro",
    "name": "Mini festival de street food caseiro",
    "category": "Comida & Bebida",
    "points": 22,
    "description": "Preparem juntos 2 ou 3 pratos inspirados em comida de rua de diferentes países.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-decorar-cupcakes",
    "name": "Desafio de decorar cupcakes",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Assem ou comprem cupcakes simples e decorem cada um do seu jeito, comparando o resultado.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-cafe-da-tarde-tematico",
    "name": "Café da tarde temático",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Escolham um tema (retrô, tropical, natalino) e montem uma mesa de café da tarde combinando com ele.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jantar-as-escuras",
    "name": "Jantar às escuras",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Façam um jantar simples com as luzes apagadas, guiando-se apenas pelo tato e paladar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-prova-molhos-diferentes",
    "name": "Prova de molhos diferentes",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem ou comprem 3 molhos diferentes e testem com o mesmo alimento base para comparar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-receita-vegetariana-nova",
    "name": "Testar uma receita vegetariana nova",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Escolham uma receita vegetariana que nenhum já fez e preparem juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-cafe-gelado-caseiro",
    "name": "Fazer café gelado caseiro",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Preparem juntos um café gelado com um toque especial (leite, canela, chocolate) para o fim de tarde.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jantar-inspirado-viagem",
    "name": "Jantar inspirado em uma viagem dos sonhos",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Escolham o destino dos sonhos de vocês e preparem um prato típico de lá.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-cha-da-tarde-ingles",
    "name": "Chá da tarde estilo inglês",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Preparem uma mesa de chá com torradas, geleias e bolinhos, simulando um chá da tarde inglês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-bolo-de-caneca",
    "name": "Desafio do bolo de caneca",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Façam um bolo de caneca no micro-ondas juntos e dividam no meio.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-prova-cervejas-artesanais",
    "name": "Prova de cervejas artesanais (com moderação)",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Experimentem 2 ou 3 cervejas artesanais diferentes e conversem sobre qual preferem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-cozinhar-receita-avos",
    "name": "Cozinhar uma receita dos avós",
    "category": "Comida & Bebida",
    "points": 20,
    "description": "Peçam ou pesquisem uma receita antiga da família de um dos dois e preparem juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-noite-taco-caseiro",
    "name": "Noite de taco caseiro",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Preparem tacos com recheios variados para cada um montar o seu jeito.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-suco-detox-manha",
    "name": "Suco detox pela manhã",
    "category": "Comida & Bebida",
    "points": 8,
    "description": "Preparem juntos um suco detox para começar o dia com mais energia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-sanduiche-gourmet",
    "name": "Desafio do sanduíche gourmet",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Cada um monta um sanduíche criativo usando os ingredientes disponíveis e trocam para experimentar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jantar-picles-conservas",
    "name": "Experimentar picles e conservas caseiras",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Façam uma conserva simples (pepino, cebola) e experimentem juntos depois de um tempo de preparo.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-cafe-da-manha-tematico-viagem",
    "name": "Café da manhã temático de viagem",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Escolham um país e montem um café da manhã inspirado na culinária de lá.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-decoracao-de-mesa",
    "name": "Desafio de decoração de mesa para o jantar",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Decorem juntos a mesa do jantar de forma diferente do habitual, usando o que tiverem em casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-receita-doce-sem-forno",
    "name": "Receita de doce sem forno",
    "category": "Comida & Bebida",
    "points": 12,
    "description": "Preparem juntos uma sobremesa que não precisa de forno, como um brigadeiro ou pavê rápido.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-harmonizacao-chocolate-bebida",
    "name": "Harmonização de chocolate e bebida",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Experimentem diferentes tipos de chocolate combinados com café, chá ou vinho.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-prova-frutas-exoticas",
    "name": "Prova de frutas exóticas ou pouco comuns",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Comprem uma fruta que nenhum dos dois já experimentou e provem juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jantar-minimalista-elegante",
    "name": "Jantar minimalista elegante",
    "category": "Comida & Bebida",
    "points": 18,
    "description": "Preparem um jantar simples mas caprichado na apresentação, como em um restaurante.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-omelete-criativo",
    "name": "Desafio do omelete criativo",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Cada um cria um recheio diferente de omelete e trocam para experimentar o do outro.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-bebida-quente-inverno",
    "name": "Criar uma bebida quente de inverno",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem uma bebida quente diferente (vinho quente, ponche, chá especiado) para os dias mais frios.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-desafio-lanche-da-tarde-saudavel",
    "name": "Desafio do lanche da tarde saudável",
    "category": "Comida & Bebida",
    "points": 10,
    "description": "Preparem juntos um lanche da tarde saudável e saboroso para os dois.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jantar-com-musica-ao-vivo",
    "name": "Jantar com playlist ao vivo",
    "category": "Comida & Bebida",
    "points": 15,
    "description": "Um de vocês toca um instrumento ou canta enquanto jantam, criando um clima especial.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-de-onibus-turistico",
    "name": "Passeio de ônibus turístico local",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Se a cidade tiver, peguem um ônibus turístico e conheçam pontos novos juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-zoologico-aquario",
    "name": "Visitar um zoológico ou aquário",
    "category": "Viagens & Passeios",
    "points": 18,
    "description": "Façam um passeio a um zoológico ou aquário próximo e aproveitem o dia juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-explorar-bairro-historico",
    "name": "Explorar um bairro histórico",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Caminhem por um bairro histórico da cidade, observando a arquitetura e a história do lugar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-orla-praia-lago",
    "name": "Passeio pela orla ou beira de lago",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Caminhem juntos pela orla de uma praia ou lago, aproveitando a vista e o ar livre.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-planetario-observatorio",
    "name": "Visitar um planetário ou observatório",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Procurem um planetário ou observatório na região e façam uma visita juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-acampar-no-quintal",
    "name": "Acampar no quintal ou varanda",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Montem uma barraca ou um espaço de acampamento improvisado em casa e passem a noite lá.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-parque-aventura",
    "name": "Passeio a um parque de aventura",
    "category": "Viagens & Passeios",
    "points": 22,
    "description": "Visitem um parque com tirolesa, arvorismo ou trilhas de aventura juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-explorar-mercado-municipal",
    "name": "Explorar um mercado municipal",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Visitem um mercado municipal e experimentem produtos ou comidas típicas do local.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-teleferico-mirante",
    "name": "Passeio de teleférico ou mirante pago",
    "category": "Viagens & Passeios",
    "points": 22,
    "description": "Se houver na região, façam um passeio de teleférico ou visitem um mirante pago juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-roteiro-arquitetura-cidade",
    "name": "Roteiro de arquitetura da cidade",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Façam um roteiro a pé observando prédios e construções interessantes da cidade.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-parque-nacional-reserva",
    "name": "Visitar um parque nacional ou reserva próxima",
    "category": "Viagens & Passeios",
    "points": 25,
    "description": "Pesquisem um parque nacional ou reserva ambiental na região e façam uma visita juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-cachoeira-proxima",
    "name": "Passeio a uma cachoeira próxima",
    "category": "Viagens & Passeios",
    "points": 25,
    "description": "Encontrem uma cachoeira na região e façam um passeio de um dia até lá.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-explorar-centro-historico-cidade",
    "name": "Explorar o centro histórico da cidade",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Visitem o centro histórico e conheçam prédios e monumentos importantes juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-parque-tematico",
    "name": "Passeio a um parque temático",
    "category": "Viagens & Passeios",
    "points": 25,
    "description": "Se possível, visitem um parque temático na região para um dia de diversão juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-fazenda-sitio",
    "name": "Visitar uma fazenda ou sítio próximo",
    "category": "Viagens & Passeios",
    "points": 22,
    "description": "Procurem uma fazenda ou sítio que receba visitantes e passem o dia lá.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-roteiro-fotografico-cidade",
    "name": "Roteiro fotográfico pela cidade",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Escolham 5 pontos da cidade para fotografar juntos e criem um pequeno álbum do passeio.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-de-trem-historico",
    "name": "Passeio de trem ou bondinho histórico",
    "category": "Viagens & Passeios",
    "points": 22,
    "description": "Se disponível na região, façam um passeio de trem ou bondinho histórico juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-feira-livre-domingo",
    "name": "Visitar uma feira livre de domingo",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Vão a uma feira livre pela manhã e escolham frutas ou produtos frescos para levar para casa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-explorar-parque-linear",
    "name": "Explorar um parque linear ou ciclovia",
    "category": "Viagens & Passeios",
    "points": 15,
    "description": "Caminhem ou pedalem por um parque linear ou ciclovia da cidade.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-igreja-catedral-historica",
    "name": "Visitar uma igreja ou catedral histórica",
    "category": "Viagens & Passeios",
    "points": 12,
    "description": "Visitem uma igreja ou catedral com valor histórico e conheçam sua arquitetura juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-dia-de-camping-em-parque",
    "name": "Dia de piquenique e camping leve em parque",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Passem o dia em um parque com jogos, comida e um clima de acampamento leve.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-shopping-diferente",
    "name": "Passeio a um shopping ou centro cultural diferente",
    "category": "Viagens & Passeios",
    "points": 10,
    "description": "Visitem um shopping ou centro cultural que não costumam frequentar.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-explorar-rota-gastronomica-regional",
    "name": "Explorar uma rota gastronômica regional",
    "category": "Viagens & Passeios",
    "points": 20,
    "description": "Pesquisem uma rota gastronômica da região e visitem 2 ou 3 lugares recomendados.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-visitar-parque-com-animais-resgatados",
    "name": "Visitar um santuário ou parque de animais resgatados",
    "category": "Viagens & Passeios",
    "points": 18,
    "description": "Procurem um santuário de animais próximo e visitem juntos, apoiando a causa.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-passeio-de-canoa-caiaque",
    "name": "Passeio de canoa ou caiaque",
    "category": "Viagens & Passeios",
    "points": 25,
    "description": "Se possível na região, aluguem uma canoa ou caiaque e façam um passeio juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-classico-nunca-viram",
    "name": "Assistir a um clássico que nenhum viu",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Escolham um filme clássico famoso que nenhum dos dois assistiu ainda.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-maratona-trilogia-favorita",
    "name": "Maratona de uma trilogia favorita",
    "category": "Filmes & Séries",
    "points": 18,
    "description": "Escolham uma trilogia de filmes favorita e assistam aos 3 filmes ao longo da semana.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-filme-premiado",
    "name": "Assistir a um filme premiado",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Escolham um filme que ganhou um prêmio importante e assistam juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-ranking-filmes-genero",
    "name": "Criar um ranking de filmes de um gênero",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Escolham um gênero (terror, comédia, ficção) e façam juntos um ranking dos favoritos de cada um.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-serie-nova-episodio-piloto",
    "name": "Assistir ao piloto de uma série nova",
    "category": "Filmes & Séries",
    "points": 10,
    "description": "Escolham uma série que nunca viram e assistam ao primeiro episódio juntos para decidir se continuam.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-noite-filme-baseado-livro",
    "name": "Noite de filme baseado em livro",
    "category": "Filmes & Séries",
    "points": 15,
    "description": "Escolham um filme baseado em um livro e assistam, comparando depois com o que conhecem da história.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-curta-animacao",
    "name": "Assistir a curtas de animação",
    "category": "Filmes & Séries",
    "points": 8,
    "description": "Selecionem alguns curtas de animação disponíveis online e assistam juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-trailer-imaginario",
    "name": "Criar um trailer imaginário da vida do casal",
    "category": "Filmes & Séries",
    "points": 18,
    "description": "Narrem juntos como seria o trailer de um filme sobre a história de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-filme-decada-passada",
    "name": "Assistir a um filme de outra década",
    "category": "Filmes & Séries",
    "points": 12,
    "description": "Escolham um filme de uma década diferente da atual e comentem como ele envelheceu.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-votacao-filme-da-noite",
    "name": "Votação para o filme da noite",
    "category": "Filmes & Séries",
    "points": 8,
    "description": "Cada um sugere 2 filmes e decidam juntos, por sorteio ou consenso, qual assistir.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-playlist-por-decada",
    "name": "Criar playlist por década",
    "category": "Música",
    "points": 10,
    "description": "Montem juntos uma playlist com músicas de uma década específica que os dois gostam.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-aprender-instrumento-simples",
    "name": "Aprender a tocar um instrumento simples",
    "category": "Música",
    "points": 18,
    "description": "Escolham um instrumento fácil (ukulele, gaita) e tentem aprender uma música simples juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-dueto-caseiro",
    "name": "Fazer um dueto caseiro",
    "category": "Música",
    "points": 15,
    "description": "Escolham uma música para cantar em dueto, cada um em uma parte, gravando se quiserem.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-descobrir-musica-ano-nascimento",
    "name": "Descobrir a música mais tocada no ano de nascimento",
    "category": "Música",
    "points": 10,
    "description": "Pesquisem qual música foi mais tocada no ano em que cada um nasceu e ouçam juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-playlist-treino",
    "name": "Criar uma playlist de treino ou disposição",
    "category": "Música",
    "points": 8,
    "description": "Montem juntos uma playlist animada para usar em exercícios ou tarefas do dia a dia.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-assistir-documentario-musical",
    "name": "Assistir a um documentário sobre uma banda ou artista",
    "category": "Música",
    "points": 15,
    "description": "Escolham um documentário musical e assistam juntos, conhecendo a história por trás da música.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-jogo-adivinhar-decada-musica",
    "name": "Jogo de adivinhar a década da música",
    "category": "Música",
    "points": 10,
    "description": "Toquem trechos de músicas para o outro tentar adivinhar de qual década ela é.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-criar-hino-do-casal",
    "name": "Criar o 'hino' oficial do casal",
    "category": "Música",
    "points": 12,
    "description": "Escolham juntos uma música que vai representar oficialmente o relacionamento de vocês.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-aprender-coreografia-simples",
    "name": "Aprender uma coreografia simples",
    "category": "Música",
    "points": 15,
    "description": "Sigam um tutorial de dança e aprendam uma coreografia curta juntos.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-normal-m7-noite-musica-ao-vivo-online",
    "name": "Assistir a uma apresentação musical ao vivo online",
    "category": "Música",
    "points": 12,
    "description": "Procurem uma live musical acontecendo online e assistam juntos, como se estivessem no show.",
    "flavor": "normal",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-cartas-verdade-ousada",
    "name": "Jogo de cartas 'verdade ousada'",
    "category": "Hot",
    "points": 18,
    "description": "Criem cartas com perguntas ousadas e sorteiem uma por vez para responder com sinceridade.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-com-chocolate",
    "name": "Massagem sensual com chocolate",
    "category": "Hot",
    "points": 25,
    "description": "Usem chocolate líquido (própria para pele) para uma massagem diferente e saborosa entre os dois.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-dancar-de-olhos-fechados",
    "name": "Dançar de olhos fechados coladinhos",
    "category": "Hot",
    "points": 15,
    "description": "Coloquem uma música lenta e dancem de olhos fechados, sentindo apenas o corpo do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-roleta-desejos",
    "name": "Jogo da roleta dos desejos",
    "category": "Hot",
    "points": 20,
    "description": "Criem uma roleta simples com desejos e sorteiem qual cumprir na noite.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-provocacao-com-batom",
    "name": "Provocação com batom",
    "category": "Hot",
    "points": 15,
    "description": "Usem um batom para marcar pequenos beijos em partes escolhidas pelo parceiro(a).",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-fantasia-personagem",
    "name": "Noite de fantasia com personagem escolhido",
    "category": "Hot",
    "points": 25,
    "description": "Escolham juntos um personagem ou tema para incorporar por uma noite, com roupas que já têm em casa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-relaxante-musica-baixa",
    "name": "Massagem relaxante com música baixa e luz de vela",
    "category": "Hot",
    "points": 22,
    "description": "Preparem o ambiente com luz de vela e música baixa para uma massagem longa e sem pressa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-desejos-realizados",
    "name": "Jogo de desejos já realizados e por realizar",
    "category": "Hot",
    "points": 15,
    "description": "Conversem sobre desejos que já viveram juntos e quais ainda querem experimentar.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-dança-cadeira-sensual",
    "name": "Dança sensual com cadeira",
    "category": "Hot",
    "points": 20,
    "description": "Usem uma cadeira como apoio para uma dança sensual, sem pressa, seguindo o ritmo da música.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-bilhetes-espalhados-desejos",
    "name": "Bilhetes espalhados com pequenos desejos",
    "category": "Hot",
    "points": 15,
    "description": "Espalhem bilhetes pela casa com pequenos desejos para cumprirem ao longo do dia.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-bloqueio-toque",
    "name": "Jogo do 'bloqueio' - toque proibido",
    "category": "Hot",
    "points": 18,
    "description": "Um define uma área do corpo 'proibida' e o outro tenta tocar em todo o resto, driblando a regra.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-photoshoot-casal-intimista",
    "name": "Ensaio fotográfico intimista do casal",
    "category": "Hot",
    "points": 22,
    "description": "Façam um ensaio de fotos mais íntimo e guardado apenas para os dois, em ambiente confortável.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-o-que-voce-faria",
    "name": "Jogo 'o que você faria se...' picante",
    "category": "Hot",
    "points": 18,
    "description": "Façam perguntas hipotéticas mais ousadas um ao outro, respondendo com sinceridade e humor.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-com-plumas-e-gelo",
    "name": "Massagem alternando plumas e gelo",
    "category": "Hot",
    "points": 22,
    "description": "Alternem toques com plumas macias e cubos de gelo para brincar com sensações diferentes.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-so-toque-sem-palavras",
    "name": "Noite de comunicação só por toque",
    "category": "Hot",
    "points": 20,
    "description": "Passem um tempo se comunicando apenas por toques e olhares, sem falar nada.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-strip-cartas",
    "name": "Jogo de cartas com prenda de roupa",
    "category": "Hot",
    "points": 20,
    "description": "Joguem um jogo de cartas simples e quem perder tira uma peça de roupa ou cumpre um desafio.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-dança-sensual-vendada",
    "name": "Dança sensual com um de olhos vendados",
    "category": "Hot",
    "points": 20,
    "description": "Um dança de olhos vendados guiado apenas pelo toque e voz do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-carta-fantasia-anonima",
    "name": "Escrever uma fantasia em carta anônima",
    "category": "Hot",
    "points": 15,
    "description": "Escrevam uma fantasia em um papel sem assinar e troquem para o outro ler em voz alta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-banho-de-espuma-compartilhado",
    "name": "Banho de espuma compartilhado",
    "category": "Hot",
    "points": 25,
    "description": "Preparem um banho de espuma com velas e aproveitem um tempo relaxante juntos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-limites-desejos",
    "name": "Conversa sobre limites e desejos",
    "category": "Hot",
    "points": 15,
    "description": "Conversem abertamente sobre o que gostam e o que não gostam, fortalecendo a confiança entre vocês.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-oleo-quente",
    "name": "Massagem com óleo morno",
    "category": "Hot",
    "points": 25,
    "description": "Aqueçam levemente um óleo de massagem (temperatura segura) e façam uma massagem revezada.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-fantasias-realizar",
    "name": "Escolher uma fantasia leve para realizar",
    "category": "Hot",
    "points": 22,
    "description": "Conversem e escolham juntos uma fantasia leve e consensual para experimentar na semana.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-roupa-intima-escolhida-por-outro",
    "name": "Escolher a roupa íntima do outro",
    "category": "Hot",
    "points": 20,
    "description": "Cada um escolhe uma peça para o parceiro(a) usar na noite, como uma surpresa carinhosa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-primeira-vez",
    "name": "Conversa sobre primeiras vezes",
    "category": "Hot",
    "points": 12,
    "description": "Conversem sobre primeiras experiências marcantes do relacionamento, com carinho e sem comparação.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-provocacao-espelho",
    "name": "Provocação em frente ao espelho",
    "category": "Hot",
    "points": 18,
    "description": "Fiquem em frente ao espelho e façam elogios e provocações carinhosas um ao outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-cartas-desafios-crescentes",
    "name": "Jogo de cartas com desafios crescentes",
    "category": "Hot",
    "points": 22,
    "description": "Criem cartas com desafios que aumentam de intensidade a cada rodada jogada.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-so-nas-costas-demorada",
    "name": "Massagem demorada apenas nas costas",
    "category": "Hot",
    "points": 18,
    "description": "Dediquem 15 minutos só para massagear as costas um do outro, sem pressa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-so-abraco-conversa-intima",
    "name": "Noite de abraço e conversa íntima",
    "category": "Hot",
    "points": 15,
    "description": "Fiquem abraçados conversando sobre sentimentos e desejos, sem celular, por pelo menos 20 minutos.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-roleta-beijos",
    "name": "Roleta dos beijos",
    "category": "Hot",
    "points": 15,
    "description": "Criem uma roleta simples definindo onde o próximo beijo vai ser dado.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-danca-lenta-luz-vela",
    "name": "Dança lenta só à luz de velas",
    "category": "Hot",
    "points": 18,
    "description": "Apaguem as luzes, acendam velas e dancem juntos ao som de uma música lenta.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-o-que-me-atrai",
    "name": "Jogo 'o que me atrai em você'",
    "category": "Hot",
    "points": 12,
    "description": "Digam um ao outro, em detalhes, o que mais atrai fisicamente e emocionalmente no parceiro(a).",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-provocacao-mensagem-durante-tarefa",
    "name": "Provocação por mensagem durante uma tarefa",
    "category": "Hot",
    "points": 12,
    "description": "Enviem uma mensagem provocante enquanto um dos dois está fazendo uma tarefa em outro cômodo.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-so-carinho-sem-pressa-final",
    "name": "Noite dedicada só a carinho, sem pressa",
    "category": "Hot",
    "points": 22,
    "description": "Reservem uma noite inteira para se dedicarem só ao carinho físico, sem pressa e sem metas.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-cartas-elogios-corpo",
    "name": "Jogo de elogios ao corpo do outro",
    "category": "Hot",
    "points": 15,
    "description": "Façam uma rodada de elogios sinceros sobre o corpo e a presença física um do outro.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-massagem-com-musica-escolhida-a-dois",
    "name": "Massagem com playlist escolhida a dois",
    "category": "Hot",
    "points": 18,
    "description": "Montem uma playlist para o momento e façam uma massagem revezada ao som dela.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-perguntas-fantasia-favorita",
    "name": "Compartilhar a fantasia favorita",
    "category": "Hot",
    "points": 18,
    "description": "Compartilhem, com liberdade e sem julgamento, qual é a fantasia favorita de cada um.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-jantar-e-sobremesa-na-cama",
    "name": "Jantar e sobremesa na cama",
    "category": "Hot",
    "points": 20,
    "description": "Levem o jantar e a sobremesa para a cama e aproveitem uma noite mais íntima e preguiçosa.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-provocacao-troca-perfume",
    "name": "Provocação com troca de perfume",
    "category": "Hot",
    "points": 12,
    "description": "Usem o perfume um do outro por um dia e comentem como se sentiram com o cheiro do parceiro(a).",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-jogo-desafio-resistencia-cocegas",
    "name": "Desafio de resistência às cócegas",
    "category": "Hot",
    "points": 12,
    "description": "Façam cócegas leves um no outro e vejam quem resiste mais sem rir.",
    "flavor": "hot",
    "active": true
  },
  {
    "id": "act-hot-m7-noite-so-perfume-vela-penumbra",
    "name": "Noite de penumbra com vela e perfume",
    "category": "Hot",
    "points": 20,
    "description": "Apaguem as luzes, acendam uma vela perfumada e aproveitem um tempo de intimidade na penumbra.",
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
  },
  {
    "id": "week-m6-tres-conversas-profundas",
    "title": "3 conversas profundas",
    "description": "Tenham pelo menos 3 conversas profundas sem celular por perto durante a semana",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m6-check-in-diario",
    "title": "Check-in diário",
    "description": "Reservem 10 minutos por dia para perguntar como o outro está se sentindo",
    "points": 10,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m6-sem-distracoes-refeicao",
    "title": "Refeição sem distrações",
    "description": "Façam uma refeição juntos sem celular pelo menos 3 vezes na semana",
    "points": 10,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m6-tres-risadas-garantidas",
    "title": "3 risadas garantidas",
    "description": "Façam pelo menos 3 coisas juntos que os façam rir de verdade durante a semana",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m6-brincadeira-do-dia",
    "title": "Brincadeira inventada",
    "description": "Inventem uma brincadeira nova e repitam em pelo menos 3 dias diferentes",
    "points": 12,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m6-meme-do-dia",
    "title": "Meme do dia",
    "description": "Enviem um meme ou piada engraçada um para o outro todos os dias da semana",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m6-surpresa-romantica",
    "title": "Surpresa romântica",
    "description": "Preparem pelo menos uma surpresa romântica um para o outro durante a semana",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m6-bilhetes-de-amor",
    "title": "3 bilhetes de amor",
    "description": "Deixem 3 bilhetes carinhosos escondidos pela casa durante a semana",
    "points": 10,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m6-noite-romantica",
    "title": "Noite romântica",
    "description": "Organizem uma noite especial só dos dois, sem distrações, durante a semana",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m6-gratidao-diaria",
    "title": "Gratidão diária",
    "description": "Digam um motivo de gratidão pelo outro todos os dias da semana",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m6-elogio-sincero",
    "title": "5 elogios sinceros",
    "description": "Façam pelo menos 5 elogios verdadeiros um ao outro durante a semana",
    "points": 8,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m6-carta-reconhecimento",
    "title": "Carta de reconhecimento",
    "description": "Escrevam uma carta reconhecendo o esforço do parceiro(a) nessa semana",
    "points": 12,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m6-tarefa-em-dupla",
    "title": "Tarefa em dupla",
    "description": "Façam uma tarefa doméstica juntos pelo menos 2 vezes na semana",
    "points": 10,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m6-cafe-manha-junto",
    "title": "Café da manhã junto",
    "description": "Tomem café da manhã juntos pelo menos 4 dias na semana",
    "points": 10,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m6-hora-sagrada",
    "title": "Hora sagrada",
    "description": "Reservem 30 minutos por dia só para ficarem juntos, sem interrupções",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m6-planejar-mes",
    "title": "Planejar o mês",
    "description": "Planejem juntos pelo menos um compromisso ou passeio para o próximo mês",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m6-metas-do-casal",
    "title": "Metas do casal",
    "description": "Definam 2 metas para o relacionamento nos próximos 3 meses",
    "points": 15,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m6-orcamento-a-dois",
    "title": "Orçamento a dois",
    "description": "Revisem juntos as finanças do mês e planejem um objetivo comum",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m6-surpresa-da-semana",
    "title": "Surpresa da semana",
    "description": "Preparem pelo menos uma surpresa (pequena ou grande) um para o outro",
    "points": 12,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m6-presente-inesperado",
    "title": "Presente inesperado",
    "description": "Deem um presente simples e inesperado um ao outro durante a semana",
    "points": 10,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m6-convite-surpresa",
    "title": "Convite surpresa",
    "description": "Convidem o parceiro(a) para uma atividade sem avisar antes",
    "points": 10,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m6-relembrar-comeco",
    "title": "Relembrar o começo",
    "description": "Conversem sobre como se conheceram e relembrem detalhes esquecidos",
    "points": 10,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m6-album-da-semana",
    "title": "Álbum da semana",
    "description": "Organizem fotos antigas do casal em um álbum ou pasta durante a semana",
    "points": 12,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m6-diario-de-casal",
    "title": "Diário de casal",
    "description": "Escrevam juntos 3 memórias felizes do relacionamento",
    "points": 10,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m6-hidratacao-em-dupla",
    "title": "Hidratação em dupla",
    "description": "Incentivem um ao outro a beber mais água durante a semana",
    "points": 6,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m6-sono-em-dia",
    "title": "Sono em dia",
    "description": "Ajudem um ao outro a dormir cedo pelo menos 4 noites na semana",
    "points": 8,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m6-refeicao-saudavel",
    "title": "Refeição saudável",
    "description": "Preparem juntos pelo menos 3 refeições saudáveis durante a semana",
    "points": 10,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m6-playlist-da-semana",
    "title": "Playlist da semana",
    "description": "Criem juntos uma playlist nova com pelo menos 10 músicas",
    "points": 8,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m6-show-em-casa",
    "title": "Show em casa",
    "description": "Façam uma apresentação musical (cantando ou dançando) um para o outro",
    "points": 10,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m6-musica-do-dia",
    "title": "Música do dia",
    "description": "Enviem uma música que representa o sentimento do dia, todos os dias da semana",
    "points": 8,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m6-conversa-sem-julgamento",
    "title": "Conversa sem julgamento",
    "description": "Conversem sobre um assunto difícil sem interromper um ao outro",
    "points": 12,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m6-elogio-diario-mensagem",
    "title": "Elogio diário por mensagem",
    "description": "Enviem uma mensagem carinhosa todos os dias da semana",
    "points": 8,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m6-feedback-gentil",
    "title": "Feedback gentil",
    "description": "Compartilhem um feedback construtivo e um elogio um para o outro",
    "points": 10,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m6-novo-lugar",
    "title": "Novo lugar",
    "description": "Visitem um lugar que nenhum dos dois conhece na cidade",
    "points": 15,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m6-desafio-de-coragem",
    "title": "Desafio de coragem",
    "description": "Façam juntos algo que tira vocês da zona de conforto",
    "points": 15,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m6-rota-alternativa",
    "title": "Rota alternativa",
    "description": "Façam um trajeto diferente do habitual e explorem o caminho juntos",
    "points": 8,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m6-projeto-criativo",
    "title": "Projeto criativo",
    "description": "Criem juntos algo artístico (desenho, escrita, artesanato) durante a semana",
    "points": 12,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m6-historia-inventada",
    "title": "História inventada",
    "description": "Escrevam uma história curta alternando frases um do outro",
    "points": 10,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m6-reforma-criativa",
    "title": "Reforma criativa",
    "description": "Decorem ou personalizem um espaço da casa juntos durante a semana",
    "points": 15,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m6-ar-livre-3x",
    "title": "Ar livre 3x",
    "description": "Façam pelo menos 3 atividades ao ar livre juntos durante a semana",
    "points": 12,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m6-trilha-ou-caminhada",
    "title": "Trilha ou caminhada",
    "description": "Façam uma caminhada ou trilha juntos pelo menos uma vez na semana",
    "points": 12,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m6-piquenique-ao-ar-livre",
    "title": "Piquenique ao ar livre",
    "description": "Organizem um piquenique em um parque ou praça durante a semana",
    "points": 12,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m6-semana-sem-brigas",
    "title": "Semana sem brigas",
    "description": "Pratiquem paciência e evitem discussões desnecessárias durante a semana",
    "points": 14,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m6-momento-de-respirar",
    "title": "Momento de respirar",
    "description": "Façam uma pausa de respiração ou meditação juntos 3 vezes na semana",
    "points": 10,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m6-cuidado-mutuo",
    "title": "Cuidado mútuo",
    "description": "Façam algo que cuide do bem-estar físico ou emocional do outro durante a semana",
    "points": 12,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m6-aprender-juntos",
    "title": "Aprender juntos",
    "description": "Aprendam uma habilidade nova juntos durante a semana",
    "points": 12,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m6-livro-a-dois",
    "title": "Livro a dois",
    "description": "Leiam um capítulo de livro juntos e conversem sobre ele",
    "points": 10,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m6-reflexao-do-casal",
    "title": "Reflexão do casal",
    "description": "Conversem sobre o que querem melhorar como casal",
    "points": 10,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m6-tres-atividades-novas",
    "title": "3 atividades novas",
    "description": "Experimentem pelo menos 3 atividades que nunca fizeram juntos",
    "points": 15,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m6-jogo-em-dupla",
    "title": "Jogo em dupla",
    "description": "Joguem um jogo (de tabuleiro, cartas ou vídeo game) juntos durante a semana",
    "points": 8,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m6-hobby-compartilhado",
    "title": "Hobby compartilhado",
    "description": "Dediquem tempo a um hobby que os dois gostem durante a semana",
    "points": 10,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m6-maratona-cultural",
    "title": "Maratona cultural",
    "description": "Assistam a pelo menos 2 filmes ou séries diferentes juntos durante a semana",
    "points": 10,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m6-show-ou-evento",
    "title": "Show ou evento",
    "description": "Assistam a um show, peça ou evento cultural juntos (presencial ou online)",
    "points": 15,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m6-noite-de-jogos",
    "title": "Noite de jogos",
    "description": "Organizem uma noite de jogos com regras criadas por vocês",
    "points": 10,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m6-abraco-diario",
    "title": "Abraço diário",
    "description": "Deem pelo menos um abraço demorado todos os dias da semana",
    "points": 8,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m6-exercicio-a-dois",
    "title": "Exercício a dois",
    "description": "Façam uma atividade física juntos pelo menos 2 vezes na semana",
    "points": 12,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m6-contato-sem-pressa",
    "title": "Contato sem pressa",
    "description": "Reservem um tempo para carinho físico sem pressa, sem celular, durante a semana",
    "points": 12,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m6-declaracao-da-semana",
    "title": "Declaração da semana",
    "description": "Façam uma declaração de amor sincera um para o outro durante a semana",
    "points": 10,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-m6-danca-a-dois",
    "title": "Dança a dois",
    "description": "Dancem juntos pelo menos uma música lenta durante a semana",
    "points": 8,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-m6-reviver-primeiro-encontro",
    "title": "Reviver o primeiro encontro",
    "description": "Recriem um detalhe especial do primeiro encontro de vocês durante a semana",
    "points": 15,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-m7-escuta-ativa",
    "title": "Escuta ativa",
    "description": "Pratiquem escutar um ao outro até o fim, sem interromper, em pelo menos 3 conversas na semana",
    "points": 12,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m7-pergunta-do-dia",
    "title": "Pergunta do dia",
    "description": "Façam uma pergunta pessoal nova um ao outro todos os dias da semana",
    "points": 8,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m7-momento-so-nos-dois",
    "title": "Momento só nós dois",
    "description": "Reservem um momento sem filhos, trabalho ou tela por pelo menos 3 vezes na semana",
    "points": 14,
    "type": "connection",
    "active": true
  },
  {
    "id": "week-m7-desafio-risada-diaria",
    "title": "Desafio da risada diária",
    "description": "Façam algo engraçado juntos todos os dias da semana, nem que seja assistir a um vídeo curto",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m7-jogo-diferente-semana",
    "title": "Jogo diferente",
    "description": "Experimentem um jogo que nunca jogaram juntos durante a semana",
    "points": 10,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m7-desafio-bobagem-controlada",
    "title": "Desafio da bobagem controlada",
    "description": "Façam pelo menos uma coisa bem boba e divertida juntos essa semana",
    "points": 8,
    "type": "fun",
    "active": true
  },
  {
    "id": "week-m7-flerte-diario",
    "title": "Flerte diário",
    "description": "Flertem um com o outro pelo menos uma vez por dia durante a semana",
    "points": 10,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m7-encontro-em-casa",
    "title": "Encontro romântico em casa",
    "description": "Organizem um 'date night' completo dentro de casa, com clima especial",
    "points": 15,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m7-presente-simbolico",
    "title": "Presente simbólico",
    "description": "Deem um presente simples que tenha um significado especial para o relacionamento",
    "points": 12,
    "type": "romance",
    "active": true
  },
  {
    "id": "week-m7-reconhecer-esforco-diario",
    "title": "Reconhecer o esforço diário",
    "description": "Reconheçam verbalmente algo que o outro fez de bom todos os dias da semana",
    "points": 8,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m7-lista-qualidades",
    "title": "Lista de qualidades",
    "description": "Façam uma lista das qualidades que mais admiram no parceiro(a) e compartilhem",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m7-agradecer-por-escrito",
    "title": "Agradecer por escrito",
    "description": "Escrevam um agradecimento por escrito por algo específico que o outro fez essa semana",
    "points": 10,
    "type": "appreciation",
    "active": true
  },
  {
    "id": "week-m7-projeto-em-equipe",
    "title": "Projeto em equipe",
    "description": "Comecem e avancem juntos em um pequeno projeto da casa durante a semana",
    "points": 14,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m7-caminhada-diaria",
    "title": "Caminhada diária",
    "description": "Façam uma caminhada juntos pelo menos 3 vezes durante a semana",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m7-noite-sem-tela",
    "title": "Noite sem tela",
    "description": "Passem pelo menos uma noite completa sem TV ou celular, só conversando ou brincando",
    "points": 12,
    "type": "together",
    "active": true
  },
  {
    "id": "week-m7-planejar-proximo-passeio",
    "title": "Planejar o próximo passeio",
    "description": "Pesquisem e planejem juntos um passeio para as próximas semanas",
    "points": 10,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m7-organizar-agenda-semanal",
    "title": "Organizar a agenda semanal juntos",
    "description": "Revisem juntos os compromissos da semana seguinte e organizem um cronograma",
    "points": 10,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m7-planejar-data-especial",
    "title": "Planejar uma data especial futura",
    "description": "Comecem a planejar juntos como será uma data importante que está chegando",
    "points": 12,
    "type": "planning",
    "active": true
  },
  {
    "id": "week-m7-surpresa-no-trabalho",
    "title": "Surpresa relacionada ao trabalho",
    "description": "Façam uma surpresa leve relacionada ao dia de trabalho do outro (mensagem, lanche, bilhete)",
    "points": 10,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m7-mudanca-de-rotina",
    "title": "Mudança de rotina surpresa",
    "description": "Alterem algo pequeno na rotina para surpreender o parceiro(a) durante a semana",
    "points": 10,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m7-encontro-marcado-as-cegas",
    "title": "Encontro marcado 'às cegas'",
    "description": "Um organiza um encontro surpresa sem revelar os detalhes ao outro antes",
    "points": 15,
    "type": "surprise",
    "active": true
  },
  {
    "id": "week-m7-revisitar-fotos-antigas",
    "title": "Revisitar fotos antigas",
    "description": "Escolham 10 fotos antigas do casal e relembrem juntos as histórias por trás delas",
    "points": 10,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m7-contar-historia-favorita",
    "title": "Contar a história favorita do relacionamento",
    "description": "Cada um conta qual é a lembrança favorita que tem do relacionamento",
    "points": 10,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m7-recriar-momento-marcante",
    "title": "Recriar um momento marcante",
    "description": "Escolham um momento marcante do relacionamento e tentem recriá-lo de alguma forma",
    "points": 15,
    "type": "memory",
    "active": true
  },
  {
    "id": "week-m7-caminhada-ativa-semana",
    "title": "Caminhada ativa na semana",
    "description": "Façam uma caminhada mais intensa ou corrida leve juntos pelo menos 2 vezes na semana",
    "points": 10,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m7-refeicao-sem-processados",
    "title": "Refeição sem processados",
    "description": "Preparem pelo menos 2 refeições sem alimentos processados durante a semana",
    "points": 10,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m7-pausa-para-descanso",
    "title": "Pausa para descanso",
    "description": "Garantam juntos pelo menos uma pausa de descanso real por dia durante a semana",
    "points": 8,
    "type": "health",
    "active": true
  },
  {
    "id": "week-m7-playlist-tematica-semana",
    "title": "Playlist temática da semana",
    "description": "Criem uma playlist com um tema específico escolhido pelos dois",
    "points": 8,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m7-descobrir-genero-musical-novo",
    "title": "Descobrir um gênero musical novo",
    "description": "Explorem juntos um gênero musical que nenhum costuma ouvir",
    "points": 10,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m7-cantar-no-carro",
    "title": "Cantar juntos no carro ou em casa",
    "description": "Cantem juntos pelo menos 3 músicas ao longo da semana, onde estiverem",
    "points": 8,
    "type": "music",
    "active": true
  },
  {
    "id": "week-m7-conversa-sem-interrupcao",
    "title": "Conversa sem interrupção",
    "description": "Tenham pelo menos uma conversa de 15 minutos sem interrupções ou celular por perto",
    "points": 12,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m7-expressar-necessidade",
    "title": "Expressar uma necessidade",
    "description": "Cada um compartilha uma necessidade ou desejo que gostaria que o outro soubesse",
    "points": 12,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m7-resolver-pendencia-conversa",
    "title": "Resolver uma pendência por conversa",
    "description": "Conversem e resolvam juntos algo que estava pendente entre vocês",
    "points": 14,
    "type": "communication",
    "active": true
  },
  {
    "id": "week-m7-experimentar-comida-nova",
    "title": "Experimentar uma comida nova",
    "description": "Provem juntos um alimento ou prato que nenhum dos dois já experimentou",
    "points": 10,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m7-trajeto-diferente-trabalho",
    "title": "Trajeto diferente",
    "description": "Façam juntos um trajeto diferente do habitual para algum lugar durante a semana",
    "points": 8,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m7-atividade-fora-da-zona-conforto",
    "title": "Atividade fora da zona de conforto",
    "description": "Façam juntos uma atividade que tira os dois da zona de conforto",
    "points": 15,
    "type": "adventure",
    "active": true
  },
  {
    "id": "week-m7-criar-algo-com-as-maos",
    "title": "Criar algo com as próprias mãos",
    "description": "Façam juntos uma criação manual (desenho, artesanato, receita) durante a semana",
    "points": 12,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m7-escrever-poema-a-dois",
    "title": "Escrever um poema a dois",
    "description": "Escrevam juntos um poema curto sobre o relacionamento, alternando versos",
    "points": 10,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m7-decorar-espaco-pequeno",
    "title": "Decorar um espaço pequeno da casa",
    "description": "Personalizem juntos um cantinho da casa com algo criativo",
    "points": 12,
    "type": "creative",
    "active": true
  },
  {
    "id": "week-m7-observar-estrelas",
    "title": "Observar as estrelas juntos",
    "description": "Reservem uma noite para observar o céu estrelado juntos, ao ar livre",
    "points": 10,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m7-praticar-esporte-ao-ar-livre",
    "title": "Praticar esporte ao ar livre",
    "description": "Façam juntos um esporte ao ar livre pelo menos uma vez na semana",
    "points": 12,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m7-passeio-parque-semanal",
    "title": "Passeio semanal ao parque",
    "description": "Visitem um parque ou área verde juntos pelo menos uma vez na semana",
    "points": 10,
    "type": "outdoor",
    "active": true
  },
  {
    "id": "week-m7-praticar-paciencia",
    "title": "Praticar paciência",
    "description": "Escolham conscientemente ser mais pacientes um com o outro durante a semana",
    "points": 10,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m7-dia-de-descanso-total",
    "title": "Dia de descanso total",
    "description": "Reservem um dia (ou parte dele) só para descansar juntos, sem compromissos",
    "points": 12,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m7-gesto-de-cuidado-diario",
    "title": "Gesto de cuidado diário",
    "description": "Façam um pequeno gesto de cuidado com o outro todos os dias da semana",
    "points": 10,
    "type": "wellness",
    "active": true
  },
  {
    "id": "week-m7-assistir-palestra-juntos",
    "title": "Assistir a uma palestra ou vídeo educativo",
    "description": "Escolham um vídeo educativo sobre relacionamento ou um tema de interesse comum e assistam juntos",
    "points": 10,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m7-definir-valor-comum",
    "title": "Definir um valor comum do casal",
    "description": "Conversem e definam juntos um valor que querem cultivar no relacionamento",
    "points": 12,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m7-ler-artigo-sobre-casais",
    "title": "Ler um artigo sobre relacionamentos",
    "description": "Leiam juntos um artigo sobre relacionamentos e conversem sobre o que aprenderam",
    "points": 8,
    "type": "growth",
    "active": true
  },
  {
    "id": "week-m7-experimentar-hobby-novo",
    "title": "Experimentar um hobby novo",
    "description": "Experimentem juntos um hobby que nenhum dos dois já praticou",
    "points": 14,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m7-repetir-atividade-favorita",
    "title": "Repetir a atividade favorita do casal",
    "description": "Façam de novo a atividade que mais gostaram até agora no relacionamento",
    "points": 10,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m7-atividade-ao-ar-livre-semana",
    "title": "Atividade ao ar livre na semana",
    "description": "Façam pelo menos uma atividade ao ar livre juntos durante a semana",
    "points": 10,
    "type": "activities",
    "active": true
  },
  {
    "id": "week-m7-assistir-stand-up",
    "title": "Assistir a um show de stand-up comedy",
    "description": "Assistam juntos a um show de stand-up comedy, presencial ou por streaming",
    "points": 10,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m7-jogo-de-tabuleiro-longo",
    "title": "Jogo de tabuleiro mais longo",
    "description": "Joguem um jogo de tabuleiro mais elaborado que dure pelo menos uma hora",
    "points": 12,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m7-teatro-ou-cinema",
    "title": "Ir ao teatro ou cinema",
    "description": "Assistam juntos a uma peça de teatro ou filme no cinema durante a semana",
    "points": 15,
    "type": "entertainment",
    "active": true
  },
  {
    "id": "week-m7-toque-diario-consciente",
    "title": "Toque diário consciente",
    "description": "Façam pelo menos um toque carinhoso consciente por dia (mão, ombro, cabelo)",
    "points": 8,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m7-alongamento-a-dois",
    "title": "Alongamento a dois",
    "description": "Façam uma sessão de alongamento juntos pelo menos 2 vezes na semana",
    "points": 8,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m7-dormir-abracados",
    "title": "Dormir abraçados",
    "description": "Durmam abraçados pelo menos 3 noites durante a semana",
    "points": 10,
    "type": "physical",
    "active": true
  },
  {
    "id": "week-m7-elogio-fisico-sincero",
    "title": "Elogio físico sincero",
    "description": "Façam um elogio físico sincero um ao outro todos os dias da semana",
    "points": 8,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-m7-carta-romantica-semana",
    "title": "Carta romântica da semana",
    "description": "Escrevam uma carta romântica curta para o outro ler durante a semana",
    "points": 12,
    "type": "romantic",
    "active": true
  },
  {
    "id": "week-m7-recriar-pedido-namoro",
    "title": "Recriar o momento do pedido de namoro/casamento",
    "description": "Relembrem e recriem, de forma simbólica, o momento em que ficaram juntos oficialmente",
    "points": 15,
    "type": "romantic",
    "active": true
  }
];
