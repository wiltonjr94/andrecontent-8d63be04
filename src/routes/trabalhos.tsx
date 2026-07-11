import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllWorks, type WorksData } from "@/lib/public-data.functions";
import { toEmbed } from "@/lib/embed";

export const Route = createFileRoute("/trabalhos")({
  loader: () => getAllWorks(),
  head: () => ({
    meta: [
      { title: "Trabalhos — André" },
      {
        name: "description",
        content:
          "Explore todos os trabalhos de André: fotografia, frames e captação para eventos corporativos, aniversários e muito mais.",
      },
      { property: "og:title", content: "Trabalhos — André" },
      {
        property: "og:description",
        content: "Todos os trabalhos de André, filtráveis por tipo de cobertura e tipo de evento.",
      },
    ],
  }),
  component: WorksPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <p className="text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <Link to="/" className="text-butter hover:underline">
        Voltar para a home
      </Link>
    </div>
  ),
});

function WorksPage() {
  const { items, filters } = Route.useLoaderData() as WorksData;
  const [coverage, setCoverage] = useState("");
  const [event, setEvent] = useState("");

  const coverageOpts = filters.filter((f) => f.kind === "coverage");
  const eventOpts = filters.filter((f) => f.kind === "event");

  const results = useMemo(
    () =>
      items.filter(
        (i) =>
          (!coverage || i.coverage === coverage) &&
          (!event || i.event_type === event),
      ),
    [items, coverage, event],
  );

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 sm:pt-40">
        <header className="fade-up">
          <h1 className="text-5xl font-bold sm:text-7xl">Trabalhos</h1>
          <p className="mt-4 max-w-2xl text-lg text-foreground/80">
            Pesquise por tipo de cobertura e tipo de evento para encontrar o que procura.
          </p>
        </header>

        {/* Barras de pesquisa com filtros */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <FilterSelect
            label="Tipo de cobertura"
            value={coverage}
            onChange={setCoverage}
            options={coverageOpts.map((o) => o.label)}
            placeholder="Todas as coberturas"
          />
          <FilterSelect
            label="Tipo de evento"
            value={event}
            onChange={setEvent}
            options={eventOpts.map((o) => o.label)}
            placeholder="Todos os eventos"
          />
        </div>

        {results.length === 0 ? (
          <p className="mt-16 text-muted-foreground">Nenhum trabalho encontrado com esses filtros.</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((item, i) => (
              <Link
                key={item.id}
                to="/item/$id"
                params={{ id: item.id }}
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 fade-up hover:-translate-y-1 hover:border-butter"
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
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
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{item.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.coverage && (
                      <span className="rounded-full bg-runway/20 px-2.5 py-0.5 text-xs text-runway">
                        {item.coverage}
                      </span>
                    )}
                    {item.event_type && (
                      <span className="rounded-full bg-tomato/20 px-2.5 py-0.5 text-xs text-tomato">
                        {item.event_type}
                      </span>
                    )}
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-runway transition-colors group-hover:text-butter">
                    Ver cobertura <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-full border border-input bg-card py-3.5 pl-11 pr-4 text-sm outline-none focus:border-runway"
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
