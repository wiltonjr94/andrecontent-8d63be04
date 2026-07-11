import { createFileRoute, useRouter, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminData,
  saveSite,
  saveTheme,
  savePage,
  deletePage,
  saveItem,
  deleteItem,
  saveHighlight,
  deleteHighlight,
  reorder,
  uploadMedia,
  saveBrand,
  deleteBrand,
  saveMedia,
  deleteMedia,
  saveFilter,
  deleteFilter,
} from "@/lib/admin.functions";
import { ArrowDown, ArrowUp, LogOut, Trash2, Plus } from "lucide-react";
import { DEFAULT_LAYOUT, mergeLayout, type HomeLayout } from "@/lib/public-data.functions";
import {
  DEFAULT_TEXT_STYLE,
  mergeTextStyle,
  TEXT_SLOTS,
  type TextStyle,
} from "@/lib/text-style";

export const Route = createFileRoute("/_authenticated/admin")({
  loader: () => getAdminData(),
  component: AdminPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">Sem acesso</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
});

type Tab = "site" | "theme" | "pages" | "highlights" | "brands" | "filters";

const inputCls =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-runway";
const labelCls = "mb-1 block text-xs font-medium text-muted-foreground";
const cardCls = "rounded-2xl border border-border bg-card p-5";
const btnPrimary =
  "rounded-lg bg-runway px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60";
const btnGhost =
  "rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-butter hover:text-butter";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function AdminPage() {
  const data = Route.useLoaderData();
  const router = useRouter();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("site");
  const refresh = () => router.invalidate();

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <h1 className="text-lg font-bold text-butter">Painel do André</h1>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className={btnGhost}>
              Ver site
            </a>
            <button onClick={handleSignOut} className={btnGhost}>
              <LogOut className="inline h-4 w-4" /> Sair
            </button>
          </div>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-5 pb-2">
          {(
            [
              ["site", "Hero & Contato"],
              ["theme", "Cores & Fontes"],
              ["pages", "Páginas & Itens"],
              ["highlights", "Destaques"],
              ["brands", "Marcas"],
            ["filters", "Filtros"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === id ? "bg-runway text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {tab === "site" && <SiteSection data={data} onSaved={refresh} />}
        {tab === "theme" && <ThemeSection data={data} onSaved={refresh} />}
        {tab === "pages" && <PagesSection data={data} onSaved={refresh} />}
        {tab === "highlights" && <HighlightsSection data={data} onSaved={refresh} />}
        {tab === "brands" && <BrandsSection data={data} onSaved={refresh} />}
        {tab === "filters" && <FiltersSection data={data} onSaved={refresh} />}
      </main>
    </div>
  );
}

type AdminData = Awaited<ReturnType<typeof getAdminData>>;

function useUpload() {
  const upload = useServerFn(uploadMedia);
  return async (file: File) => {
    const base64 = await fileToBase64(file);
    const res = await upload({
      data: { filename: file.name, contentType: file.type, base64 },
    });
    return res.url;
  };
}

function ImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string) => void;
}) {
  const upload = useUpload();
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex items-center gap-3">
      {value && (
        <img src={value} alt="" className="h-14 w-14 rounded-lg object-cover" />
      )}
      <label className={`${btnGhost} cursor-pointer`}>
        {busy ? "Enviando..." : "Enviar imagem"}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              onChange(await upload(file));
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
    </div>
  );
}

function FontField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const upload = useUpload();
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className={`${btnGhost} cursor-pointer`}>
        {busy ? "Enviando..." : value ? "Trocar fonte" : "Enviar fonte"}
        <input
          type="file"
          accept=".woff,.woff2,.ttf,.otf,font/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              onChange(await upload(file));
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      {value && (
        <>
          <span className="text-xs text-muted-foreground">Fonte enviada ✓</span>
          <button type="button" className={`${btnGhost} text-tomato`} onClick={() => onChange("")}>
            Remover
          </button>
        </>
      )}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "px",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}: <span className="font-semibold text-foreground">{value}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-runway"
      />
    </div>
  );
}

