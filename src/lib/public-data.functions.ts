import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import type { TextStyle } from "./text-style";

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
    logo_url: string;
    hero_title: string;
    hero_subtitle: string;
    whatsapp: string;
    instagram: string;
    linkedin: string;
    email: string;
    layout: HomeLayout;
    services_title: string;
    services_subtitle: string;
    brands_title: string;
    text_styles: Record<string, TextStyle>;
  };
  theme: {
    color_denim: string;
    color_butter: string;
    color_tomato: string;
    color_runway: string;
    font_display: string;
    font_body: string;
    custom_font_display_url: string;
    custom_font_body_url: string;
  };
  pages: { slug: string; title: string; description: string }[];
  highlights: { id: string; title: string; image_url: string | null; link: string }[];
  brands: { id: string; name: string; logo_url: string | null }[];
}

/** Size & position controls for the images on the home page. */
export interface HomeLayout {
  /** Header logo height in px. */
  logo_height: number;
  /** Hero image max width in px. */
  hero_max_width: number;
  /** Hero vertical nudge in px (negative = up). */
  hero_offset_y: number;
  /** "Quem sou eu" portrait max width in px. */
  about_max_width: number;
  /** Services image max width in px. */
  services_max_width: number;
  /** Optional background image override url. */
  background_url: string | null;
  /** How to render the page background. */
  background_mode: "image" | "color";
  /** Solid background color used when background_mode is "color". */
  background_color: string;
}

export const DEFAULT_LAYOUT: HomeLayout = {
  logo_height: 36,
  hero_max_width: 672,
  hero_offset_y: 0,
  about_max_width: 384,
  services_max_width: 1152,
  background_url: null,
  background_mode: "image",
  background_color: "#1E2540",
};

export function mergeLayout(raw: unknown): HomeLayout {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<HomeLayout>;
  return {
    logo_height: Number(obj.logo_height) || DEFAULT_LAYOUT.logo_height,
    hero_max_width: Number(obj.hero_max_width) || DEFAULT_LAYOUT.hero_max_width,
    hero_offset_y: Number(obj.hero_offset_y) || DEFAULT_LAYOUT.hero_offset_y,
    about_max_width: Number(obj.about_max_width) || DEFAULT_LAYOUT.about_max_width,
    services_max_width: Number(obj.services_max_width) || DEFAULT_LAYOUT.services_max_width,
    background_url: (obj.background_url as string) || null,
    background_mode: obj.background_mode === "color" ? "color" : "image",
    background_color: (obj.background_color as string) || DEFAULT_LAYOUT.background_color,
  };
}

const DEFAULT_BUNDLE: SiteBundle = {
  site: {
    name: "André",
    avatar_url: null,
    logo_url: "",
    hero_title: "Oi, eu sou o André",
    hero_subtitle: "",
    whatsapp: "",
    instagram: "",
    linkedin: "",
    email: "",
    layout: DEFAULT_LAYOUT,
    services_title: "SERVIÇOS DISPONIBILIZADOS",
    services_subtitle:
      "Impulsione a sua empresa com vídeos incríveis e conquiste os melhores resultados.",
    brands_title: "Marcas que confiam no meu trabalho",
    text_styles: {},
  },
  theme: {
    color_denim: "#1E2540",
    color_butter: "#FFF0A6",
    color_tomato: "#FF4D2D",
    color_runway: "#2D6CDF",
    font_display: "Space Grotesk",
    font_body: "DM Sans",
    custom_font_display_url: "",
    custom_font_body_url: "",
  },
  pages: [],
  highlights: [],
  brands: [],
};

export const getSiteBundle = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteBundle> => {
    try {
      const supabase = publicClient();
      const [siteRes, themeRes, pagesRes, highlightsRes, brandsRes] = await Promise.all([
        supabase.from("site_settings").select("*").limit(1).maybeSingle(),
        supabase.from("theme_settings").select("*").limit(1).maybeSingle(),
        supabase.from("pages").select("slug, title, description").order("sort_order"),
        supabase
          .from("highlights")
          .select("id, title, image_url, link")
          .order("sort_order"),
        supabase.from("brands").select("id, name, logo_url").order("sort_order"),
      ]);
      return {
        site: siteRes.data
          ? {
              ...siteRes.data,
              layout: mergeLayout((siteRes.data as any).layout),
              text_styles:
                ((siteRes.data as any).text_styles as Record<string, TextStyle>) ?? {},
            }
          : DEFAULT_BUNDLE.site,
        theme: themeRes.data ?? DEFAULT_BUNDLE.theme,
        pages: pagesRes.data ?? [],
        highlights: highlightsRes.data ?? [],
        brands: brandsRes.data ?? [],
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
    coverage: string | null;
    event_type: string | null;
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
      .select("id, title, description, image_url, video_url, item_date, link, coverage, event_type")
      .eq("page_id", page.id)
      .order("sort_order");
    return {
      page: { slug: page.slug, title: page.title, description: page.description },
      items: items ?? [],
    };
  });

export interface FilterOption {
  id: string;
  kind: "coverage" | "event";
  label: string;
}

export interface WorksData {
  items: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    item_date: string | null;
    coverage: string | null;
    event_type: string | null;
    page_slug: string | null;
  }[];
  filters: FilterOption[];
}

export const getAllWorks = createServerFn({ method: "GET" }).handler(
  async (): Promise<WorksData> => {
    try {
      const supabase = publicClient();
      const [itemsRes, pagesRes, filtersRes] = await Promise.all([
        supabase
          .from("content_items")
          .select(
            "id, title, description, image_url, video_url, item_date, coverage, event_type, page_id",
          )
          .order("sort_order"),
        supabase.from("pages").select("id, slug"),
        supabase.from("filter_options").select("id, kind, label").order("sort_order"),
      ]);
      const pageMap = new Map((pagesRes.data ?? []).map((p) => [p.id, p.slug]));
      const items = (itemsRes.data ?? []).map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        image_url: i.image_url,
        video_url: i.video_url,
        item_date: i.item_date,
        coverage: i.coverage,
        event_type: i.event_type,
        page_slug: pageMap.get(i.page_id) ?? null,
      }));
      return { items, filters: (filtersRes.data ?? []) as FilterOption[] };
    } catch {
      return { items: [], filters: [] };
    }
  },
);

export interface ItemMedia {
  id: string;
  title: string;
  description: string;
  media_type: string;
  url: string | null;
}

export interface ItemDetail {
  item: {
    id: string;
    title: string;
    description: string;
    image_url: string | null;
    video_url: string | null;
    item_date: string | null;
    link: string | null;
    page_slug: string | null;
    page_title: string | null;
  } | null;
  media: ItemMedia[];
}

export const getItemById = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ id: z.string() }).parse(data))
  .handler(async ({ data }): Promise<ItemDetail> => {
    const supabase = publicClient();
    const { data: item } = await supabase
      .from("content_items")
      .select("id, title, description, image_url, video_url, item_date, link, page_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!item) return { item: null, media: [] };
    const { data: page } = await supabase
      .from("pages")
      .select("slug, title")
      .eq("id", item.page_id)
      .maybeSingle();
    const { data: media } = await supabase
      .from("item_media")
      .select("id, title, description, media_type, url")
      .eq("item_id", item.id)
      .order("sort_order");
    return {
      item: {
        id: item.id,
        title: item.title,
        description: item.description,
        image_url: item.image_url,
        video_url: item.video_url,
        item_date: item.item_date,
        link: item.link,
        page_slug: page?.slug ?? null,
        page_title: page?.title ?? null,
      },
      media: media ?? [],
    };
  });