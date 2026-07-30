
import React, { useEffect, useState } from 'react';

export default function MatchNotification({ isVisible, activityName, isHot = false, onComplete }) {
  const [stage, setStage] = useState('entering');

  useEffect(() => {
    if (!isVisible) return;

    const timer1 = setTimeout(() => setStage('showing'), 200);
    const timer2 = setTimeout(() => setStage('exiting'), 3000);
    const timer3 = setTimeout(() => {
      setStage('entering');
      onComplete?.();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-40 flex items-center justify-center bg-black/50 transition-all duration-300 ${
      stage === 'entering' || stage === 'exiting' ? 'opacity-0' : 'opacity-100'
    }`}>
      <div className={`bg-gradient-to-r ${
        isHot 
          ? 'from-red-900/90 to-pink-900/90 border-red-500/50' 
          : 'from-green-900/90 to-emerald-900/90 border-green-500/50'
      } backdrop-blur-md rounded-2xl p-8 border shadow-2xl transform transition-all duration-500 ${
        stage === 'showing' ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'
      }`}>
        <div className="text-center">
          <div className={`text-6xl mb-4 ${stage === 'showing' ? 'animate-bounce' : ''}`}>
            {isHot ? '🔥' : '🎉'}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {isHot ? 'MATCH HOT!' : 'MATCH!'}
          </h2>
          
          <p className="text-lg text-gray-200 mb-4">
            Vocês escolheram a mesma atividade!
          </p>
          
          <div className={`text-xl font-semibold ${isHot ? 'text-pink-300' : 'text-green-300'} mb-2`}>
            "{activityName}"
          </div>
          
          <p className="text-sm text-gray-400">
            {isHot ? 'Momento íntimo aguarda vocês...' : 'Agora é só curtir juntos!'}
          </p>

          {/* Efeito de partículas */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute text-2xl transition-all duration-1000 ${
                  stage === 'showing' ? 'opacity-100 animate-ping' : 'opacity-0'
                }`}
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 40}%`,
                  animationDelay: `${i * 0.2}s`,
                }}
              >
                {isHot ? (i % 2 === 0 ? '💕' : '🔥') : (i % 2 === 0 ? '✨' : '🎊')}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
