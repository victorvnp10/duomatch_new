import React, { useState, useEffect } from "react";
import { ClockIcon } from "./Icons"; // Importa o ícone de relógio

const calculateTimeLeft = (expiryTimestamp) => {
  const difference = expiryTimestamp.toMillis() - new Date().getTime();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
      horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutos: Math.floor((difference / 1000 / 60) % 60),
      segundos: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

export default function CountdownTimer({ expiryTimestamp }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateTimeLeft(expiryTimestamp)
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(expiryTimestamp));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval !== "dias") {
      // Não mostra 0 para horas/minutos/segundos se não houver dias
      if (timeLeft.dias > 0) {
        timerComponents.push(
          <span key={interval}>
            {String(timeLeft[interval]).padStart(2, "0")}
            {interval.charAt(0)}
          </span>
        );
      }
      return;
    }
    if (timeLeft[interval] > 0 || interval === "dias") {
      timerComponents.push(
        <span key={interval}>
          {interval === "dias"
            ? timeLeft[interval]
            : String(timeLeft[interval]).padStart(2, "0")}
          {interval.charAt(0)}
        </span>
      );
    }
  });

  return (
    <div className="inline-flex items-center text-xs font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded-full ml-2">
      <ClockIcon />
      <div className="ml-1 space-x-1">
        {timerComponents.length ? timerComponents : <span>Expirado</span>}
      </div>
    </div>
  );
}
