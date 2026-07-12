import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { BrandsMarquee } from "@/components/BrandsMarquee";
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
  const projects = (featured.length > 0 ? featured : highlights).slice(0, 6);

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
        <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-24 sm:px-8 sm:pt-32">
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

        {/* Quem sou eu — texto à esquerda, imagem à direita */}
        <section
          id="quem-sou-eu"
          className="mx-auto mt-16 grid max-w-6xl items-center gap-10 px-5 sm:mt-24 sm:px-8 md:grid-cols-2"
        >
          <div className="order-2 md:order-1">
            <h2 className="text-3xl font-bold leading-tight text-butter sm:text-4xl lg:text-5xl" style={styleFor("about_heading")}>
              Mas afinal,<br />quem é o André?
            </h2>
            <p className="mt-6 max-w-lg text-base text-foreground/85 whitespace-pre-line sm:text-lg" style={styleFor("about_text", "body")}>
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
          <div className="order-1 flex justify-center md:order-2">
            <img
              src={quemSouEu.url}
              alt="André"
              loading="lazy"
              style={{ maxWidth: `${layout.about_max_width}px` }}
              className="w-full object-contain"
            />
          </div>
        </section>

        {/* Marcas que confiam */}
        <BrandsMarquee
          brands={brands}
          title={site.brands_title}
          titleStyle={styleFor("brands_title")}
        />

        {/* Serviços disponibilizados — imagem de ponta a ponta com título sobreposto */}
        <section className="relative left-1/2 mt-16 w-screen -translate-x-1/2 sm:mt-24">
          <div className="relative">
            <img
              src={servicos.url}
              alt="Serviços disponibilizados"
              loading="lazy"
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-denim/40 px-5 text-center">
              <h2
                className="text-2xl font-bold uppercase text-butter drop-shadow-lg sm:text-4xl lg:text-5xl"
                style={styleFor("services_title")}
              >
                {site.services_title || "SERVIÇOS DISPONIBILIZADOS"}
              </h2>
              <p
                className="max-w-2xl text-sm text-foreground drop-shadow-md sm:text-lg"
                style={styleFor("services_subtitle", "body")}
              >
                {site.services_subtitle ||
                  "Impulsione a sua empresa com vídeos incríveis e conquiste os melhores resultados."}
              </p>
            </div>
          </div>
        </section>

        {/* Projetos recentes — painel estático com até 6 projetos */}
        <section id="projetos" className="mx-auto mt-20 max-w-6xl px-5 sm:mt-28 sm:px-8">
          <h2
            className="mb-8 text-center text-2xl font-bold text-butter sm:text-4xl"
            style={styleFor("projects_title")}
          >
            Meus últimos projetos
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((h) => (
              <ProjectsGrid key={h.id} highlights={[h]} />
            ))}
          </div>
        </section>
      </main>

      <div className="mt-24 sm:mt-32">
        <SiteFooter />
      </div>
    </div>
  );
}
