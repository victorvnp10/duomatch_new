import React from "react";

/**
 * Sistema de avatares — silhuetas geométricas minimalistas em vez de
 * emojis. Cada avatar é definido por uma configuração pequena (tom de
 * pele, estilo de cabelo, cor de cabelo, acessório) renderizada por um
 * único componente paramétrico — mais fácil de manter e mais coerente
 * visualmente do que 18 ilustrações desenhadas à mão.
 *
 * Compatibilidade: contas criadas antes desta atualização guardam o
 * avatar como um emoji cru em `photoURL`. O componente `Avatar` abaixo
 * continua renderizando esses valores antigos normalmente — só os
 * avatares NOVOS usam este catálogo (guardado como um id, ex. "fem-1").
 */

const SKIN_TONES = {
  porcelain: "#F2D3C4",
  light: "#E8B896",
  medium: "#C68B5E",
  tan: "#A66A42",
  deep: "#6B4226",
};

/** Silhueta base: cabeça + ombros, compartilhada por todos os avatares. */
function BustBase({ skin, children }) {
  return (
    <>
      <path
        d="M20 92c2-16 16-26 40-26s38 10 40 26v8H20v-8z"
        fill={skin}
      />
      <circle cx="60" cy="46" r="26" fill={skin} />
      {children}
    </>
  );
}

const HAIR_SHAPES = {
  short: (color) => (
    <path
      d="M34 42c-1-16 11-28 26-28s27 12 26 28c-3-6-9-9-13-6-2-8-9-13-13-13s-11 5-13 13c-4-3-10 0-13 6z"
      fill={color}
    />
  ),
  long: (color) => (
    <path
      d="M32 40c-2-17 11-30 28-30s30 13 28 30c1 10 2 30-4 42-2-14-4-24-4-30 2-6 0-13-4-17-3 7-9 11-20 11s-17-4-20-11c-4 4-6 11-4 17 0 6-2 16-4 30-6-12-5-32-4-42z"
      fill={color}
    />
  ),
  bun: (color) => (
    <>
      <path
        d="M34 42c-1-16 11-28 26-28s27 12 26 28c-3-6-9-9-13-6-2-8-9-13-13-13s-11 5-13 13c-4-3-10 0-13 6z"
        fill={color}
      />
      <circle cx="60" cy="10" r="9" fill={color} />
    </>
  ),
  curly: (color) => (
    <>
      {[...Array(9)].map((_, i) => {
        const angle = (i / 8) * Math.PI - Math.PI;
        const cx = 60 + Math.cos(angle) * 27;
        const cy = 34 + Math.sin(angle) * 22;
        return <circle key={i} cx={cx} cy={cy} r="9" fill={color} />;
      })}
    </>
  ),
  pixie: (color) => (
    <path
      d="M36 38c0-15 10-25 24-25s24 10 24 25c-4-4-8-5-11-3-1-7-7-12-13-12s-12 5-13 12c-3-2-7-1-11 3z"
      fill={color}
    />
  ),
  bald: () => null,
  headscarf: (color) => (
    <path
      d="M28 50c-2-24 13-40 32-40s34 16 32 40c0 6-2 11-5 14-1-14-6-24-13-29 1 5-1 9-4 11-3-9-9-15-10-15s-7 6-10 15c-3-2-5-6-4-11-7 5-12 15-13 29-3-3-5-8-5-14z"
      fill={color}
    />
  ),
  cap: (color) => (
    <>
      <path
        d="M34 40c0-15 12-26 26-26s26 11 26 26c-4-3-10-5-16-5H50c-6 0-12 2-16 5z"
        fill={color}
      />
      <ellipse cx="60" cy="40" rx="30" ry="5" fill={color} />
    </>
  ),
};

const BEARD_SHAPES = {
  none: () => null,
  full: (color) => (
    <path
      d="M38 54c0 16 9 28 22 28s22-12 22-28c0 10-9 14-22 14s-22-4-22-14z"
      fill={color}
      opacity="0.9"
    />
  ),
  stubble: (color) => (
    <path
      d="M40 58c0 13 8 22 20 22s20-9 20-22c0 6-9 9-20 9s-20-3-20-9z"
      fill={color}
      opacity="0.55"
    />
  ),
};

function AvatarGlyph({ skin, hair, hairColor, beard = "none", beardColor }) {
  const hairShape = HAIR_SHAPES[hair]?.(hairColor, skin);
  const beardShape = BEARD_SHAPES[beard]?.(beardColor || hairColor);

  return (
    <svg viewBox="0 0 120 100" className="w-full h-full">
      <BustBase skin={skin}>{beardShape}</BustBase>
      {hairShape}
    </svg>
  );
}

