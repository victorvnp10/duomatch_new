/**
 * Dados de exemplo usados SOMENTE na pré-visualização solo (quem ainda
 * não vinculou parceiro). Nada aqui é persistido — é só para dar a
 * sensação real do app, com atividades e desafios de exemplo, antes da
 * vinculação de verdade. Os nomes e textos deixam claro que é exemplo.
 */

export const DEMO_PARTNER_UID = "demo-partner-preview";

/** Imita um Firestore Timestamp o suficiente para código que chama
 * `.toDate()` nesses campos (ex: MainView, streakUtils). */
const mockTimestamp = (date) => ({ toDate: () => date });

const today = new Date();
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const toDateStr = (d) => d.toISOString().slice(0, 10);

export const buildPreviewPartnerData = () => ({
  nickname: "Parceiro(a)",
  photoURL: "",
});

export const buildPreviewCoupleData = () => ({
  confirmationTime: "22:00",
  streak: 4,
  bestStreak: 9,
  onboardingCompletedBy: [],
  dailySignals: null,
  weeklyChallenge: null,
});

export const buildPreviewRounds = (userUid) => [
  {
    id: "demo-round",
    name: "Rodada de Exemplo",
    startDate: toDateStr(daysAgo(5)),
    endDate: toDateStr(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 25)
    ),
    scores: { [userUid]: 10, [DEMO_PARTNER_UID]: 10 },
    rules: { minActivities: { days: 7, quantity: 5, penalty: 10 }, minChallenges: { days: 7, quantity: 1, penalty: 10 } },
  },
];

export const buildPreviewActivities = (userUid) => [
  {
    id: "demo-act-1",
    name: "Cozinhar uma refeição nova juntos",
    category: "Comida & Bebida",
    type: "atividade",
    description:
      "Escolham uma receita que nunca tentaram e preparem o jantar em equipe.",
    periodicity: null,
    createdAt: mockTimestamp(daysAgo(1)),
    createdBy: "SYSTEM",
    completionStatus: null,
    points: 15,
    selections: {},
  },
  {
    id: "demo-act-2",
    name: "Momento de 1h sem celular",
    category: "Hobbies & Outros",
    type: "atividade",
    description:
      "Guardem os celulares e dediquem uma hora para conversar e se reconectar.",
    periodicity: null,
    createdAt: mockTimestamp(daysAgo(2)),
    createdBy: "SYSTEM",
    completionStatus: null,
    points: 10,
    selections: {},
  },
  {
    id: "demo-act-3",
    name: "Assistir ao pôr do sol",
    category: "Hobbies & Outros",
    type: "atividade",
    description:
      "Encontrem um lugar com uma bela vista e apreciem o momento juntos.",
    periodicity: null,
    createdAt: mockTimestamp(daysAgo(3)),
    createdBy: DEMO_PARTNER_UID,
    completionStatus: null,
    points: 10,
    selections: {},
  },
  {
    id: "demo-desafio-1",
    name: "Prepare o café da manhã na cama",
    category: "Romance",
    type: "desafio",
    description:
      "Surpreenda seu par com um café da manhã especial, sem avisar antes.",
    periodicity: null,
    createdAt: mockTimestamp(daysAgo(1)),
    createdBy: userUid,
    completionStatus: null,
    points: 20,
    selections: {},
  },
];

export const buildPreviewWishlistItems = (userUid) => [
  {
    id: "demo-wish-1",
    name: "Fim de semana na praia",
    description: "Uma escapada de dois dias, só nós dois.",
    createdBy: userUid,
    status: "active",
  },
  {
    id: "demo-wish-2",
    name: "Aula de dança a dois",
    description: "Sempre quisemos aprender a dançar juntos.",
    createdBy: DEMO_PARTNER_UID,
    status: "active",
  },
];

export const buildPreviewRewards = () => [
  {
    id: "demo-reward-1",
    name: "Vale um dia sem tarefas domésticas",
    description: "Quem ganhar não faz nenhuma tarefa de casa por um dia.",
    cost: 30,
    status: "pending_approval",
  },
  {
    id: "demo-reward-2",
    name: "Escolher o filme da noite por um mês",
    description: "Poder de decisão total sobre o que assistir.",
    cost: 25,
    status: "pending_approval",
  },
];
