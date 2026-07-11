/** Per-text styling controls editable from the admin panel. */
export interface TextStyle {
  font: "display" | "body";
  size: number | null; // px; null = usar tamanho padrão da seção
  bold: boolean;
  italic: boolean;
  underline: boolean;
  uppercase: boolean;
  color: string; // "" = cor padrão
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
  font: "display",
  size: null,
  bold: false,
  italic: false,
  underline: false,
  uppercase: false,
  color: "",
};

/** Editable text slots on the home page. */
export const TEXT_SLOTS: { key: string; label: string; defaultFont: "display" | "body" }[] = [
  { key: "about_heading", label: "Título 'Quem é o André?'", defaultFont: "display" },
  { key: "about_text", label: "Texto de apresentação", defaultFont: "body" },
  { key: "services_title", label: "Título dos serviços", defaultFont: "display" },
  { key: "services_subtitle", label: "Subtítulo dos serviços", defaultFont: "body" },
  { key: "projects_title", label: "Título 'Meus últimos projetos'", defaultFont: "display" },
];

export function mergeTextStyle(raw: unknown, defaultFont: "display" | "body" = "display"): TextStyle {
  const o = (raw && typeof raw === "object" ? raw : {}) as Partial<TextStyle>;
  return {
    font: o.font === "body" || o.font === "display" ? o.font : defaultFont,
    size: typeof o.size === "number" && o.size > 0 ? o.size : null,
    bold: !!o.bold,
    italic: !!o.italic,
    underline: !!o.underline,
    uppercase: !!o.uppercase,
    color: typeof o.color === "string" ? o.color : "",
  };
}

/** Converts a TextStyle to inline CSS properties. */
export function textStyleToCss(s: TextStyle): React.CSSProperties {
  return {
    fontFamily: s.font === "body" ? "var(--font-body)" : "var(--font-display)",
    ...(s.size ? { fontSize: `${s.size}px`, lineHeight: 1.15 } : {}),
    fontWeight: s.bold ? 700 : undefined,
    fontStyle: s.italic ? "italic" : undefined,
    textDecoration: s.underline ? "underline" : undefined,
    textTransform: s.uppercase ? "uppercase" : undefined,
    ...(s.color ? { color: s.color } : {}),
  };
}
