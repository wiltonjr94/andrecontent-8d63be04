import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export interface SiteBundle {
  site: {
    name: string;
    avatar_url: string | null;
    hero_title: string;
    hero_subtitle: string;
    whatsapp: string;
    instagram: string;
    linkedin: string;
    email: string;
  };
  theme: {
    color_denim: string;
    color_butter: string;
    color_tomato: string;
    color_runway: string;
    font_display: string;
    font_body: string;
  };
  pages: { slug: string; title: string; description: string }[];
  highlights: { id: string; title: string; image_url: string | null; link: string }[];
}

const DEFAULT_BUNDLE: SiteBundle = {
  site: {
    name: "André",
    avatar_url: null,
    hero_title: "Oi, eu sou o André",
    hero_subtitle: "",
    whatsapp: "",
    instagram: "",
    linkedin: "",
    email: "",
  },
  theme: {
    color_denim: "#1E2540",
    color_butter: "#FFF0A6",
    color_tomato: "#FF4D2D",
    color_runway: "#2D6CDF",
    font_display: "Space Grotesk",
    font_body: "DM Sans",
  },
  pages: [],
  highlights: [],
};

export const getSiteBundle = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteBundle> => {
    try {
      const supabase = publicClient();
      const [siteRes, themeRes, pagesRes, highlightsRes] = await Promise.all([
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
        supabase.from("theme_settings").select("*").limit(1).maybeSingle(),
        supabase.from("pages").select("slug, title, description").order("sort_order"),
        supabase
          .from("highlights")
          .select("id, title, image_url, link")
          .order("sort_order"),
      ]);
      return {
        site: siteRes.data ?? DEFAULT_BUNDLE.site,
        theme: themeRes.data ?? DEFAULT_BUNDLE.theme,
        pages: pagesRes.data ?? [],
        highlights: highlightsRes.data ?? [],
      };
    } catch {
      return DEFAULT_BUNDLE;
    }
  },
);

export interface PageData {
  page: { slug: string; title: string; description: string } | null;
  items: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    item_date: string | null;
    link: string | null;
  }[];
}

export const getPageBySlug = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }): Promise<PageData> => {
    const supabase = publicClient();
    const { data: page } = await supabase
      .from("pages")
      .select("id, slug, title, description")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!page) return { page: null, items: [] };
    const { data: items } = await supabase
      .from("content_items")
      .select("id, title, description, image_url, video_url, item_date, link")
      .eq("page_id", page.id)
      .order("sort_order");
    return {
      page: { slug: page.slug, title: page.title, description: page.description },
      items: items ?? [],
    };
  });