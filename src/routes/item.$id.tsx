import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getItemById, type ItemMedia } from "@/lib/public-data.functions";
import { toEmbed } from "@/lib/embed";

export const Route = createFileRoute("/item/$id")({
  loader: async ({ params }) => {
    const data = await getItemById({ data: { id: params.id } });
    if (!data.item) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const item = loaderData?.item;
    if (!item) {
      return { meta: [{ title: "Conteúdo não encontrado — André" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${item.title} — André` },
        { name: "description", content: item.description },
        { property: "og:title", content: `${item.title} — André` },
        { property: "og:description", content: item.description },
        ...(item.image_url ? [{ property: "og:image", content: item.image_url }] : []),
      ],
    };
  },
  component: ItemPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">Conteúdo não encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-butter hover:underline">
          Voltar para a home
        </Link>
      </div>
    </div>
  ),
});

function MediaBlock({ m }: { m: ItemMedia }) {
  const embed = m.media_type === "video" ? toEmbed(m.url) : null;

  const isDirectVideo =
    m.media_type === "video" &&
    !embed &&
    /\.(mp4|webm|mov|ogg)$/i.test(m.url);

  return (
    <figure className="group overflow-hidden rounded-3xl border border-border bg-card">
      <div className="aspect-[16/10] overflow-hidden bg-muted">

        {embed ? (
          <iframe
            src={embed}
            title={m.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : isDirectVideo ? (
          <video
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          >
            <source src={m.url} />
          </video>
        ) : (
          m.url && (
            <img
              src={m.url}
              alt={m.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )
        )}

      </div>

      {(m.title || m.description) && (
        <figcaption className="p-5">
          {m.title && (
            <h3 className="text-lg font-semibold">
              {m.title}
            </h3>
          )}

          {m.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {m.description}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}
      </div>
      {(m.title || m.description) && (
        <figcaption className="p-5">
          {m.title && <h3 className="text-lg font-semibold">{m.title}</h3>}
          {m.description && (
            <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function ItemPage() {
  const { item, media } = Route.useLoaderData();
  if (!item) return null;
  const coverEmbed = toEmbed(item.video_url);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-5 pt-32 sm:px-8 sm:pt-40">
        {item.page_slug ? (
          <Link
            to="/p/$slug"
            params={{ slug: item.page_slug }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> {item.page_title}
          </Link>
        ) : (
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        )}

        <header className="mt-6 fade-up">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-4xl font-bold sm:text-6xl">{item.title}</h1>
            {item.item_date && (
              <time className="text-sm text-muted-foreground">
                {new Date(item.item_date).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </time>
            )}
          </div>
          {item.description && (
            <p className="mt-4 max-w-2xl text-lg text-foreground/80">{item.description}</p>
          )}
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-runway transition-colors hover:text-butter"
            >
              Ver projeto <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </header>

        {(coverEmbed || item.image_url) && (
          <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-muted">
            <div className="aspect-[16/9]">
              {coverEmbed ? (
                <iframe
                  src={coverEmbed}
                  title={item.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : (
                item.image_url && (
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                )
              )}
            </div>
          </div>
        )}

        {media.length > 0 && (
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {media.map((m: ItemMedia) => (
              <MediaBlock key={m.id} m={m} />
            ))}
          </div>
        )}
      </main>

      <div className="mt-28">
        <SiteFooter />
      </div>
    </div>
  );
}
