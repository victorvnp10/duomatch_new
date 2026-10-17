/**
 * Testes de src/presentation/components/preview/previewData.js
 *
 * Dados de exemplo usados SÓ na pré-visualização solo (quem não vinculou
 * parceiro) — nada é persistido (previewData.js:1-6). Os builders alimentam a
 * UI de preview, então garantimos a forma e as referências de uid.
 */
import {
  DEMO_PARTNER_UID,
  buildPreviewPartnerData,
  buildPreviewCoupleData,
  buildPreviewRounds,
  buildPreviewActivities,
  buildPreviewWishlistItems,
  buildPreviewRewards,
} from "./previewData";

describe("DEMO_PARTNER_UID", () => {
  it("é o uid fixo do parceiro de exemplo", () => {
    expect(DEMO_PARTNER_UID).toBe("demo-partner-preview");
  });
});

describe("buildPreviewPartnerData / buildPreviewCoupleData", () => {
  it("devolve os dados do parceiro de exemplo", () => {
    expect(buildPreviewPartnerData()).toEqual({
      nickname: "Parceiro(a)",
      photoURL: "",
    });
  });

  it("devolve os dados do casal de exemplo", () => {
    const couple = buildPreviewCoupleData();
    expect(couple.streak).toBe(4);
    expect(couple.bestStreak).toBe(9);
    expect(couple.weeklyChallenge).toBeNull();
  });
});

describe("buildPreviewRounds", () => {
  it("cria uma rodada com placar para os dois uids e datas coerentes", () => {
    const rounds = buildPreviewRounds("user-1");
    expect(rounds).toHaveLength(1);

    const round = rounds[0];
    expect(round.scores["user-1"]).toBe(10);
    expect(round.scores[DEMO_PARTNER_UID]).toBe(10);
    // Datas em YYYY-MM-DD: comparação lexicográfica equivale à cronológica.
    expect(round.startDate < round.endDate).toBe(true);
    expect(round.rules.minActivities).toBeTruthy();
    expect(round.rules.minChallenges).toBeTruthy();
  });
});

describe("buildPreviewActivities", () => {
  it("cria 4 atividades com ids únicos e timestamps simulados", () => {
    const activities = buildPreviewActivities("user-1");
    expect(activities).toHaveLength(4);

    const ids = activities.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);

    activities.forEach((a) => {
      // mockTimestamp imita um Firestore Timestamp (previewData.js:12).
      expect(typeof a.createdAt.toDate).toBe("function");
      expect(a.createdAt.toDate()).toBeInstanceOf(Date);
    });
  });

  it("inclui exatamente um desafio criado pelo usuário", () => {
    const activities = buildPreviewActivities("user-1");
    const challenges = activities.filter((a) => a.type === "desafio");
    expect(challenges).toHaveLength(1);
    expect(challenges[0].createdBy).toBe("user-1");
  });
});

describe("buildPreviewWishlistItems", () => {
  it("cria 2 itens, um de cada parceiro", () => {
    const items = buildPreviewWishlistItems("user-1");
    expect(items).toHaveLength(2);
    const creators = items.map((i) => i.createdBy);
    expect(creators).toContain("user-1");
    expect(creators).toContain(DEMO_PARTNER_UID);
  });
});

describe("buildPreviewRewards", () => {
  it("cria 2 recompensas pendentes de aprovação", () => {
    const rewards = buildPreviewRewards();
    expect(rewards).toHaveLength(2);
    rewards.forEach((r) => expect(r.status).toBe("pending_approval"));
  });
});
