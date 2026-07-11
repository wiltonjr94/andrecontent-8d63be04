import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { HorizontalScroller } from "@/components/HorizontalScroller";
import { useSite } from "@/lib/site-context";
import { mergeTextStyle, textStyleToCss } from "@/lib/text-style";
import bgAzul from "@/assets/bg-azul.png.asset.json";
import heroImg from "@/assets/hero.png.asset.json";
import quemSouEu from "@/assets/quem-sou-eu.png.asset.json";
import servicos from "@/assets/servicos.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { site, highlights, brands } = useSite();
  const layout = site.layout;
  const useColorBg = layout.background_mode === "color";
  const bgUrl = layout.background_url || bgAzul.url;

  const styleFor = (slot: string, defaultFont: "display" | "body" = "display") =>
    textStyleToCss(mergeTextStyle((site.text_styles || {})[slot], defaultFont));

  const featured = highlights.filter((h) => (h as any).featured);
  const projects = featured.length > 0 ? featured : highlights;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fundo global */}
      {useColorBg ? (
        <div
          aria-hidden
          className="fixed inset-0 -z-10"
          style={{ backgroundColor: layout.background_color }}
        />
      ) : (
        <div
          aria-hidden
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-28 sm:px-8 sm:pt-32">
          <h1 className="sr-only">{site.hero_title}</h1>
          <img
            src={heroImg.url}
            alt={site.hero_title}
            style={{
              maxWidth: `${layout.hero_max_width}px`,
              transform: `translateY(${layout.hero_offset_y}px)`,
            }}
            className="fade-up w-full object-contain"
          />
        </section>

        {/* Quem sou eu */}
        <section
          id="quem-sou-eu"
          className="mx-auto mt-16 grid max-w-6xl items-center gap-10 px-5 sm:mt-24 sm:px-8 md:grid-cols-2"
        >
          <div className="flex justify-center">
            <img
              src={quemSouEu.url}
              alt="André"
              loading="lazy"
              style={{ maxWidth: `${layout.about_max_width}px` }}
              className="w-full object-contain"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight text-butter sm:text-5xl" style={styleFor("about_heading")}>
              Mas afinal,<br />quem é o André?
            </h2>
            <p className="mt-6 max-w-lg text-lg text-foreground/85 whitespace-pre-line" style={styleFor("about_text", "body")}>
              {site.hero_subtitle ||
                "Publicitário e profissional do audiovisual apaixonado por contar histórias através da imagem. Atuo entre direção criativa, fotografia, vídeo e edição, transformando ideias em narrativas visuais com olhar estratégico e sensibilidade estética."}
            </p>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime px-7 py-3.5 text-base font-semibold text-lime-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" /> Fala comigo!
            </a>
          </div>
        </section>

        {/* Marcas que confiam */}
        <section className="mt-20 sm:mt-28">
          <BrandsMarquee brands={brands} />
        </section>

        {/* Serviços disponibilizados */}
        <section className="mx-auto mt-20 max-w-6xl px-5 sm:mt-28 sm:px-8">
          <div className="flex justify-center">
            <img
              src={servicos.url}
              alt="Serviços disponibilizados"
              loading="lazy"
              style={{ maxWidth: `${layout.services_max_width}px` }}
              className="w-full rounded-3xl object-cover"
            />
          </div>
          <h2
            className="mt-10 text-center text-3xl font-bold uppercase text-butter sm:text-4xl"
            style={styleFor("services_title")}
          >
            {site.services_title || "SERVIÇOS DISPONIBILIZADOS"}
          </h2>
          <p
            className="mx-auto mt-3 max-w-2xl text-center text-lg text-foreground/85"
            style={styleFor("services_subtitle", "body")}
          >
            {site.services_subtitle ||
              "Impulsione a sua empresa com vídeos incríveis e conquiste os melhores resultados."}
          </p>
        </section>

        {/* Projetos recentes */}
        <section id="projetos" className="mx-auto mt-20 max-w-6xl px-5 sm:mt-28 sm:px-8">
          <h2
            className="mb-8 text-center text-3xl font-bold text-butter sm:text-4xl"
            style={styleFor("projects_title")}
          >
            Meus últimos projetos
          </h2>
          <HorizontalScroller>
            {projects.map((h) => (
              <div key={h.id} className="w-[85%] shrink-0 snap-start sm:w-[48%]">
                <ProjectsGrid highlights={[h]} />
              </div>
            ))}
          </HorizontalScroller>
        </section>
      </main>

      <div className="mt-24 sm:mt-32">
        <SiteFooter />
      </div>
    </div>
  );
}