function SiteSection({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(saveSite);
  const [form, setForm] = useState(data.site!);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  const [layout, setLayout] = useState<HomeLayout>(mergeLayout((data.site as any)?.layout));
  const setL = (k: keyof HomeLayout, v: number | string | null) =>
    setLayout({ ...layout, [k]: v } as HomeLayout);

  return (
    <div className={`${cardCls} space-y-4`}>
      <div>
        <label className={labelCls}>Logo do topo (aparece no menu)</label>
        <ImageField value={(form as any).logo_url || null} onChange={(url) => set("logo_url", url)} />
      </div>
      <div>
        <label className={labelCls}>Avatar / foto de apoio</label>
        <ImageField value={form.avatar_url} onChange={(url) => set("avatar_url", url)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" value={form.name} onChange={(v) => set("name", v)} />
        <Field label="Título do hero" value={form.hero_title} onChange={(v) => set("hero_title", v)} />
      </div>
      <div>
        <label className={labelCls}>Texto de apresentação</label>
        <textarea
          className={`${inputCls} min-h-24`}
          value={form.hero_subtitle}
          onChange={(e) => set("hero_subtitle", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Link do WhatsApp" value={form.whatsapp} onChange={(v) => set("whatsapp", v)} />
        <Field label="E-mail" value={form.email} onChange={(v) => set("email", v)} />
        <Field label="Instagram" value={form.instagram} onChange={(v) => set("instagram", v)} />
        <Field label="LinkedIn" value={form.linkedin} onChange={(v) => set("linkedin", v)} />
      </div>

      <div className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Tamanho e posição das imagens (página inicial)</h3>
          <button
            type="button"
            className={btnGhost}
            onClick={() => setLayout(DEFAULT_LAYOUT)}
          >
            Restaurar padrão
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RangeField label="Altura da logo do topo" value={layout.logo_height} min={20} max={120} onChange={(v) => setL("logo_height", v)} />
          <RangeField label="Largura do hero" value={layout.hero_max_width} min={300} max={1200} step={10} onChange={(v) => setL("hero_max_width", v)} />
          <RangeField label="Posição vertical do hero" value={layout.hero_offset_y} min={-120} max={120} onChange={(v) => setL("hero_offset_y", v)} />
          <RangeField label="Largura da foto 'Quem sou eu'" value={layout.about_max_width} min={200} max={800} step={10} onChange={(v) => setL("about_max_width", v)} />
          <RangeField label="Largura da imagem de serviços" value={layout.services_max_width} min={400} max={1400} step={10} onChange={(v) => setL("services_max_width", v)} />
        </div>
        <div>
          <label className={labelCls}>Imagem de fundo (opcional — substitui o azul padrão)</label>
          <ImageField value={layout.background_url} onChange={(url) => setL("background_url", url)} />
          {layout.background_url && (
            <button type="button" className={`${btnGhost} mt-2 text-tomato`} onClick={() => setL("background_url", null)}>
              Remover fundo personalizado
            </button>
          )}
        </div>
      </div>

      <button
        className={btnPrimary}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await save({ data: { ...form, layout } as any });
            onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        Salvar
      </button>
    </div>
  );
}

function ThemeSection({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const save = useServerFn(saveTheme);
  const [form, setForm] = useState(data.theme!);
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });
  const fonts = ["Space Grotesk", "DM Sans", "Sora", "Manrope", "Syne", "Outfit", "Inter"];
  const colors: [string, string][] = [
    ["color_denim", "Fundo (Deep Denim)"],
    ["color_butter", "Destaque (Butter Yellow)"],
    ["color_tomato", "Ação (Tomato Red)"],
    ["color_runway", "Ação (Runway Blue)"],
  ];
  return (
    <div className={`${cardCls} space-y-5`}>
      <div className="grid gap-4 sm:grid-cols-2">
        {colors.map(([k, label]) => (
          <div key={k}>
            <label className={labelCls}>{label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(form as any)[k]}
                onChange={(e) => set(k, e.target.value)}
                className="h-10 w-14 rounded border border-input bg-card"
              />
              <input
                className={inputCls}
                value={(form as any)[k]}
                onChange={(e) => set(k, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Fonte dos títulos" value={form.font_display} options={fonts} onChange={(v) => set("font_display", v)} />
        <SelectField label="Fonte do corpo" value={form.font_body} options={fonts} onChange={(v) => set("font_body", v)} />
      </div>
      <div className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
        <h3 className="text-sm font-semibold">Fontes personalizadas (arquivos enviados)</h3>
        <p className="text-xs text-muted-foreground">
          Envie arquivos .woff2, .woff, .ttf ou .otf. A fonte enviada substitui a seleção acima.
          Os títulos e os textos são controlados separadamente.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Fonte dos títulos</label>
            <FontField value={(form as any).custom_font_display_url || ""} onChange={(url) => set("custom_font_display_url", url)} />
          </div>
          <div>
            <label className={labelCls}>Fonte dos textos</label>
            <FontField value={(form as any).custom_font_body_url || ""} onChange={(url) => set("custom_font_body_url", url)} />
          </div>
        </div>
      </div>
      <button
        className={btnPrimary}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await save({ data: form });
            onSaved();
          } finally {
            setBusy(false);
          }
        }}
      >
        Salvar tema
      </button>
      <p className="text-xs text-muted-foreground">As mudanças aparecem no site ao recarregar.</p>
    </div>
  );
}

function PagesSection({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const savePageFn = useServerFn(savePage);
  const delPageFn = useServerFn(deletePage);
  const reorderFn = useServerFn(reorder);
  const [newPage, setNewPage] = useState({ slug: "", title: "", description: "" });

  const move = async (idx: number, dir: number) => {
    const arr = [...data.pages];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    await reorderFn({ data: { table: "pages", ids: arr.map((p) => p.id) } });
    onSaved();
  };

  return (
    <div className="space-y-6">
      <div className={cardCls}>
        <h2 className="mb-3 font-semibold">Nova página</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Título" value={newPage.title} onChange={(v) => setNewPage({ ...newPage, title: v })} />
          <Field label="Slug (url)" value={newPage.slug} onChange={(v) => setNewPage({ ...newPage, slug: v })} />
          <Field label="Descrição" value={newPage.description} onChange={(v) => setNewPage({ ...newPage, description: v })} />
        </div>
        <button
          className={`${btnPrimary} mt-3`}
          onClick={async () => {
            if (!newPage.title || !newPage.slug) return;
            await savePageFn({ data: { ...newPage, sort_order: data.pages.length } });
            setNewPage({ slug: "", title: "", description: "" });
            onSaved();
          }}
        >
          <Plus className="inline h-4 w-4" /> Criar página
        </button>
      </div>

      {data.pages.map((page, idx) => (
        <PageBlock
          key={page.id}
          page={page}
          items={data.items.filter((i) => i.page_id === page.id)}
          allMedia={data.media}
          canUp={idx > 0}
          canDown={idx < data.pages.length - 1}
          onMove={(dir) => move(idx, dir)}
          onSavePage={async (p) => {
            await savePageFn({ data: p });
            onSaved();
          }}
          onDeletePage={async () => {
            await delPageFn({ data: { id: page.id } });
            onSaved();
          }}
          onSaved={onSaved}
        />
      ))}
    </div>
  );
}

function PageBlock({
  page,
  items,
  allMedia,
  canUp,
  canDown,
  onMove,
  onSavePage,
  onDeletePage,
  onSaved,
}: {
  page: AdminData["pages"][number];
  items: AdminData["items"];
  allMedia: AdminData["media"];
  canUp: boolean;
  canDown: boolean;
  onMove: (dir: number) => void;
  onSavePage: (p: { id: string; slug: string; title: string; description: string }) => void;
  onDeletePage: () => void;
  onSaved: () => void;
}) {
  const [p, setP] = useState({ slug: page.slug, title: page.title, description: page.description });
  const saveItemFn = useServerFn(saveItem);
  const delItemFn = useServerFn(deleteItem);
  const reorderFn = useServerFn(reorder);
  const [adding, setAdding] = useState(false);

  const moveItem = async (idx: number, dir: number) => {
    const arr = [...items];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    await reorderFn({ data: { table: "content_items", ids: arr.map((i) => i.id) } });
    onSaved();
  };

  return (
    <div className={cardCls}>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="grow"><Field label="Título" value={p.title} onChange={(v) => setP({ ...p, title: v })} /></div>
        <div className="grow"><Field label="Slug" value={p.slug} onChange={(v) => setP({ ...p, slug: v })} /></div>
        <button className={btnGhost} disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
        <button className={btnGhost} disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
      </div>
      <Field label="Descrição" value={p.description} onChange={(v) => setP({ ...p, description: v })} />
      <div className="mt-3 flex gap-2">
        <button className={btnPrimary} onClick={() => onSavePage({ id: page.id, ...p })}>Salvar página</button>
        <button className={`${btnGhost} text-tomato`} onClick={onDeletePage}><Trash2 className="inline h-4 w-4" /> Excluir</button>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Itens ({items.length})</h3>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <ItemRow
              key={item.id}
              item={item}
              media={allMedia.filter((m) => m.item_id === item.id)}
              canUp={idx > 0}
              canDown={idx < items.length - 1}
              onMove={(dir) => moveItem(idx, dir)}
              onSave={async (payload) => {
                await saveItemFn({ data: payload });
                onSaved();
              }}
              onDelete={async () => {
                await delItemFn({ data: { id: item.id } });
                onSaved();
              }}
              onSaved={onSaved}
            />
          ))}
        </div>
        {adding ? (
          <ItemRow
            item={{ id: "", page_id: page.id, title: "", description: "", image_url: null, video_url: null, item_date: null, link: null, sort_order: items.length, created_at: "", updated_at: "" }}
            isNew
            onSave={async (payload) => {
              await saveItemFn({ data: { ...payload, sort_order: items.length } });
              setAdding(false);
              onSaved();
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button className={`${btnGhost} mt-3`} onClick={() => setAdding(true)}>
            <Plus className="inline h-4 w-4" /> Adicionar item
          </button>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  media,
  isNew,
  canUp,
  canDown,
  onMove,
  onSave,
  onDelete,
  onCancel,
  onSaved,
}: {
  item: AdminData["items"][number];
  media?: AdminData["media"];
  isNew?: boolean;
  canUp?: boolean;
  canDown?: boolean;
  onMove?: (dir: number) => void;
  onSave: (payload: any) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onSaved?: () => void;
}) {
  const [f, setF] = useState({
    id: item.id || undefined,
    page_id: item.page_id,
    title: item.title,
    description: item.description,
    image_url: item.image_url,
    link: item.link ?? "",
    item_date: item.item_date ?? "",
  });
  const set = (k: string, v: string | null) => setF({ ...f, [k]: v });

  return (
    <div className="rounded-xl border border-border/70 bg-background/40 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título" value={f.title} onChange={(v) => set("title", v)} />
        <Field label="Data" value={f.item_date} onChange={(v) => set("item_date", v)} type="date" />
      </div>
      <div className="mt-3">
        <label className={labelCls}>Descrição</label>
        <textarea className={`${inputCls} min-h-16`} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Link externo" value={f.link} onChange={(v) => set("link", v)} />
        <div>
          <label className={labelCls}>Imagem</label>
          <ImageField value={f.image_url} onChange={(url) => set("image_url", url)} />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => onSave(f)}>{isNew ? "Adicionar" : "Salvar"}</button>
        {isNew && onCancel && <button className={btnGhost} onClick={onCancel}>Cancelar</button>}
        {!isNew && onDelete && <button className={`${btnGhost} text-tomato`} onClick={onDelete}><Trash2 className="inline h-4 w-4" /></button>}
        {!isNew && onMove && (
          <>
            <button className={btnGhost} disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
            <button className={btnGhost} disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
          </>
        )}
      </div>
      {!isNew && item.id && (
        <MediaManager itemId={item.id} media={media ?? []} onSaved={onSaved ?? (() => {})} />
      )}
    </div>
  );
}

function MediaManager({
  itemId,
  media,
  onSaved,
}: {
  itemId: string;
  media: AdminData["media"];
  onSaved: () => void;
}) {
  const saveFn = useServerFn(saveMedia);
  const delFn = useServerFn(deleteMedia);
  const reorderFn = useServerFn(reorder);
  const [adding, setAdding] = useState(false);

  const move = async (idx: number, dir: number) => {
    const arr = [...media];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    await reorderFn({ data: { table: "item_media", ids: arr.map((m) => m.id) } });
    onSaved();
  };

  return (
    <div className="mt-4 rounded-xl border border-dashed border-border/70 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Galeria da cobertura ({media.length})
      </h4>
      <div className="space-y-3">
        {media.map((m, idx) => (
          <MediaRow
            key={m.id}
            m={m}
            itemId={itemId}
            canUp={idx > 0}
            canDown={idx < media.length - 1}
            onMove={(dir) => move(idx, dir)}
            onSave={async (payload) => {
              await saveFn({ data: payload });
              onSaved();
            }}
            onDelete={async () => {
              await delFn({ data: { id: m.id } });
              onSaved();
            }}
          />
        ))}
      </div>
      {adding ? (
        <MediaRow
          m={{ id: "", item_id: itemId, title: "", description: "", media_type: "image", url: null, sort_order: media.length, created_at: "", updated_at: "" }}
          itemId={itemId}
          isNew
          onSave={async (payload) => {
            await saveFn({ data: { ...payload, sort_order: media.length } });
            setAdding(false);
            onSaved();
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button className={`${btnGhost} mt-3`} onClick={() => setAdding(true)}>
          <Plus className="inline h-4 w-4" /> Adicionar foto/vídeo
        </button>
      )}
    </div>
  );
}

function MediaRow({
  m,
  itemId,
  isNew,
  canUp,
  canDown,
  onMove,
  onSave,
  onDelete,
  onCancel,
}: {
  m: AdminData["media"][number];
  itemId: string;
  isNew?: boolean;
  canUp?: boolean;
  canDown?: boolean;
  onMove?: (dir: number) => void;
  onSave: (payload: any) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState({
    id: m.id || undefined,
    item_id: itemId,
    title: m.title,
    description: m.description,
    media_type: (m.media_type === "video" ? "video" : "image") as "image" | "video",
    url: m.url ?? "",
  });
  const set = (k: string, v: string | null) => setF({ ...f, [k]: v });

  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título" value={f.title} onChange={(v) => set("title", v)} />
        <SelectField
          label="Tipo"
          value={f.media_type}
          options={["image", "video"]}
          onChange={(v) => set("media_type", v)}
        />
      </div>
      <div className="mt-3">
        <label className={labelCls}>Descrição (opcional)</label>
        <textarea className={`${inputCls} min-h-14`} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      {f.media_type === "video" ? (
        <div className="mt-3">
          <Field
            label="Link do vídeo (YouTube, Instagram, Vimeo)"
            value={f.url}
            onChange={(v) => set("url", v)}
          />
        </div>
      ) : (
        <div className="mt-3">
          <label className={labelCls}>Foto</label>
          <ImageField value={f.url || null} onChange={(url) => set("url", url)} />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => onSave(f)}>{isNew ? "Adicionar" : "Salvar"}</button>
        {isNew && onCancel && <button className={btnGhost} onClick={onCancel}>Cancelar</button>}
        {!isNew && onDelete && <button className={`${btnGhost} text-tomato`} onClick={onDelete}><Trash2 className="inline h-4 w-4" /></button>}
        {!isNew && onMove && (
          <>
            <button className={btnGhost} disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
            <button className={btnGhost} disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function BrandsSection({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const saveFn = useServerFn(saveBrand);
  const delFn = useServerFn(deleteBrand);
  const reorderFn = useServerFn(reorder);
  const [adding, setAdding] = useState(false);

  const move = async (idx: number, dir: number) => {
    const arr = [...data.brands];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    await reorderFn({ data: { table: "brands", ids: arr.map((b) => b.id) } });
    onSaved();
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Envie os logos (PNG) das marcas que confiam no seu trabalho. Eles aparecem em um carrossel contínuo na home.
      </p>
      {data.brands.map((b, idx) => (
        <BrandRow
          key={b.id}
          b={b}
          canUp={idx > 0}
          canDown={idx < data.brands.length - 1}
          onMove={(dir) => move(idx, dir)}
          onSave={async (payload) => {
            await saveFn({ data: payload });
            onSaved();
          }}
          onDelete={async () => {
            await delFn({ data: { id: b.id } });
            onSaved();
          }}
        />
      ))}
      {adding ? (
        <BrandRow
          b={{ id: "", name: "", logo_url: null, sort_order: data.brands.length, created_at: "", updated_at: "" }}
          isNew
          onSave={async (payload) => {
            await saveFn({ data: { ...payload, sort_order: data.brands.length } });
            setAdding(false);
            onSaved();
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button className={btnGhost} onClick={() => setAdding(true)}>
          <Plus className="inline h-4 w-4" /> Adicionar marca
        </button>
      )}
    </div>
  );
}

function BrandRow({
  b,
  isNew,
  canUp,
  canDown,
  onMove,
  onSave,
  onDelete,
  onCancel,
}: {
  b: AdminData["brands"][number];
  isNew?: boolean;
  canUp?: boolean;
  canDown?: boolean;
  onMove?: (dir: number) => void;
  onSave: (payload: any) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState({ id: b.id || undefined, name: b.name, logo_url: b.logo_url });
  const set = (k: string, v: string | null) => setF({ ...f, [k]: v });
  return (
    <div className={cardCls}>
      <Field label="Nome da marca" value={f.name} onChange={(v) => set("name", v)} />
      <div className="mt-3">
        <label className={labelCls}>Logo (PNG)</label>
        <ImageField value={f.logo_url} onChange={(url) => set("logo_url", url)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => onSave(f)}>{isNew ? "Adicionar" : "Salvar"}</button>
        {isNew && onCancel && <button className={btnGhost} onClick={onCancel}>Cancelar</button>}
        {!isNew && onDelete && <button className={`${btnGhost} text-tomato`} onClick={onDelete}><Trash2 className="inline h-4 w-4" /></button>}
        {!isNew && onMove && (
          <>
            <button className={btnGhost} disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
            <button className={btnGhost} disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function HighlightsSection({ data, onSaved }: { data: AdminData; onSaved: () => void }) {
  const saveFn = useServerFn(saveHighlight);
  const delFn = useServerFn(deleteHighlight);
  const reorderFn = useServerFn(reorder);
  const [adding, setAdding] = useState(false);

  const move = async (idx: number, dir: number) => {
    const arr = [...data.highlights];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    await reorderFn({ data: { table: "highlights", ids: arr.map((h) => h.id) } });
    onSaved();
  };

  return (
    <div className="space-y-4">
      {data.highlights.map((h, idx) => (
        <HighlightRow
          key={h.id}
          h={h}
          pages={data.pages}
          canUp={idx > 0}
          canDown={idx < data.highlights.length - 1}
          onMove={(dir) => move(idx, dir)}
          onSave={async (payload) => {
            await saveFn({ data: payload });
            onSaved();
          }}
          onDelete={async () => {
            await delFn({ data: { id: h.id } });
            onSaved();
          }}
        />
      ))}
      {adding ? (
        <HighlightRow
          h={{ id: "", title: "", image_url: null, link: "/", sort_order: data.highlights.length, created_at: "", updated_at: "" }}
          pages={data.pages}
          isNew
          onSave={async (payload) => {
            await saveFn({ data: { ...payload, sort_order: data.highlights.length } });
            setAdding(false);
            onSaved();
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button className={btnGhost} onClick={() => setAdding(true)}>
          <Plus className="inline h-4 w-4" /> Adicionar destaque
        </button>
      )}
    </div>
  );
}

function HighlightRow({
  h,
  pages,
  isNew,
  canUp,
  canDown,
  onMove,
  onSave,
  onDelete,
  onCancel,
}: {
  h: AdminData["highlights"][number];
  pages: AdminData["pages"];
  isNew?: boolean;
  canUp?: boolean;
  canDown?: boolean;
  onMove?: (dir: number) => void;
  onSave: (payload: any) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}) {
  const [f, setF] = useState({ id: h.id || undefined, title: h.title, image_url: h.image_url, link: h.link });
  const set = (k: string, v: string | null) => setF({ ...f, [k]: v });
  return (
    <div className={cardCls}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Título" value={f.title} onChange={(v) => set("title", v)} />
        <div>
          <label className={labelCls}>Página de destino</label>
          <select
            className={inputCls}
            value={f.link}
            onChange={(e) => set("link", e.target.value)}
          >
            <option value="/">Home</option>
            {pages.map((p) => (
              <option key={p.id} value={`/p/${p.slug}`}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className={labelCls}>Imagem</label>
        <ImageField value={f.image_url} onChange={(url) => set("image_url", url)} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button className={btnPrimary} onClick={() => onSave(f)}>{isNew ? "Adicionar" : "Salvar"}</button>
        {isNew && onCancel && <button className={btnGhost} onClick={onCancel}>Cancelar</button>}
        {!isNew && onDelete && <button className={`${btnGhost} text-tomato`} onClick={onDelete}><Trash2 className="inline h-4 w-4" /></button>}
        {!isNew && onMove && (
          <>
            <button className={btnGhost} disabled={!canUp} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></button>
            <button className={btnGhost} disabled={!canDown} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></button>
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}