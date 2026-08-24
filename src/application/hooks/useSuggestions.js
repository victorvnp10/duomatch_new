import { useState, useEffect, useCallback, useMemo } from "react";
import {
  db,
  doc,
  onSnapshot,
  serverTimestamp,
  runTransaction,
} from "../../infrastructure/firebase";
import { getTodayDateString } from "../../shared/utils";

// Gera um objeto de sugestões aleatórias no formato persistido
// (chamado apenas DENTRO de transações, para concorrência segura).
const buildRandomSuggestions = (pool) => {
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).reduce((acc, s, index) => {
    const id = `sug_${index}`;
    acc[id] = {
      ...s,
      id,
      selections: {},
      matched: false,
      type: "atividade",
      periodicity: null,
    };
    return acc;
  }, {});
};

// Repositório expandido de sugestões sensuais - 60+ opções para variedade máxima
const hotSuggestionPool = [
  {
    name: "Jogo dos 5 Sentidos",
    category: "Hot",
    points: 20,
    description:
      "Separe 5 itens para estimular cada sentido (visão, olfato, paladar, tato, audição) e use-os para provocar seu parceiro(a) de olhos vendados.",
  },
  {
    name: "Vale-Striptease Exclusivo",
    category: "Hot",
    points: 15,
    description:
      "Escolha a música, a iluminação e prepare uma dança sensual surpresa para o seu amor.",
  },
  {
    name: "Cozinhando de Avental... e só!",
    category: "Hot",
    points: 20,
    description:
      "Preparem uma refeição juntos vestindo apenas aventais. O risco de se sujar nunca foi tão divertido.",
  },
  {
    name: "Sessão de Fotos Boudoir",
    category: "Hot",
    points: 25,
    description:
      "Seja com o celular ou uma câmera, criem um ambiente e façam uma sessão de fotos íntimas e sensuais um do outro.",
  },
  {
    name: "Caça ao Tesouro Picante",
    category: "Hot",
    points: 15,
    description:
      "Esconda pistas pela casa que levem a um 'tesouro' final, como uma lingerie nova, um brinquedo ou você.",
  },
  {
    name: "Leitura de Contos Eróticos",
    category: "Hot",
    points: 10,
    description:
      "Encontrem ou escrevam pequenos contos eróticos e leiam em voz alta um para o outro, com a entonação certa.",
  },
  {
    name: "Poker Strip",
    category: "Hot",
    points: 10,
    description:
      "Uma partida de qualquer jogo de cartas onde a aposta para o perdedor da rodada é tirar uma peça de roupa.",
  },
  {
    name: "Recriando um Beijo de Cinema",
    category: "Hot",
    points: 15,
    description:
      "Escolham a cena de beijo mais icônica de um filme e se dediquem a recriá-la nos mínimos detalhes.",
  },
  {
    name: "Pintura Corporal Comestível",
    category: "Hot",
    points: 20,
    description:
      "Use chocolate derretido, chantilly ou caldas de sobremesa para pintar o corpo um do outro. A 'limpeza' é a melhor parte.",
  },
  {
    name: "Uma Noite como Estranhos",
    category: "Hot",
    points: 25,
    description:
      "Marquem de se encontrar em um bar como se nunca tivessem se visto. Usem a criatividade para seduzir e 'conquistar' um ao outro de novo.",
  },
  {
    name: "Degustação às Cegas",
    category: "Hot",
    points: 15,
    description:
      "Vende os olhos do(a) parceiro(a) e dê diferentes alimentos (morangos, chocolate, mel) para ele(a) provar, usando a boca ou o corpo.",
  },
  {
    name: "Café da Manhã na Cama (com um extra)",
    category: "Hot",
    points: 15,
    description:
      "Surpreenda seu amor com um café da manhã na cama, e ofereça-se como 'prato principal'.",
  },
  {
    name: "Vale-Áudio Provocante",
    category: "Hot",
    points: 10,
    description:
      "No meio do dia, envie um áudio inesperado descrevendo uma fantasia ou o que você gostaria de fazer mais tarde.",
  },
  {
    name: "Desafio do Gelo",
    category: "Hot",
    points: 10,
    description:
      "Use uma pedra de gelo para percorrer e beijar o corpo um do outro, explorando as sensações de quente e frio.",
  },
  {
    name: "Noite de Fondue no Quarto",
    category: "Hot",
    points: 20,
    description:
      "Prepare um fondue de queijo ou chocolate e comam na cama ou no chão do quarto, sem regras de etiqueta.",
  },
  {
    name: "Criar uma Playlist 'Proibida'",
    category: "Hot",
    points: 10,
    description:
      "Juntos, criem uma playlist com as músicas mais sensuais que conhecem para servir de trilha sonora para os momentos a sós.",
  },
  {
    name: "Massagem nos Pés... que Sobe",
    category: "Hot",
    points: 15,
    description:
      "Comece com uma massagem relaxante nos pés e, lentamente, vá subindo e explorando o resto do corpo.",
  },
  {
    name: "Escolher um Sex Toy Juntos",
    category: "Hot",
    points: 15,
    description:
      "Seja online ou numa loja física, divirtam-se escolhendo um novo brinquedo para apimentar a relação.",
  },
  {
    name: "Um Dia 'Mãos Livres'",
    category: "Hot",
    points: 25,
    description:
      "O desafio é passar o dia (ou algumas horas) se tocando e se beijando sem usar as mãos. Usem a criatividade e o corpo!",
  },
  {
    name: "Sussurros de Fantasias",
    category: "Hot",
    points: 20,
    description:
      "Apaguem as luzes e deitem-se de conchinha. Cada um sussurra no ouvido do outro uma fantasia secreta.",
  },
  {
    name: "Dança Íntima no Escuro",
    category: "Hot",
    points: 15,
    description:
      "Coloquem uma música lenta, apaguem as luzes e dancem bem abraçados no meio da sala, sentindo cada movimento.",
  },
  {
    name: "A Primeira Mensagem",
    category: "Hot",
    points: 10,
    description:
      "Encontrem e releiam as primeiras mensagens que trocaram. Tentem recriar a empolgação daquele início.",
  },
  {
    name: "Vale-Banho de Espuma Surpresa",
    category: "Hot",
    points: 20,
    description:
      "Prepare um banho de banheira (ou um chuveiro especial) com velas, música e espuma para quando seu amor chegar em casa.",
  },
  {
    name: "Kama Sutra Challenge",
    category: "Hot",
    points: 20,
    description:
      "Abram o Kama Sutra (livro ou app) em uma página aleatória e se comprometam a tentar a posição que aparecer.",
  },
  {
    name: "Jantar Temático Sensual",
    category: "Hot",
    points: 25,
    description:
      "Escolham um tema (árabe, japonês, etc) e preparem tudo: a comida, a música, a roupa. Comam no chão, com as mãos, e entrem no personagem.",
  },
  {
    name: "Guerra de Cócegas (com rendição)",
    category: "Hot",
    points: 10,
    description:
      "Comece uma guerra de cócegas. O 'perdedor' tem que se render e cumprir um desejo do 'vencedor'.",
  },
  {
    name: "Beijo de 3 Minutos",
    category: "Hot",
    points: 15,
    description:
      "Coloque um cronômetro para 3 minutos. Durante esse tempo, vocês devem dar um beijo ininterrupto, explorando diferentes ritmos e intensidades.",
  },
  {
    name: "Mapa do Corpo",
    category: "Hot",
    points: 20,
    description:
      "De olhos vendados, um deve 'mapear' o corpo do outro usando apenas os lábios e a ponta da língua.",
  },
  {
    name: "Noite de Jogos de Tabuleiro Adulto",
    category: "Hot",
    points: 15,
    description:
      "Comprem ou criem um jogo de tabuleiro com casas que tenham desafios, perguntas íntimas e recompensas picantes.",
  },
  {
    name: "Um Elogio por Hora",
    category: "Hot",
    points: 10,
    description:
      "Durante um dia, enviem a cada hora um elogio um para o outro, começando inocente e terminando mais ousado.",
  },
  {
    name: "Adivinhe a Palavra",
    category: "Hot",
    points: 10,
    description:
      "Um escreve uma palavra (relacionada a desejo ou amor) nas costas do outro com o dedo. O outro tem que adivinhar.",
  },
  {
    name: "Banho de Piscina (ou Mar) à Noite",
    category: "Hot",
    points: 25,
    description:
      "Se tiverem acesso, um mergulho noturno a sós pode ser extremamente excitante e libertador.",
  },
  {
    name: "Concurso de Gemidos",
    category: "Hot",
    points: 15,
    description:
      "Uma brincadeira boba e excitante: quem consegue fazer o gemido mais convincente ou criativo? A risada é garantida.",
  },
  {
    name: "Assistir ao Pôr do Sol com 'After Party'",
    category: "Hot",
    points: 20,
    description:
      "Encontrem um lugar bonito para ver o pôr do sol. Assim que o sol sumir, comecem uma sessão de amassos intensa no carro ou em um lugar reservado.",
  },
  {
    name: "Comando por um Dia",
    category: "Hot",
    points: 25,
    description:
      "Um dos dois tem o poder de dar 'ordens' e fazer pedidos ao longo do dia, e o outro deve obedecer. Troquem de papel no dia seguinte.",
  },
  {
    name: "Catálogo de Posições",
    category: "Hot",
    points: 15,
    description:
      "Peguem um livro ou app de posições sexuais e cada um escolhe uma que nunca tentou para experimentarem na mesma noite.",
  },
  {
    name: "O Jogo do Espelho",
    category: "Hot",
    points: 15,
    description:
      "Fiquem de frente um para o outro. Um faz um movimento sensual lento (tirar uma alça da blusa, passar a mão no corpo) e o outro deve imitar exatamente.",
  },
  {
    name: "Amigo Secreto de Lingerie/Cueca",
    category: "Hot",
    points: 20,
    description:
      "Cada um compra uma peça de roupa íntima para o outro e entrega de surpresa. A regra é usar a peça na mesma noite.",
  },
  {
    name: "SPA Day de Casal em Casa",
    category: "Hot",
    points: 20,
    description:
      "Preparem máscaras faciais, escalda-pés e se revezem fazendo esfoliação e hidratação um no outro. O foco é o cuidado e o toque.",
  },
  {
    name: "Duelo de olhares",
    category: "Hot",
    points: 10,
    description:
      "Sentem-se um de frente para o outro e se olhem nos olhos sem desviar. O primeiro a rir ou desviar o olhar tem que dar um beijo onde o outro mandar.",
  },
  {
    name: "Vale-Troca de 5 mensagens picantes",
    category: "Hot",
    points: 10,
    description:
      "Durante o dia, enviem 5 mensagens mais ousadas um para o outro para esquentar o clima.",
  },
  {
    name: "Noite de cinema... com um 'twist'",
    category: "Hot",
    points: 15,
    description:
      "Escolham um filme, mas com uma regra: a cada cena de beijo, uma peça de roupa sai.",
  },
  {
    name: "Jantar à luz de velas no chão do quarto",
    category: "Hot",
    points: 20,
    description:
      "Esqueçam a mesa. Preparem um cantinho aconchegante no chão do quarto para um jantar mais íntimo.",
  },
  {
    name: "Criar um drink com nomes sugestivos",
    category: "Hot",
    points: 10,
    description:
      "Misturem seus ingredientes favoritos e batizem o coquetel com um nome secreto e provocante.",
  },
  {
    name: "Sessão de massagem com óleos essenciais",
    category: "Hot",
    points: 15,
    description:
      "Prepare o ambiente com música e pouca luz para uma massagem relaxante e sensual.",
  },
  {
    name: "Batalha de 'verdade ou consequência' apimentado",
    category: "Hot",
    points: 10,
    description:
      "Preparem perguntas e desafios mais ousados para uma versão adulta do jogo.",
  },
  {
    name: "Recriar a primeira noite juntos",
    category: "Hot",
    points: 25,
    description:
      "Seja com a mesma comida, música ou roupas... tentem recriar a atmosfera da primeira vez.",
  },
  {
    name: "Tomar um banho de banheira (ou de chuveiro) juntos",
    category: "Hot",
    points: 15,
    description:
      "Um momento para relaxar, conversar e cuidar um do outro de forma mais íntima.",
  },
  // === NOVAS SUGESTÕES SENSUAIS (20+ adicionais) ===
  {
    name: "Mordidas Provocantes",
    category: "Hot",
    points: 15,
    description:
      "Explorem mordidas suaves pelo corpo do parceiro, descobrindo quais pontos provocam mais arrepios e gemidos.",
  },
  {
    name: "Desafio da Respiração no Ouvido",
    category: "Hot",
    points: 10,
    description:
      "Sussurrem, soprem e respirem no ouvido um do outro enquanto se abraçam. O objetivo é provocar o máximo de arrepios.",
  },
  {
    name: "Noite de Roleplay Fantasioso",
    category: "Hot",
    points: 25,
    description:
      "Escolham personagens (médico/paciente, professor/aluno, etc.) e interpretem uma cena com figurino e diálogos.",
  },
  {
    name: "Massagem com Penas",
    category: "Hot",
    points: 15,
    description:
      "Usem penas macias para fazer cócegas e carícias pelo corpo todo, explorando a sensibilidade da pele.",
  },
  {
    name: "Competição de Beijos Criativos",
    category: "Hot",
    points: 10,
    description:
      "Criem diferentes tipos de beijos (beijo borboleta, beijo esquimó, beijo francês intenso) e votem no melhor.",
  },
  {
    name: "Sessão de Amarração Sensual",
    category: "Hot",
    points: 20,
    description:
      "Usem lenços de seda ou cordas macias para explorar a sensação de estar no controle e de se entregar.",
  },
  {
    name: "Confessionário Íntimo",
    category: "Hot",
    points: 15,
    description:
      "Compartilhem as fantasias mais secretas que nunca contaram para ninguém, criando um espaço de total confiança.",
  },
  {
    name: "Desafio dos 30 Segundos",
    category: "Hot",
    points: 10,
    description:
      "Estabeleçam um timer de 30 segundos para provocar uma parte específica do corpo do parceiro da forma mais criativa.",
  },
  {
    name: "Banquete Sensual na Cama",
    category: "Hot",
    points: 20,
    description:
      "Preparem frutas, chocolates e champagne para comer na cama, se alimentando mutuamente de forma provocante.",
  },
  {
    name: "Jogo da Temperatura",
    category: "Hot",
    points: 15,
    description:
      "Alternem entre bebidas geladas e quentes na boca antes de beijar diferentes partes do corpo do parceiro.",
  },
  {
    name: "Carta de Amor Erótica",
    category: "Hot",
    points: 15,
    description:
      "Escrevam cartas descrevendo em detalhes o que gostariam de fazer um com o outro, depois leiam em voz alta.",
  },
  {
    name: "Dança do Ventre Sedutora",
    category: "Hot",
    points: 20,
    description:
      "Um dos dois aprende movimentos básicos de dança do ventre e apresenta uma performance sensual para o outro.",
  },
  {
    name: "Caça-Palavras Picante",
    category: "Hot",
    points: 10,
    description:
      "Criem um caça-palavras com termos sensuais e a cada palavra encontrada, cumpram uma ação correspondente.",
  },
  {
    name: "Sessão de Dirty Talk",
    category: "Hot",
    points: 15,
    description:
      "Pratiquem falar de forma provocante e sensual, sussurrando desejos e intenções um para o outro.",
  },
  {
    name: "Desfile de Lingerie/Roupa Íntima",
    category: "Hot",
    points: 20,
    description:
      "Organizem um desfile privado onde cada um modela suas peças mais sensuais para o outro.",
  },
  {
    name: "Massagem Tântrica Básica",
    category: "Hot",
    points: 25,
    description:
      "Pesquisem técnicas básicas de massagem tântrica e dediquem uma noite inteira para explorar essa prática.",
  },
  {
    name: "Jogo das Zonas Erógenas",
    category: "Hot",
    points: 20,
    description:
      "Façam um mapa das zonas erógenas um do outro, testando diferentes toques e pressões em cada área.",
  },
  {
    name: "Videoconferência Provocante",
    category: "Hot",
    points: 15,
    description:
      "Mesmo estando em casa, façam uma videochamada de quartos separados para se provocarem virtualmente.",
  },
  {
    name: "Competição de Striptease",
    category: "Hot",
    points: 20,
    description:
      "Cada um prepara uma performance de striptease e depois votem quem foi mais criativo e sensual.",
  },
  {
    name: "Trilha de Beijos pelo Corpo",
    category: "Hot",
    points: 15,
    description:
      "Criem um caminho de beijos começando pelos pés e subindo lentamente até chegarem aos lábios.",
  },
    {
    name: "Sessão de Fotos Sensuais Polaroid",
    category: "Hot",
    points: 20,
    description:
      "Usem uma câmera polaroid para criar fotos íntimas instantâneas que vocês podem guardar como recordação.",
  },
  {
    name: "Despertar com Carícias",
    category: "Hot",
    points: 15,
    description:
      "Quem acordar primeiro deve despertar o parceiro apenas com carícias suaves e beijos pelo corpo.",
  },
  {
    name: "Banho de Lua com Provocações",
    category: "Hot",
    points: 25,
    description:
      "Numa noite de lua cheia, encontrem um local reservado ao ar livre para um momento íntimo sob as estrelas.",
  },
  {
    name: "Escrita no Corpo com Gelo",
    category: "Hot",
    points: 15,
    description:
      "Usem cubos de gelo para 'escrever' palavras de amor e desejo na pele um do outro.",
  },
  {
    name: "Jogo da Sedução Progressiva",
    category: "Hot",
    points: 20,
    description:
      "Estabeleçam níveis de sedução (olhares, sussurros, toques) e progridam lentamente ao longo da noite.",
  },
];
const masterSuggestionPool = [
  {
    name: "Maratona de um filme que um indicou ao outro",
    category: "Filmes & Séries",
    points: 10,
    description:
      "Cada um escolhe um filme que o outro nunca viu. Prepare a pipoca e abrace o desconhecido!",
  },
  {
    name: "Recriar uma foto antiga do casal",
    category: "Hobbies & Outros",
    points: 15,
    description:
      "Procurem uma foto do início do namoro e tentem recriá-la com o máximo de detalhes possível.",
  },
  {
    name: "Passeio sem destino",
    category: "Viagens & Passeios",
    points: 10,
    description:
      "Entrem no carro ou peguem um ônibus e simplesmente explorem uma área da cidade que vocês não conhecem bem.",
  },
  {
    name: "Noite de 'detox digital'",
    category: "Hobbies & Outros",
    points: 20,
    description:
      "Desliguem os celulares e computadores por pelo menos 2 horas e conversem, joguem ou apenas curtam o silêncio.",
  },
  {
    name: "Montar uma playlist colaborativa",
    category: "Música",
    points: 5,
    description:
      "Criem uma playlist no Spotify ou YouTube com músicas que marcaram o relacionamento de vocês.",
  },
  {
    name: "Cozinhar o prato favorito do outro",
    category: "Comida & Bebida",
    points: 15,
    description:
      "Uma pessoa cozinha o prato predileto da outra, como um gesto de carinho e atenção.",
  },
  {
    name: "Planejar uma 'viagem dos sonhos' no papel",
    category: "Viagens & Passeios",
    points: 10,
    description:
      "Mesmo que não seja para agora, pesquisem um destino, montem um roteiro e sonhem juntos.",
  },
  {
    name: "Escrever 3 coisas que admira no outro",
    category: "Hobbies & Outros",
    points: 10,
    description:
      "Cada um escreve em um papel 3 qualidades que mais admira no parceiro e depois compartilham.",
  },
  {
    name: "Manhã de café da manhã na cama",
    category: "Comida & Bebida",
    points: 15,
    description:
      "Quem acordar primeiro prepara uma bandeja de café da manhã surpresa para o outro.",
  },
  {
    name: "Aula online de algo novo",
    category: "Hobbies & Outros",
    points: 10,
    description:
      "Façam juntos uma aula online no YouTube, seja de dança, yoga, desenho ou qualquer outra habilidade.",
  },
];

