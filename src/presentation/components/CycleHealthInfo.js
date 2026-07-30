import React, { useState } from "react";

const TOPICS = [
  {
    title: "O que é considerado um ciclo regular?",
    body:
      "A maioria dos ciclos dura entre 21 e 35 dias, com a menstruação em si durando de 2 a 7 dias. " +
      "Uma variação de até ~8 dias entre o ciclo mais curto e o mais longo, num grupo recente de ciclos, " +
      "costuma ser considerada dentro da normalidade.",
  },
  {
    title: "O que pode afetar a regularidade",
    body:
      "Estresse, mudanças de rotina, viagens, peso corporal, uso ou troca de contraceptivos, e a " +
      "proximidade da menarca ou da perimenopausa podem tornar os ciclos mais irregulares — nem sempre " +
      "é sinal de um problema de saúde.",
  },
  {
    title: "Quando vale conversar com um(a) ginecologista",
    body:
      "Ciclos consistentemente mais curtos que 21 dias ou mais longos que 35 dias, ausência de " +
      "menstruação por 3 ciclos seguidos, sangramento muito intenso, ou dor que atrapalha o dia a dia " +
      "são sinais que valem uma avaliação profissional — este app não substitui isso.",
  },
  {
    title: "Por que registrar ajuda",
    body:
      "Um histórico de alguns meses é o que permite perceber padrões reais (em vez de um mês isolado) " +
      "e leva informação mais útil para uma consulta médica, se for o caso.",
  },
];

export default function CycleHealthInfo() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
      <h3 className="font-bold text-white mb-1">Saúde do ciclo</h3>
      <p className="text-xs text-gray-500 mb-3">
        Informações gerais de educação em saúde — não substituem uma consulta médica.
      </p>
      <div className="space-y-2">
        {TOPICS.map((topic, index) => (
          <div key={topic.title} className="border border-gray-700/50 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-200 flex justify-between items-center hover:bg-gray-700/30"
            >
              {topic.title}
              <span className="text-gray-500">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <p className="px-3 pb-3 text-sm text-gray-400 leading-relaxed">{topic.body}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
