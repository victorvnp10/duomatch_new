
import React, { useState } from "react";

export default function AnimatedButton({ 
  children, 
  onClick, 
  className = "", 
  variant = "primary",
  disabled = false,
  ...props 
}) {
  const [isPressed, setIsPressed] = useState(false);

  const baseClasses = "relative overflow-hidden transform transition-all duration-200 font-semibold rounded-lg";
  
  const variants = {
    primary: "bg-yellow-400 hover:bg-yellow-300 text-gray-900 hover:scale-105",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white hover:scale-105",
    success: "bg-green-500 hover:bg-green-400 text-white hover:scale-105",
    danger: "bg-red-500 hover:bg-red-400 text-white hover:scale-105"
  };

  const handleClick = (e) => {
    if (disabled) return;
    
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className} ${
        isPressed ? 'scale-95' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Efeito de ondulação */}
      <span className={`absolute inset-0 bg-white opacity-20 transform scale-0 rounded-full transition-transform duration-300 ${
        isPressed ? 'scale-150' : ''
      }`} />
    </button>
  );
}
