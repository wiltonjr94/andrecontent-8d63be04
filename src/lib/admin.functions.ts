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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: countError } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (countError) throw new Error(countError.message);
    if (!count) {
      const { error: insertError } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: context.userId, role: "admin" });
      if (insertError) throw new Error(insertError.message);
      return { isAdmin: true };
    }
    const { data } = await supabaseAdmin
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
    const [site, theme, pages, items, highlights] = await Promise.all([
      context.supabase.from("site_settings").select("*").limit(1).maybeSingle(),
      context.supabase.from("theme_settings").select("*").limit(1).maybeSingle(),
      context.supabase.from("pages").select("*").order("sort_order"),
      context.supabase.from("content_items").select("*").order("sort_order"),
      context.supabase.from("highlights").select("*").order("sort_order"),
    ]);
    return {
      site: site.data,
      theme: theme.data,
      pages: pages.data ?? [],
      items: items.data ?? [],
      highlights: highlights.data ?? [],
    };
  });

const siteSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar_url: z.string().nullable().optional(),
  hero_title: z.string(),
  hero_subtitle: z.string(),
  whatsapp: z.string(),
  instagram: z.string(),
  linkedin: z.string(),
  email: z.string(),
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
        table: z.enum(["pages", "content_items", "highlights"]),
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