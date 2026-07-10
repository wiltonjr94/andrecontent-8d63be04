import { createContext, useContext, type ReactNode } from "react";
import type { SiteBundle } from "./public-data.functions";

const SiteContext = createContext<SiteBundle | null>(null);

export function SiteProvider({
  value,
  children,
}: {
  value: SiteBundle;
  children: ReactNode;
}) {
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteBundle {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}

/** Renders an inline <style> that maps DB theme values onto CSS design tokens. */
export function ThemeStyle({ theme }: { theme: SiteBundle["theme"] }) {
  const hasDisplay = !!theme.custom_font_display_url;
  const hasBody = !!theme.custom_font_body_url;
  const displayFamily = hasDisplay ? "AndreCustomDisplay" : theme.font_display;
  const bodyFamily = hasBody ? "AndreCustomBody" : theme.font_body;
  const faces = `${
    hasDisplay
      ? `@font-face{font-family:"AndreCustomDisplay";src:url("${theme.custom_font_display_url}");font-display:swap;}`
      : ""
  }${
    hasBody
      ? `@font-face{font-family:"AndreCustomBody";src:url("${theme.custom_font_body_url}");font-display:swap;}`
      : ""
  }`;
  const css = `${faces}:root{
  --denim:${theme.color_denim};
  --butter:${theme.color_butter};
  --butter-foreground:${theme.color_denim};
  --tomato:${theme.color_tomato};
  --runway:${theme.color_runway};
  --background:${theme.color_denim};
  --primary:${theme.color_runway};
  --accent:${theme.color_tomato};
  --ring:${theme.color_runway};
  --font-display:"${displayFamily}", ui-sans-serif, system-ui, sans-serif;
  --font-body:"${bodyFamily}", ui-sans-serif, system-ui, sans-serif;
}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}