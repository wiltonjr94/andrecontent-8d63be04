import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPageBySlug, type PageData } from "@/lib/public-data.functions";

export const Route = createFileRoute("/p/$slug")({
  loader: async ({ params }) => {
    const data = await getPageBySlug({ data: { slug: params.slug } });
    if (!data.page) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Página não encontrada — André" }, { name: "robots", content: "noindex" }] };
    }
    const { page } = loaderData;
    if (!page) {
      return { meta: [{ title: "Página não encontrada — André" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${page.title} — André` },
        { name: "description", content: page.description },
        { property: "og:title", content: `${page.title} — André` },
        { property: "og:description", content: page.description },
      ],
    };
  },
  component: CategoryPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-3xl font-bold">Página não encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-butter hover:underline">
          Voltar para a home
        </Link>
      </div>
    </div>
  ),
});

function CategoryPage() {
  const { page, items } = Route.useLoaderData();
  if (!page) return null;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 sm:pt-40">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>

        <header className="mt-6 fade-up">
          <h1 className="text-5xl font-bold sm:text-7xl">{page.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/80">{page.description}</p>
        </header>

        {items.length === 0 ? (
          <p className="mt-16 text-muted-foreground">Ainda não há itens nesta página.</p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {items.map((item: PageData["items"][number], i: number) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 fade-up hover:-translate-y-1 hover:border-butter"
                style={{ animationDelay: `${Math.min(i, 8) * 70}ms` }}
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {toEmbed(item.video_url) ? (
                    <iframe
                      src={toEmbed(item.video_url)!}
                      title={item.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  ) : (
                    item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">{item.title}</h2>
                    {item.item_date && (
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {new Date(item.item_date).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-runway transition-colors hover:text-butter"
                    >
                      Ver projeto <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </article>
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