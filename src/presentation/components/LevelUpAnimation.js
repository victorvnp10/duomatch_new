
import React, { useEffect, useState } from 'react';

export default function LevelUpAnimation({ isVisible, newLevel, onComplete }) {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setStage('celebrating'), 500);
    const timer2 = setTimeout(() => setStage('exiting'), 2500);
    const timer3 = setTimeout(() => {
      setStage('entering');
      onComplete?.();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const getLevelEmoji = (level) => {
    if (level >= 4) return "🔥";
    if (level >= 3) return "💋";
    if (level >= 2) return "😘";
    if (level >= 1) return "💕";
    return "💖";
  };

  const getLevelName = (level) => {
    if (level >= 4) return "Ardente";
    if (level >= 3) return "Apaixonados";
    if (level >= 2) return "Carinhosos";
    if (level >= 1) return "Conectados";
    return "Começando";
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 transition-all duration-500 ${
      stage === 'entering' || stage === 'exiting' ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`text-center transform transition-all duration-700 ${
        stage === 'celebrating' ? 'scale-100' : 'scale-75'
      }`}>
        {/* Círculos de fundo animados */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-64 h-64 rounded-full bg-gradient-to-r from-pink-500/20 to-red-500/20 animate-pulse ${
            stage === 'celebrating' ? 'animate-ping' : ''
          }`} />
          <div className={`absolute w-48 h-48 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 animate-pulse delay-300 ${
            stage === 'celebrating' ? 'animate-ping' : ''
          }`} />
        </div>

        {/* Conteúdo principal */}
        <div className="relative z-10">
          <div className={`text-8xl mb-4 transition-all duration-1000 ${
            stage === 'celebrating' ? 'animate-bounce' : ''
          }`}>
            {getLevelEmoji(newLevel)}
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-2 animate-pulse">
            NÍVEL {newLevel}!
          </h2>
          
          <p className="text-2xl text-pink-300 mb-4">
            {getLevelName(newLevel)}
          </p>
          
          <div className="text-lg text-gray-300">
            Nível de intimidade aumentado! 💕
          </div>

          {/* Partículas */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`absolute text-2xl animate-bounce ${
                  stage === 'celebrating' ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${20 + (i % 4) * 20}%`,
                  top: `${20 + Math.floor(i / 4) * 25}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '2s'
                }}
              >
                {i % 3 === 0 ? '💖' : i % 3 === 1 ? '✨' : '🌟'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
