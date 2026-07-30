import React from "react";
import { DropletIcon } from "./Icons";

const TONE_STYLES = {
  great: "bg-accent/15 border-accent/40",
  good: "bg-emerald-900/30 border-emerald-500/50",
  neutral: "bg-gray-700/30 border-gray-600/40",
  caution: "bg-yellow-900/30 border-yellow-600/50",
};

/**
 * Card compacto do insight diário do ciclo, para o parceiro que não
 * registra os dados. Reaproveitado no painel principal (MainView) e na
 * tela dedicada de Ciclo — para não duplicar o layout em dois lugares.
 */
export default function DailyTipCard({ dailyInsight, onOpenCycleView }) {
  if (!dailyInsight) return null;

  const style = TONE_STYLES[dailyInsight.tone] || TONE_STYLES.neutral;
  const Wrapper = onOpenCycleView ? "button" : "div";

  return (
    <Wrapper
      {...(onOpenCycleView ? { onClick: onOpenCycleView } : {})}
      className={`w-full text-left border rounded-2xl p-4 flex items-center gap-3 backdrop-blur-sm transition-transform ${
        onOpenCycleView ? "hover:scale-[1.01]" : ""
      } ${style}`}
    >
      <span className="text-3xl">{dailyInsight.icon}</span>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-400 flex items-center gap-1">
          <DropletIcon className="h-3.5 w-3.5" /> Dica do dia
        </p>
        <p className="font-bold text-white leading-snug">{dailyInsight.title}</p>
      </div>
    </Wrapper>
  );
}
