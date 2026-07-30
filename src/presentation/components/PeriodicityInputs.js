import React from "react";
import { getTodayDateString } from "../../shared/utils";

// Este componente mostra o campo de input correto dependendo do tipo de periodicidade
function PeriodicityInputs({ type, value, setValue }) {
  switch (type) {
    case "especifica":
      return (
        <input
          type="date"
          value={value}
          min={getTodayDateString()}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
        />
      );

    case "semanal":
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Selecione o dia</option>
          <option value="0">Domingo</option>
          <option value="1">Segunda-feira</option>
          <option value="2">Terça-feira</option>
          <option value="3">Quarta-feira</option>
          <option value="4">Quinta-feira</option>
          <option value="5">Sexta-feira</option>
          <option value="6">Sábado</option>
        </select>
      );

    case "mensal":
      return (
        <input
          type="number"
          placeholder="Dia do mês"
          min="1"
          max="31"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
        />
      );

    case "anual":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg"
        />
      );

    default:
      return null; // Não mostra nada se for 'none' ou 'diaria'
  }
}

export default PeriodicityInputs;
