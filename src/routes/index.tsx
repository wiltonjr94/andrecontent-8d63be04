import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ProjectsGrid } from "@/components/ProjectsGrid";
import { BrandsMarquee } from "@/components/BrandsMarquee";
import { useSite } from "@/lib/site-context";
import bgAzul from "@/assets/bg-azul.png.asset.json";
import heroImg from "@/assets/hero.png.asset.json";
import quemSouEu from "@/assets/quem-sou-eu.png.asset.json";
import servicos from "@/assets/servicos.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { site, highlights, brands } = useSite();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fundo azul global */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgAzul.url})` }}
      />

      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-28 sm:px-8 sm:pt-32">
          <h1 className="sr-only">{site.hero_title}</h1>
          <img
            src={heroImg.url}
            alt={site.hero_title}
            className="fade-up w-full max-w-2xl object-contain"
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
              className="w-full max-w-sm object-contain"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight text-butter sm:text-5xl">
              Mas afinal,<br />quem é o André?
            </h2>
            <p className="mt-6 max-w-lg text-lg text-foreground/85">
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
          <img
            src={servicos.url}
            alt="Serviços disponibilizados"
            loading="lazy"
            className="w-full rounded-3xl object-cover"
          />
        </section>

        {/* Projetos recentes */}
        <section id="projetos" className="mx-auto mt-20 max-w-6xl px-5 sm:mt-28 sm:px-8">
          <h2 className="mb-8 text-3xl font-bold text-butter sm:text-4xl">
            Meus últimos projetos
          </h2>
          <ProjectsGrid highlights={highlights} />
        </section>
      </main>

      <div className="mt-24 sm:mt-32">
        <SiteFooter />
      </div>
    </div>
  );
}
