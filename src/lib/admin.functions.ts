import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

// Grants admin to the current user only if no admin exists yet (first login).
export const claimAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // The RLS policy "First user can claim admin" allows this insert only while
    // no admin exists yet. If one already exists (or the user is already admin),
    // the insert is rejected and we simply report the current status.
    await context.supabase
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    const { data } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [site, theme, pages, items, highlights, brands, media, filters] = await Promise.all([
      context.supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      context.supabase.from("theme_settings").select("*").limit(1).maybeSingle(),
      context.supabase.from("pages").select("*").order("sort_order"),
      context.supabase.from("content_items").select("*").order("sort_order"),
      context.supabase.from("highlights").select("*").order("sort_order"),
      context.supabase.from("brands").select("*").order("sort_order"),
      context.supabase.from("item_media").select("*").order("sort_order"),
      context.supabase.from("filter_options").select("*").order("sort_order"),
    ]);
    return {
      site: site.data,
      theme: theme.data,
      pages: pages.data ?? [],
      items: items.data ?? [],
      highlights: highlights.data ?? [],
      brands: brands.data ?? [],
      media: media.data ?? [],
      filters: filters.data ?? [],
    };
  });

const siteSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
  logo_url: z.string().optional(),
  hero_title: z.string(),
  hero_subtitle: z.string(),
  whatsapp: z.string(),
  instagram: z.string(),
  linkedin: z.string(),
  email: z.string(),
  layout: z
    .object({
      logo_height: z.number(),
      hero_max_width: z.number(),
      hero_offset_y: z.number(),
      about_max_width: z.number(),
      services_max_width: z.number(),
      background_url: z.string().nullable(),
    })
    .optional(),
});

export const saveSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => siteSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = await context.supabase.from("site_settings").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const themeSchema = z.object({
  id: z.string(),
  color_denim: z.string(),
  color_butter: z.string(),
  color_tomato: z.string(),
  color_runway: z.string(),
  font_display: z.string(),
  font_body: z.string(),
  custom_font_display_url: z.string().optional(),
  custom_font_body_url: z.string().optional(),
});

export const saveTheme = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => themeSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { id, ...rest } = data;
    const { error } = await context.supabase.from("theme_settings").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  sort_order: z.number().optional(),
});

export const savePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => pageSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.id) {
      const { error } = await context.supabase
        .from("pages")
        .update({ slug: data.slug, title: data.title, description: data.description })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase.from("pages").insert({
        slug: data.slug,
        title: data.title,
        description: data.description,
        sort_order: data.sort_order ?? 0,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("pages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const itemSchema = z.object({
  id: z.string().optional(),
  page_id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  image_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  item_date: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  sort_order: z.number().optional(),
});

export const saveItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => itemSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const payload = {
      page_id: data.page_id,
      title: data.title,
      description: data.description,
      image_url: data.image_url || null,
      video_url: data.video_url || null,
      item_date: data.item_date || null,
      link: data.link || null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("content_items").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("content_items")
        .insert({ ...payload, sort_order: data.sort_order ?? 0 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("content_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const highlightSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  image_url: z.string().nullable().optional(),
  link: z.string(),
  sort_order: z.number().optional(),
});

export const saveHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => highlightSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const payload = { title: data.title, image_url: data.image_url || null, link: data.link };
    if (data.id) {
      const { error } = await context.supabase.from("highlights").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("highlights")
        .insert({ ...payload, sort_order: data.sort_order ?? 0 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("highlights").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Generic reorder: table + ordered list of ids
export const reorder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        table: z.enum(["pages", "content_items", "highlights", "brands", "item_media"]),
        ids: z.array(z.string()),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    await Promise.all(
      data.ids.map((id, index) =>
        context.supabase.from(data.table).update({ sort_order: index }).eq("id", id),
      ),
    );
    return { ok: true };
  });

// Upload media (base64) via service role; returns public media route path
export const uploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ filename: z.string(), contentType: z.string(), base64: z.string() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const bytes = Buffer.from(data.base64, "base64");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `uploads/${Date.now()}-${safe}`;
    const projectId = process.env.SUPABASE_PROJECT_ID;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!projectId || !key) throw new Error("Storage not configured");
    const res = await fetch(
      `https://${projectId}.supabase.co/storage/v1/object/media/${path}`,
      {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": data.contentType || "application/octet-stream",
          "x-upsert": "false",
        },
        body: bytes,
      },
    );
    if (!res.ok) throw new Error("Upload failed: " + (await res.text()));
    return { url: `/api/public/media/${path}` };
  });

// ----- Brands -----
const brandSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  logo_url: z.string().nullable().optional(),
  sort_order: z.number().optional(),
});

export const saveBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => brandSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const payload = { name: data.name, logo_url: data.logo_url || null };
    if (data.id) {
      const { error } = await context.supabase.from("brands").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("brands")
        .insert({ ...payload, sort_order: data.sort_order ?? 0 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("brands").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ----- Item media (gallery) -----
const mediaSchema = z.object({
  id: z.string().optional(),
  item_id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  media_type: z.enum(["image", "video"]),
  url: z.string().nullable().optional(),
  sort_order: z.number().optional(),
});

export const saveMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => mediaSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const payload = {
      item_id: data.item_id,
      title: data.title,
      description: data.description || "",
      media_type: data.media_type,
      url: data.url || null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("item_media").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("item_media")
        .insert({ ...payload, sort_order: data.sort_order ?? 0 });
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("item_media").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });