import React, { useState, useLayoutEffect, useRef } from "react";

// Os seletores foram atualizados e o passo da Carteira foi adicionado.
const tutorialSteps = [
  {
    title: "Bem-vindos à sua nova aventura! 🎉",
    text: "O DuoMatch é o playground de vocês. Um espaço para se conectar, provocar, e transformar cada dia em uma memória inesquecível. Vamos começar?",
    selector: null,
  },
  {
    title: "Tudo Começa na Rodada 🏆",
    text: "Pensem na Rodada como uma temporada do jogo de vocês. Aqui vocês definem a duração e as regras. Todos os pontos são ganhos e usados dentro da rodada ativa!",
    selector: '[data-tour-id="rounds-card"]',
    position: "bottom",
  },
  {
    title: "Atividades e Desafios",
    text: "Atividades são missões para fazer JUNTOS, onde ambos ganham pontos! Desafios são provocações: um propõe e o outro tenta cumprir para ganhar os pontos sozinho.",
    selector: '[data-tour-id="sugestoes-dia"]',
    position: "bottom",
  },
  {
    title: "Crie Seus Próprios Momentos 💡",
    text: "Use este botão para adicionar as suas próprias atividades e desafios. Surpreenda o seu par com ideias únicas!",
    selector: 'button[aria-label="Adicionar Novo Item"]',
    position: "top",
  },
  {
    title: "A Hot Zone 🔥",
    text: "Este é o cantinho reservado de vocês. As atividades e desafios aqui são... mais íntimos. O que acontece na Hot Zone, fica na Hot Zone.",
    selector: 'button[aria-label="Hot"]',
    position: "top",
  },
  {
    title: "Lista de Desejos ❤️",
    text: "Adicione presentes que você gostaria de ganhar. Seu par pode te surpreender e ainda ganhar os pontos indicados por você!",
    selector: 'button[aria-label="Desejos"]',
    position: "top",
  },
  {
    title: "A Loja dos Sonhos 🎁",
    text: "Aqui vocês criam 'vales' e recompensas personalizadas. Usem os pontos que ganharam nas atividades para 'comprar' esses prêmios um do outro.",
    selector: 'button[aria-label="Loja"]',
    position: "top",
  },
  {
    title: "Sua Carteira de Recompensas 💰",
    text: "Todas as recompensas que você compra ou vende ficam aqui. Gerencie o que você tem a receber e o que precisa 'pagar' para seu par.",
    selector: 'button[aria-label="Carteira"]',
    position: "top",
  },
  {
    title: "Tudo Pronto Para Começar!",
    text: "Agora vocês têm as chaves do reino. O último passo é criar a sua primeira Rodada para definir as regras e dar início ao jogo. Vamos lá!",
    selector: null,
  },
];

// Componente auxiliar para a sobreposição
const OverlayPart = ({ style }) => (
  <div
    className="fixed bg-black bg-opacity-80"
    style={{ ...style, transition: "all 0.3s ease-in-out", zIndex: 9990 }}
  />
);

export default function OnboardingView({ onFinish }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightProps, setHighlightProps] = useState(null);
  const currentStep = tutorialSteps[stepIndex];
  const dialogRef = useRef(null);

  useLayoutEffect(() => {
    if (!currentStep.selector) {
      setHighlightProps(null);
      return;
    }

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(currentStep.selector);
      let visibleElement = null;

      for (const el of elements) {
        if (el.offsetWidth > 0 || el.offsetHeight > 0) {
          visibleElement = el;
          break;
        }
      }

      if (visibleElement) {
        const rect = visibleElement.getBoundingClientRect();
        setHighlightProps({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setHighlightProps(null);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [stepIndex, currentStep.selector]);

  const handleNext = () => {
    if (stepIndex < tutorialSteps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const getDialogStyle = () => {
    if (!highlightProps) {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const DIALOG_MARGIN = 16;
    const dialogHeight = dialogRef.current
      ? dialogRef.current.offsetHeight
      : 180;
    const dialogWidth = dialogRef.current ? dialogRef.current.offsetWidth : 320;
    const hasSpaceAbove = highlightProps.top > dialogHeight + DIALOG_MARGIN;

    const style = {
      maxWidth: "calc(100vw - 32px)",
    };

    if (currentStep.position === "top" && hasSpaceAbove) {
      style.top = `${highlightProps.top - dialogHeight - DIALOG_MARGIN}px`;
    } else {
      style.top = `${
        highlightProps.top + highlightProps.height + DIALOG_MARGIN
      }px`;
    }

    let idealLeft =
      highlightProps.left + highlightProps.width / 2 - dialogWidth / 2;
    idealLeft = Math.max(idealLeft, DIALOG_MARGIN);
    if (idealLeft + dialogWidth > window.innerWidth) {
      idealLeft = window.innerWidth - dialogWidth - DIALOG_MARGIN;
    }
    style.left = `${idealLeft}px`;

    return style;
  };

  const renderOverlay = () => {
    if (!highlightProps) {
      return (
        <div className="fixed inset-0 z-[9990] bg-black bg-opacity-80 animate-fade-in backdrop-blur-sm" />
      );
    }

    const PADDING = 8;
    const top = highlightProps.top - PADDING;
    const left = highlightProps.left - PADDING;
    const width = highlightProps.width + PADDING * 2;
    const height = highlightProps.height + PADDING * 2;

    return (
      <>
        <OverlayPart
          style={{ top: 0, left: 0, width: "100%", height: `${top}px` }}
        />
        <OverlayPart
          style={{
            top: `${top + height}px`,
            left: 0,
            width: "100%",
            bottom: 0,
          }}
        />
        <OverlayPart
          style={{
            top: `${top}px`,
            left: 0,
            width: `${left}px`,
            height: `${height}px`,
          }}
        />
        <OverlayPart
          style={{
            top: `${top}px`,
            left: `${left + width}px`,
            right: 0,
            height: `${height}px`,
          }}
        />
        <div
          className="fixed border-2 border-yellow-400 border-dashed rounded-lg shadow-[0_0_20px_rgba(250,204,21,0.5)]"
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
            transition: "all 0.3s ease-in-out",
            pointerEvents: "none",
            zIndex: 9990,
          }}
        />
      </>
    );
  };

  const isFinalStep = stepIndex === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-[9980] animate-fade-in font-sans">
      {renderOverlay()}
      <div
        ref={dialogRef}
        className="absolute max-w-sm p-5 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl m-4 transition-all duration-300 z-[9999]"
        style={getDialogStyle()}
      >
        <h3 className="text-xl font-bold text-yellow-400 mb-2">
          {currentStep.title}
        </h3>
        <p className="text-gray-300 mb-5">{currentStep.text}</p>
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Pular Tutorial
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
          >
            {isFinalStep ? "Vamos Começar!" : "Próximo"}
          </button>
        </div>
      </div>
    </div>
  );
}