export const useSuggestions = (userData, _handleAddActivity, suggestionType) => {
  // O estado agora é um OBJETO, que é mais eficiente para o Firestore
  const [suggestions, setSuggestions] = useState({});

  // Dia de referência do listener e dos handlers. Reavaliado periodicamente
  // para que o app aberto na virada da meia-noite migre para o doc do novo
  // dia — listener e cliques sempre operam sobre o MESMO dia.
  const [today, setToday] = useState(getTodayDateString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = getTodayDateString();
      setToday((prev) => (prev === now ? prev : now));
    }, 30000);
    return () => clearInterval(intervalId);
  }, []);

  // Objeto de configuração para tornar o hook dinâmico
  const config = useMemo(() => {
    if (suggestionType === "hot") {
      return {
        pool: hotSuggestionPool,
        collectionName: "hotSuggestions", // Coleção separada no Firestore
      };
    }
    return {
      pool: masterSuggestionPool,
      collectionName: "dailySuggestions", // Coleção padrão
    };
  }, [suggestionType]);

  // Geração transacional: só grava um conjunto novo se o doc do dia ainda
  // não existir. Dois clientes gerando em paralelo chegam ao MESMO doc —
  // o segundo reutiliza o primeiro em vez de sobrescrevê-lo (um setDoc
  // full-replace apagaria seleções já feitas).
  const ensureSuggestionsForDay = useCallback(
    async (ref) => {
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (snap.exists()) return;
        transaction.set(ref, {
          suggestions: buildRandomSuggestions(config.pool),
        });
      });
    },
    [config.pool]
  );

  // Efeito para "ouvir" as sugestões do dia em tempo real
  useEffect(() => {
    if (!userData?.coupleId) return;
    const suggestionsRef = doc(
      db,
      `duomatches/${userData.coupleId}/${config.collectionName}`,
      today
    );

    const unsubscribe = onSnapshot(suggestionsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSuggestions(docSnap.data().suggestions || {});
      } else {
        ensureSuggestionsForDay(suggestionsRef);
      }
    });

    return () => unsubscribe();
  }, [userData?.coupleId, ensureSuggestionsForDay, config.collectionName, today]);

  // Função para lidar com o clique em uma sugestão.
  // Toda a leitura/escrita acontece DENTRO da transação (estado real do
  // servidor, não o estado React possivelmente obsoleto) e os efeitos
  // colaterais (eventos/toasts) acontecem DEPOIS que a transação commita —
  // o corpo de uma transação pode executar várias vezes em caso de retry.
  const handleSelectSuggestion = useCallback(
    async (suggestionId) => {
      if (!userData?.coupleId || !userData?.uid || !userData?.partnerId) return;

      const suggestionsRef = doc(
        db,
        `duomatches/${userData.coupleId}/${config.collectionName}`,
        today
      );
      const suggestionType =
        config.collectionName === "hotSuggestions" ? "hot" : "normal";

      let matchInfo = null;

      try {
        await runTransaction(db, async (transaction) => {
          const docSnap = await transaction.get(suggestionsRef);
          const existing = docSnap.exists()
            ? docSnap.data().suggestions
            : null;

          let workingSuggestions = existing;
          const mustCreateDoc = !existing;

          if (!workingSuggestions) {
            // Doc do dia ainda não existe — gera dentro da própria transação,
            // garantindo que clientes simultâneos compartilhem o mesmo doc.
            workingSuggestions = buildRandomSuggestions(config.pool);
          }

          const freshSuggestion = workingSuggestions[suggestionId];
          if (!freshSuggestion || freshSuggestion.matched) return;

          // Toggle calculado a partir do estado REAL do servidor
          const myCurrentStatus = freshSuggestion.selections?.[userData.uid];
          const newStatus =
            myCurrentStatus === "selected" ? null : "selected";

          if (mustCreateDoc) {
            workingSuggestions = {
              ...workingSuggestions,
              [suggestionId]: {
                ...freshSuggestion,
                selections: { [userData.uid]: newStatus },
              },
            };
            transaction.set(suggestionsRef, {
              suggestions: workingSuggestions,
            });
          } else {
            // Notação de ponto altera apenas o campo do usuário, sem
            // sobrescrever a seleção do parceiro.
            transaction.update(suggestionsRef, {
              [`suggestions.${suggestionId}.selections.${userData.uid}`]:
                newStatus,
            });
          }

          // Match: ambos selecionaram a mesma sugestão
          if (
            newStatus === "selected" &&
            freshSuggestion.selections?.[userData.partnerId] === "selected"
          ) {
            // Limpar seleções e marcar como matched
            transaction.update(suggestionsRef, {
              [`suggestions.${suggestionId}.matched`]: true,
              [`suggestions.${suggestionId}.selections`]: {},
            });

            const confirmedSelections = {
              [userData.uid]: { status: "confirmed", date: today },
              [userData.partnerId]: { status: "confirmed", date: today },
            };
            const {
              id,
              selections,
              matched,
              ...baseActivityData
            } = freshSuggestion;
            const finalActivityData = {
              ...baseActivityData,
              selections: confirmedSelections,
              completionStatus: null,
              createdBy: "SYSTEM",
              createdAt: serverTimestamp(),
            };

            // Gravar a atividade dentro da mesma transação
            const newActivityRef = doc(
              db,
              `duomatches/${userData.coupleId}/activities`
            );
            transaction.set(newActivityRef, finalActivityData);

            matchInfo = {
              name: freshSuggestion.name,
              type: suggestionType,
            };
          }
        });
      } catch (error) {
        console.error("Erro ao selecionar sugestão:", error);
        alert("Não foi possível registrar sua escolha. Tente novamente.");
        return;
      }

      // Notificar sobre o match FORA da transação — disparado uma única vez,
      // somente se o commit realmente aconteceu.
      if (matchInfo) {
        setTimeout(() => {
          if (matchInfo.type === "hot") {
            // dispatchHotMatchEvent já dispara 'hotActivityMatch' — usar
            // UMA única vez para não duplicar o evento.
            if (window.dispatchHotMatchEvent) {
              window.dispatchHotMatchEvent(matchInfo.name);
            } else {
              window.dispatchEvent(
                new CustomEvent("hotActivityMatch", {
                  detail: { activityName: matchInfo.name },
                })
              );
            }
          } else {
            window.dispatchEvent(
              new CustomEvent("activityMatch", { detail: matchInfo.name })
            );
          }
        }, 1500);
      }
    },
    [userData, config.collectionName, config.pool, today]
  );

  return { suggestions, handleSelectSuggestion };
};