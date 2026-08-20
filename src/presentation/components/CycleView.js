import React, { useState } from "react";
import { ArrowLeftIcon, DropletIcon, TrashIcon } from "./Icons";
import { useMenstrualCycle } from "../../application/hooks/useMenstrualCycle";
import { getPhaseLabel } from "../../domain/services/CycleInsightService";
import { getTodayDateString } from "../../shared/utils";
import DailyTipCard from "./DailyTipCard";
import CycleHealthInfo from "./CycleHealthInfo";

function DisclaimerNote() {
  return (
    <p className="text-xs text-gray-400 mt-4 leading-relaxed">
      Estimativa por calendário — não é um diagnóstico médico nem um método
      contraceptivo, e ciclos reais variam. O mais importante continua sendo
      conversar e respeitar como cada um está se sentindo naquele dia.
    </p>
  );
}

/** Formata "YYYY-MM-DD" como "DD/MM". */
function formatDayMonth(dateStr) {
  const [, month, day] = dateStr.split("-");
  return `${day}/${month}`;
}

/** Cabeçalho com o resumo do dia — a primeira coisa que ela vê ao entrar. */
function TodayHero({ cycleSummary }) {
  if (!cycleSummary) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-plum to-plum rounded-3xl p-6 shadow-glow-accent border border-accent/20">
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-accent/10 blur-2xl" />
      <p className="text-xs uppercase tracking-widest text-accent-light font-semibold mb-1">
        Hoje
      </p>
      <h2 className="text-2xl font-display font-semibold text-white mb-3">
        Dia {cycleSummary.cycleDay} · {getPhaseLabel(cycleSummary.phase)}
      </h2>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <p className="text-gray-400">Próxima menstruação</p>
          <p className="text-white font-medium">
            {new Date(`${cycleSummary.nextPeriodDate}T00:00:00`).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Janela fértil</p>
          <p className="text-white font-medium">
            {formatDayMonth(cycleSummary.fertileWindowDates.start)} a{" "}
            {formatDayMonth(cycleSummary.fertileWindowDates.end)}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Card com as estatísticas de regularidade do ciclo. */
function RegularityCard({ cycleStats }) {
  if (!cycleStats.hasEnoughData) {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-5">
        <h3 className="font-display font-semibold text-white mb-1">Regularidade</h3>
        <p className="text-sm text-gray-400">
          Registre mais um ciclo para começar a ver estatísticas de regularidade.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-white">Regularidade</h3>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            cycleStats.isRegular
              ? "bg-sage/20 text-sage-light"
              : "bg-gold/20 text-gold-light"
          }`}
        >
          {cycleStats.isRegular ? "Regular" : "Variável"}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-2xl font-display font-semibold text-white">{cycleStats.averageLength}</p>
          <p className="text-xs text-gray-400">média (dias)</p>
        </div>
        <div>
          <p className="text-2xl font-display font-semibold text-white">{cycleStats.shortest}</p>
          <p className="text-xs text-gray-400">mais curto</p>
        </div>
        <div>
          <p className="text-2xl font-display font-semibold text-white">{cycleStats.longest}</p>
          <p className="text-xs text-gray-400">mais longo</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Baseado nos últimos {cycleStats.cycleCount} ciclos registrados — variação de{" "}
        {cycleStats.variation} {cycleStats.variation === 1 ? "dia" : "dias"} entre o mais
        curto e o mais longo.
      </p>
    </div>
  );
}

/** Lista dos períodos já registrados, com opção de remover um lançamento errado. */
function PeriodHistory({ periods, onDelete }) {
  if (periods.length === 0) return null;
  const sorted = [...periods].sort((a, b) => (a.startDate < b.startDate ? 1 : -1));

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-5">
      <h3 className="font-display font-semibold text-white mb-3">Histórico</h3>
      <ul className="space-y-2">
        {sorted.map((period) => (
          <li
            key={period.startDate}
            className="flex items-center justify-between text-sm bg-ink/60 rounded-xl px-3 py-2.5"
          >
            <span className="text-gray-300">
              {new Date(`${period.startDate}T00:00:00`).toLocaleDateString("pt-BR")}
            </span>
            <button
              onClick={() => onDelete(period.startDate)}
              className="text-gray-500 hover:text-accent transition-colors"
              aria-label="Remover registro"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Painel de quem registra o ciclo. */
function CycleOwnerPanel({ periods, cycleStats, cycleSummary, onLogPeriodStart, onDeletePeriod }) {
  const [newStartDate, setNewStartDate] = useState(getTodayDateString());
  const [periodLength, setPeriodLength] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newStartDate) return;
    setIsSaving(true);
    try {
      await onLogPeriodStart({ startDate: newStartDate, periodLength });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <TodayHero cycleSummary={cycleSummary} />

      <RegularityCard cycleStats={cycleStats} />

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-5 space-y-4"
      >
        <h3 className="font-display font-semibold text-white">Registrar início do período</h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">Data de início</label>
          <input
            type="date"
            value={newStartDate}
            onChange={(e) => setNewStartDate(e.target.value)}
            required
            className="w-full bg-ink border border-gray-700 rounded-xl p-2.5 text-white focus:border-accent focus:ring-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Duração da menstruação (dias)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={periodLength}
            onChange={(e) => setPeriodLength(parseInt(e.target.value, 10) || 5)}
            className="w-full bg-ink border border-gray-700 rounded-xl p-2.5 text-white focus:border-accent focus:ring-accent"
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-gradient-to-r from-accent to-accent-dark hover:brightness-110 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition-all shadow-glow-accent"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>

        <p className="text-xs text-gray-500">
          Só você vê essas datas e o histórico. Seu par recebe apenas a
          dica do dia — nunca as datas exatas.
        </p>
      </form>

      <PeriodHistory periods={periods} onDelete={onDeletePeriod} />
      <CycleHealthInfo />
      <DisclaimerNote />
    </div>
  );
}

/** Tela exibida para quem NÃO registra o ciclo — só vê o insight do dia. */
function PartnerInsightPanel({ dailyInsight, isConfigured }) {
  if (!isConfigured) {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-3xl p-8 text-center space-y-3">
        <DropletIcon className="h-10 w-10 text-accent mx-auto" />
        <p className="text-gray-300">
          Assim que seu par registrar o ciclo, você vai ver por aqui a dica do dia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DailyTipCard dailyInsight={dailyInsight} />
      <DisclaimerNote />
    </div>
  );
}

export default function CycleView(props) {
  const { setView, user, userData, coupleData } = props;
  const {
    isOwner,
    isConfigured,
    periods,
    cycleStats,
    cycleSummary,
    dailyInsight,
    handleLogPeriodStart,
    handleDeletePeriodEntry,
  } = useMenstrualCycle({ user, userData, coupleData });

  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans pb-20">
      <header className="bg-gray-900/70 backdrop-blur-md p-4 sticky top-0 z-20 border-b border-gray-700/50">
        <div className="max-w-4xl mx-auto flex items-center">
          <button
            onClick={() => setView("main")}
            className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white mr-2 transition-colors"
            aria-label="Voltar"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div className="flex items-center text-accent">
            <DropletIcon />
            <h1 className="ml-2 text-xl font-display font-semibold tracking-wide text-white">
              Ciclo
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {isOwner ? (
          <CycleOwnerPanel
            periods={periods}
            cycleStats={cycleStats}
            cycleSummary={cycleSummary}
            onLogPeriodStart={handleLogPeriodStart}
            onDeletePeriod={handleDeletePeriodEntry}
          />
        ) : (
          <PartnerInsightPanel dailyInsight={dailyInsight} isConfigured={isConfigured} />
        )}
      </main>
    </div>
  );
}
