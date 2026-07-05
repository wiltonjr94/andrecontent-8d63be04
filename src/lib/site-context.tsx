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
  const css = `:root{
  --denim:${theme.color_denim};
  --butter:${theme.color_butter};
  --butter-foreground:${theme.color_denim};
  --tomato:${theme.color_tomato};
  --runway:${theme.color_runway};
  --background:${theme.color_denim};
  --primary:${theme.color_runway};
  --accent:${theme.color_tomato};
  --ring:${theme.color_runway};
  --font-display:"${theme.font_display}", ui-sans-serif, system-ui, sans-serif;
  --font-body:"${theme.font_body}", ui-sans-serif, system-ui, sans-serif;
}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}