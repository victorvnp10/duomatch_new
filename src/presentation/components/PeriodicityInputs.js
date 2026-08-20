import React from "react";
import { getTodayDateString } from "../../shared/utils";

function PeriodicityInputs({ type, value, setValue }) {
  switch (type) {
    case "especifica":
      return (
        <input
          type="date"
          value={value}
          min={getTodayDateString()}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
      );

    case "semanal":
      return (
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
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
          className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400"
        />
      );

    case "anual":
      return (
        <input
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-grow px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
        />
      );

    default:
      return null;
  }
}

export default PeriodicityInputs;
