import React from "react";

/**
 * Sistema de avatares — cabeça estilo emoji (sem busto/ombros), com rosto
 * expressivo, recortada bem próxima como nos emojis de referência do
 * usuário. Cada avatar é definido por uma configuração pequena (tom de
 * pele, estilo de cabelo, cor de cabelo, tipo de barba/bigode) renderizada
 * por um único componente paramétrico — mais fácil de manter e mais
 * coerente visualmente do que dezenas de ilustrações desenhadas à mão.
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

/** Olhos, sobrancelhas e boca — compartilhados por todos os avatares, dão
 * a expressão amigável vista na referência. */
function FaceFeatures() {
  return (
    <>
      <path
        d="M46 38c2-2 6-3 9-2"
        stroke="#2A1E16"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M65 36c3-1 7 0 9 2"
        stroke="#2A1E16"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="50" cy="45" rx="3.2" ry="4" fill="#2A1E16" />
      <ellipse cx="70" cy="45" rx="3.2" ry="4" fill="#2A1E16" />
      <circle cx="51.2" cy="43.2" r="1" fill="#fff" opacity="0.85" />
      <circle cx="71.2" cy="43.2" r="1" fill="#fff" opacity="0.85" />
      <path
        d="M50 58q10 7 20 0"
        stroke="#7A3B2E"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** Cabeça: orelhas + rosto — sem ombros/busto, para o recorte "só a cabeça"
 * igual ao emoji de referência. */
function HeadBase({ skin, children }) {
  return (
    <>
      <ellipse cx="35" cy="48" rx="5" ry="7" fill={skin} />
      <ellipse cx="85" cy="48" rx="5" ry="7" fill={skin} />
      <circle cx="60" cy="46" r="26" fill={skin} />
      {children}
      <FaceFeatures />
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
  /** Bob repartido no meio, como o corte da referência feminina. */
  bob: (color) => (
    <path
      d="M33 42c-2-17 11-29 27-29s29 12 27 29c1 8 0 20-3 27-2-4-3-9-3-13 1-5-1-11-4-15-3 6-8 10-17 10s-14-4-17-10c-3 4-5 10-4 15 0 4-1 9-3 13-3-7-4-19-3-27z"
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
  /** Bigode "handlebar" — duas elipses inclinadas se encontrando no centro,
   * como no rosto de referência do usuário. */
  mustache: (color) => (
    <g fill={color}>
      <ellipse cx="47" cy="55" rx="9" ry="4" transform="rotate(-15 47 55)" />
      <ellipse cx="73" cy="55" rx="9" ry="4" transform="rotate(15 73 55)" />
    </g>
  ),
};

/** Recorte "só a cabeça": em vez de desenhar o rosto inteiro no viewBox
 * 0-120/0-100 (pensado originalmente para caber cabeça+ombros), a viewBox
 * aqui já entra dando zoom só na região da cabeça — é só isso que muda
 * para transformar o busto antigo num close de rosto estilo emoji. */
function AvatarGlyph({ skin, hair, hairColor, beard = "none", beardColor }) {
  const hairShape = HAIR_SHAPES[hair]?.(hairColor, skin);
  const beardShape = BEARD_SHAPES[beard]?.(beardColor || hairColor);

  return (
    <svg viewBox="26 8 68 82" className="w-full h-full">
      <HeadBase skin={skin}>{beardShape}</HeadBase>
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
  { id: "fem-6", name: "Longo ruivo", gradient: "from-gold-light to-accent",
    props: { skin: SKIN_TONES.porcelain, hair: "long", hairColor: "#A6491F" } },
  { id: "fem-7", name: "Cacheada clara", gradient: "from-accent-light to-sage",
    props: { skin: SKIN_TONES.light, hair: "curly", hairColor: "#6B3F1D" } },
  { id: "fem-8", name: "Coque grisalho", gradient: "from-gray-400 to-gray-600",
    props: { skin: SKIN_TONES.deep, hair: "bun", hairColor: "#B0AFAF" } },
  { id: "fem-9", name: "Loira bob", gradient: "from-gold-light to-gold",
    props: { skin: SKIN_TONES.porcelain, hair: "bob", hairColor: "#D9B65C" } },
  { id: "fem-10", name: "Longo preto", gradient: "from-plum to-ink-lighter",
    props: { skin: SKIN_TONES.medium, hair: "long", hairColor: "#120D0A" } },
  { id: "fem-11", name: "Hijab claro", gradient: "from-sage-light to-accent-dark",
    props: { skin: SKIN_TONES.porcelain, hair: "headscarf", hairColor: "#2E5C4A" } },
  { id: "fem-12", name: "Bob ruivo", gradient: "from-accent to-gold-dark",
    props: { skin: SKIN_TONES.light, hair: "bob", hairColor: "#A6491F" } },
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
  { id: "masc-7", name: "Bigode clássico", gradient: "from-gold to-accent-dark",
    props: { skin: SKIN_TONES.porcelain, hair: "short", hairColor: "#4A3324", beard: "mustache" } },
  { id: "masc-8", name: "Bigode grisalho", gradient: "from-gray-400 to-gray-600",
    props: { skin: SKIN_TONES.tan, hair: "short", hairColor: "#B7B4AF", beard: "mustache" } },
  { id: "masc-9", name: "Cacheado ruivo", gradient: "from-accent-light to-gold-light",
    props: { skin: SKIN_TONES.light, hair: "curly", hairColor: "#A6491F", beard: "stubble" } },
  { id: "masc-10", name: "Careca com bigode", gradient: "from-ink to-plum",
    props: { skin: SKIN_TONES.deep, hair: "bald", beard: "mustache", beardColor: "#1A1210" } },
  { id: "masc-11", name: "Boné escuro", gradient: "from-plum to-gray-800",
    props: { skin: SKIN_TONES.medium, hair: "cap", hairColor: "#14100D", beard: "stubble" } },
  { id: "masc-12", name: "Cabelo longo e barba", gradient: "from-gold-dark to-plum",
    props: { skin: SKIN_TONES.tan, hair: "long", hairColor: "#1F1512", beard: "full" } },
];

const CATALOG_BY_ID = [...FEMALE_AVATARS, ...MALE_AVATARS].reduce((acc, a) => {
  acc[a.id] = a;
  return acc;
}, {});

export const getAvatarOptionsForGender = (gender) =>
  gender === "masculino" ? MALE_AVATARS : FEMALE_AVATARS;

/**
 * Renderiza o avatar do usuário a partir de `photoURL`, que pode ser:
 *  - um novo id do catálogo (ex. "fem-3") → cabeça SVG estilo emoji;
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
