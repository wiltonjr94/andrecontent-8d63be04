import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HighlightSlider } from "@/components/HighlightSlider";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { useSite } from "@/lib/site-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { site, pages, highlights, brands } = useSite();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-5 pt-32 sm:px-8 sm:pt-40">
        {/* Hero */}
        <section className="fade-up">
          <h1 className="max-w-4xl text-5xl font-bold leading-[1.02] text-butter sm:text-7xl md:text-8xl">
            {site.hero_title}
          </h1>
          <p className="mt-8 max-w-2xl text-lg text-foreground/80 sm:text-xl">
            {site.hero_subtitle}
          </p>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-tomato px-7 py-3.5 text-base font-semibold text-tomato-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            <MessageCircle className="h-5 w-5" /> Diga oi
          </a>
        </section>

        {/* Brands marquee */}
        <BrandsMarquee brands={brands} />

        {/* Category cards */}
        <section className="mt-28 sm:mt-36">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Explore
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {pages.map((p) => (
              <Link
                key={p.slug}
                to="/p/$slug"
                params={{ slug: p.slug }}
                className="group relative flex min-h-44 flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-butter"
              >
                <ArrowUpRight className="h-7 w-7 self-end text-muted-foreground transition-all duration-300 group-hover:text-butter group-hover:translate-x-1 group-hover:-translate-y-1" />
                <div>
                  <h3 className="text-2xl font-semibold sm:text-3xl">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Highlights slider */}
        <section className="mt-28 sm:mt-36">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Destaques</h2>
          <HighlightSlider highlights={highlights} />
        </section>
      </main>

      <div className="mt-28 sm:mt-36">
        <SiteFooter />
      </div>
    </div>
  );
}