export const FEMALE_AVATARS = [
  { id: "fem-1", name: "Cabelo longo", gradient: "from-accent to-accent-dark",
    props: { skin: SKIN_TONES.porcelain, hair: "long", hairColor: "#3B2A22" } },
  { id: "fem-2", name: "Coque", gradient: "from-gold to-gold-dark",
    props: { skin: SKIN_TONES.medium, hair: "bun", hairColor: "#1F1512" } },
  { id: "fem-3", name: "Cacheada", gradient: "from-sage to-sage-light",
    props: { skin: SKIN_TONES.deep, hair: "curly", hairColor: "#151015" } },
  { id: "fem-4", name: "Pixie", gradient: "from-accent-light to-gold",
    props: { skin: SKIN_TONES.light, hair: "pixie", hairColor: "#8A5A2E" } },
  { id: "fem-5", name: "Hijab", gradient: "from-plum-light to-accent-dark",
    props: { skin: SKIN_TONES.tan, hair: "headscarf", hairColor: "#5C3A52" } },
  { id: "fem-6", name: "Cabelo longo ruivo", gradient: "from-gold-light to-accent",
    props: { skin: SKIN_TONES.porcelain, hair: "long", hairColor: "#A6491F" } },
];

export const MALE_AVATARS = [
  { id: "masc-1", name: "Cabelo curto", gradient: "from-plum-light to-ink-lighter",
    props: { skin: SKIN_TONES.light, hair: "short", hairColor: "#2A1E16", beard: "none" } },
  { id: "masc-2", name: "Barba cheia", gradient: "from-gold-dark to-gold",
    props: { skin: SKIN_TONES.medium, hair: "short", hairColor: "#1C1310", beard: "full" } },
  { id: "masc-3", name: "Cacheado", gradient: "from-sage to-sage-light",
    props: { skin: SKIN_TONES.deep, hair: "curly", hairColor: "#100C0C", beard: "stubble" } },
  { id: "masc-4", name: "Careca", gradient: "from-accent-dark to-plum",
    props: { skin: SKIN_TONES.tan, hair: "bald", beard: "stubble", beardColor: "#2A1E16" } },
  { id: "masc-5", name: "Boné", gradient: "from-accent to-gold",
    props: { skin: SKIN_TONES.porcelain, hair: "cap", hairColor: "#3D2F43", beard: "none" } },
  { id: "masc-6", name: "Pixie curto", gradient: "from-gold-light to-accent-light",
    props: { skin: SKIN_TONES.light, hair: "pixie", hairColor: "#5C4620", beard: "stubble" } },
];

const CATALOG_BY_ID = [...FEMALE_AVATARS, ...MALE_AVATARS].reduce((acc, a) => {
  acc[a.id] = a;
  return acc;
}, {});

export const getAvatarOptionsForGender = (gender) =>
  gender === "masculino" ? MALE_AVATARS : FEMALE_AVATARS;

/**
 * Renderiza o avatar do usuário a partir de `photoURL`, que pode ser:
 *  - um novo id do catálogo (ex. "fem-3") → silhueta SVG;
 *  - um emoji cru salvo antes desta atualização → mantém compatibilidade;
 *  - uma URL http (sistema ainda mais antigo) → `<img>`;
 *  - vazio → iniciais/ícone genérico.
 */
export function Avatar({ photoURL, nickname, size = "h-20 w-20", className = "" }) {
  const catalogEntry = photoURL ? CATALOG_BY_ID[photoURL] : null;

  if (catalogEntry) {
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br ${catalogEntry.gradient} p-2 shadow-lg ${className}`}
      >
        <AvatarGlyph {...catalogEntry.props} />
      </div>
    );
  }

  if (photoURL && photoURL.startsWith("http")) {
    return (
      <img
        src={photoURL}
        alt={nickname || "Avatar"}
        className={`${size} rounded-full object-cover ${className}`}
      />
    );
  }

  if (photoURL) {
    // Emoji legado.
    return (
      <div
        className={`${size} rounded-full bg-gradient-to-br from-plum-light to-ink-lighter flex items-center justify-center text-4xl ${className}`}
      >
        {photoURL}
      </div>
    );
  }

  return (
    <div
      className={`${size} rounded-full border-2 border-gray-600 bg-gray-700 flex items-center justify-center ${className}`}
    >
      <span className="text-gray-400 font-display text-xl">
        {(nickname || "?").charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
