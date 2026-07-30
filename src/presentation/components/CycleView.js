import React, { useState, useEffect } from "react";
import { ArrowLeftIcon, DropletIcon } from "./Icons";
import { useMenstrualCycle } from "../../application/hooks/useMenstrualCycle";
import { getPhaseLabel } from "../../domain/services/CycleInsightService";

const TONE_STYLES = {
  great: "bg-pink-900/30 border-pink-500/50 text-pink-100",
  good: "bg-emerald-900/30 border-emerald-500/50 text-emerald-100",
  neutral: "bg-gray-700/30 border-gray-600/40 text-gray-200",
  caution: "bg-yellow-900/30 border-yellow-600/50 text-yellow-100",
};

function DisclaimerNote() {
  return (
    <p className="text-xs text-gray-500 mt-4 leading-relaxed">
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

/** Formulário de registro — usado por quem acompanha o próprio ciclo. */
function CycleOwnerPanel({ cycleTracking, cycleSummary, onSave }) {
  const [lastPeriodStart, setLastPeriodStart] = useState(
    cycleTracking?.lastPeriodStart || ""
  );
  const [cycleLength, setCycleLength] = useState(cycleTracking?.cycleLength || 28);
  const [periodLength, setPeriodLength] = useState(cycleTracking?.periodLength || 5);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (cycleTracking) {
      setLastPeriodStart(cycleTracking.lastPeriodStart || "");
      setCycleLength(cycleTracking.cycleLength || 28);
      setPeriodLength(cycleTracking.periodLength || 5);
    }
  }, [cycleTracking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lastPeriodStart) return;
    setIsSaving(true);
    try {
      await onSave({ lastPeriodStart, cycleLength, periodLength });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {cycleSummary && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
          <p className="text-sm text-gray-400">Hoje</p>
          <p className="text-lg font-bold text-white">
            Dia {cycleSummary.cycleDay} do ciclo — {getPhaseLabel(cycleSummary.phase)}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Próxima menstruação estimada:{" "}
            <span className="text-white font-medium">
              {new Date(`${cycleSummary.nextPeriodDate}T00:00:00`).toLocaleDateString("pt-BR")}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            Janela fértil estimada: dias {formatDayMonth(cycleSummary.fertileWindowDates.start)}{" "}
            a {formatDayMonth(cycleSummary.fertileWindowDates.end)}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 space-y-4"
      >
        <h3 className="font-bold text-white">
          {cycleTracking ? "Atualizar registro" : "Registrar meu ciclo"}
        </h3>

        <div>
          <label className="block text-sm text-gray-400 mb-1">
            Data de início da última menstruação
          </label>
          <input
            type="date"
            value={lastPeriodStart}
            onChange={(e) => setLastPeriodStart(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Duração do ciclo (dias)
            </label>
            <input
              type="number"
              min={20}
              max={45}
              value={cycleLength}
              onChange={(e) => setCycleLength(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
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
              onChange={(e) => setPeriodLength(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-colors"
        >
          {isSaving ? "Salvando..." : "Salvar"}
        </button>

        <p className="text-xs text-gray-500">
          Apenas você vê essas datas. Seu parceiro(a) recebe só um insight
          diário — nunca as datas exatas.
        </p>
      </form>

      <DisclaimerNote />
    </div>
  );
}

/** Card exibido para quem NÃO registra o ciclo — só vê o insight do dia. */
function PartnerInsightCard({ dailyInsight, isConfigured, onClaimOwnership }) {
  if (!isConfigured) {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 text-center space-y-3">
        <DropletIcon className="h-10 w-10 text-pink-400 mx-auto" />
        <p className="text-gray-300">
          Assim que seu par registrar o ciclo, você vai ver por aqui um
          insight diário.
        </p>
        <button
          onClick={onClaimOwnership}
          className="text-sm text-gray-400 hover:text-white underline"
        >
          Sou eu quem registra o ciclo — trocar
        </button>
      </div>
    );
  }

  const style = TONE_STYLES[dailyInsight.tone] || TONE_STYLES.neutral;

  return (
    <div className="space-y-4">
      <div className={`border rounded-2xl p-6 text-center ${style}`}>
        <div className="text-5xl mb-3">{dailyInsight.icon}</div>
        <p className="text-xl font-bold">{dailyInsight.title}</p>
      </div>
      <DisclaimerNote />
      <button
        onClick={onClaimOwnership}
        className="text-xs text-gray-500 hover:text-gray-300 underline block mx-auto"
      >
        Sou eu quem registra o ciclo — trocar
      </button>
    </div>
  );
}

export default function CycleView(props) {
  const { setView, user, userData, coupleData } = props;
  const {
    isOwner,
    isConfigured,
    cycleTracking,
    cycleSummary,
    dailyInsight,
    handleSaveCycleData,
    handleClaimOwnership,
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
          <div className="flex items-center text-pink-400">
            <DropletIcon />
            <h1 className="ml-2 text-xl font-bold tracking-wider text-white">
              Ciclo
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {isOwner ? (
          <CycleOwnerPanel
            cycleTracking={cycleTracking}
            cycleSummary={cycleSummary}
            onSave={handleSaveCycleData}
          />
        ) : (
          <PartnerInsightCard
            dailyInsight={dailyInsight}
            isConfigured={isConfigured}
            onClaimOwnership={handleClaimOwnership}
          />
        )}
      </main>
    </div>
  );
}
