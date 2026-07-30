
import React, { useState, useEffect } from 'react';
import { TrophyIcon, StarIcon } from './Icons';

export default function AchievementAnimation({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Aguarda a animação de saída
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Animação principal */}
      <div className={`relative z-10 text-center transform transition-all duration-500 ${
        isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
      }`}>
        {/* Círculo dourado com troféu */}
        <div className="relative mx-auto mb-6">
          {/* Raios de luz */}
          <div className="absolute inset-0 animate-spin-slow">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-16 bg-gradient-to-t from-transparent via-yellow-400 to-transparent opacity-60"
                style={{
                  left: '50%',
                  top: '-2rem',
                  transform: `translateX(-50%) rotate(${i * 45}deg)`,
                  transformOrigin: '50% 6rem'
                }}
              />
            ))}
          </div>
          
          {/* Círculo principal */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-gentle border-4 border-yellow-200">
            <TrophyIcon className="w-16 h-16 text-yellow-900" />
            
            {/* Brilhos */}
            <div className="absolute top-4 left-6 w-3 h-3 bg-white rounded-full opacity-80 animate-pulse" />
            <div className="absolute top-8 right-4 w-2 h-2 bg-white rounded-full opacity-60 animate-pulse delay-300" />
          </div>
          
          {/* Estrelas flutuantes */}
          {[...Array(6)].map((_, i) => (
            <StarIcon
              key={i}
              className={`absolute w-6 h-6 text-yellow-400 animate-float-${i % 3}`}
              style={{
                left: `${20 + Math.sin(i) * 60}%`,
                top: `${20 + Math.cos(i) * 60}%`,
                animationDelay: `${i * 0.2}s`
              }}
            />
          ))}
        </div>
        
        {/* Texto da conquista */}
        <div className="bg-gray-900/90 border border-yellow-500/50 rounded-2xl p-6 backdrop-blur-sm max-w-md mx-4">
          <h2 className="text-2xl font-bold text-yellow-400 mb-2">
            🎉 Conquista Desbloqueada!
          </h2>
          
          <div className="flex items-center justify-center mb-3">
            <span className="text-3xl mr-3">{achievement.icon}</span>
            <h3 className="text-xl font-semibold text-white">
              {achievement.title}
            </h3>
          </div>
          
          <p className="text-gray-300 text-sm leading-relaxed">
            {achievement.description}
          </p>
          
          {/* Botão para fechar */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="mt-4 px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors duration-200"
          >
            Incrível! 🎊
          </button>
        </div>
      </div>
    </div>
  );
}
