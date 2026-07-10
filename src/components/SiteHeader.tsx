import { Link } from "@tanstack/react-router";
import { useSite } from "@/lib/site-context";
import logo from "@/assets/andre-logo.png.asset.json";

export function SiteHeader() {
  const { site } = useSite();
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="group shrink-0" aria-label="Ir para a home">
          <img
            src={logo.url}
            alt={site.name}
            className="h-8 w-auto transition-transform duration-300 group-hover:scale-105 sm:h-9"
          />
        </Link>
        <nav className="flex shrink-0 items-center gap-4 sm:gap-7">
          <NavLink href="/">Página inicial</NavLink>
          <NavLink href="/#quem-sou-eu">Sobre</NavLink>
          <NavLink href="/#projetos">Trabalhos</NavLink>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            Fala comigo!
          </a>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="hidden text-sm font-medium text-foreground/85 transition-colors hover:text-butter sm:inline"
    >
      {children}
    </a>
  );
}