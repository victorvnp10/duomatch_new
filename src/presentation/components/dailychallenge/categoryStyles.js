/**
 * Cada desafio semanal já vem com um `type` (romance, connection,
 * appreciation...). Antes disso, o card inteiro era pintado com
 * purple/pink fixos, sem relação com a paleta de marca (accent/gold/sage)
 * usada no resto do app. Agora a cor do card reflete a categoria real do
 * desafio, usando só cores que já existem na paleta.
 */
export const CATEGORY_STYLES = {
  romance: { label: "Romance", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  surprise: { label: "Surpresa", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  together: { label: "Juntos", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  touch: { label: "Carinho", card: "from-accent/20 to-accent-dark/20 border-accent/40", text: "text-accent-light", track: "bg-accent-dark/40", bar: "from-accent to-accent-dark" },
  connection: { label: "Conexão", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  communication: { label: "Comunicação", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  planning: { label: "Planejamento", card: "from-sage/20 to-sage-light/10 border-sage/40", text: "text-sage-light", track: "bg-sage/40", bar: "from-sage to-sage-light" },
  appreciation: { label: "Gratidão", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" },
  memory: { label: "Memórias", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" },
};
export const DEFAULT_CATEGORY_STYLE = { label: "Desafio", card: "from-gold/20 to-gold-dark/10 border-gold/40", text: "text-gold-light", track: "bg-gold-dark/40", bar: "from-gold to-gold-dark" };
