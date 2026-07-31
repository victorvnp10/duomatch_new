import React from "react";
import { HeartIcon, FireIcon, GiftIcon, TagIcon, WalletIcon } from "./Icons";

function BottomNavBar({ view, setView }) {
  // Array de itens de navegação com os 5 ícones definidos
  const navItems = [
    { name: "Início", view: "main", icon: <HeartIcon />, tourId: "nav-home" },
    { name: "Hot", view: "hot", icon: <FireIcon />, tourId: "nav-hot" },
    { name: "Desejos", view: "wishlist", icon: <GiftIcon />, tourId: "nav-wishlist" },
    { name: "Loja", view: "shop", icon: <TagIcon />, tourId: "nav-shop" },
    { name: "Carteira", view: "wallet", icon: <WalletIcon />, tourId: "nav-wallet" },
  ];

  return (
    // --- LAYOUT CORRIGIDO PARA 5 ITENS ---
    // h-16 fica no <nav>, não no container: assim o padding-bottom da área
    // seguro (aplicado no container via a regra .fixed.bottom-0 do index.css)
    // soma altura ABAIXO dos ícones, em vez de espremer o espaço deles.
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-t border-gray-700/50 z-20">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = view === item.view;
          return (
            <button
              key={item.name}
              data-tour-id={item.tourId}
              onClick={() => setView(item.view)}
              // O aria-label é importante para acessibilidade e para o tutorial
              aria-label={item.name}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive ? "text-yellow-400" : "text-gray-400 hover:text-white"
              }`}
            >
              <div className={`h-6 w-6 ${isActive ? "animate-pulse" : ""}`}>
                {item.icon}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? "font-bold" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default BottomNavBar;
