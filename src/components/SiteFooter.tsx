import { Instagram, Linkedin, Mail } from "lucide-react";
import { useSite } from "@/lib/site-context";

export function SiteFooter() {
  const { site } = useSite();
  return (
    <footer className="border-t border-border/60 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-2xl font-semibold text-butter">Vamos conversar?</p>
          <a
            href={`mailto:${site.email}`}
            className="mt-1 inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
          >
            <Mail className="h-4 w-4" /> {site.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={site.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:border-butter hover:text-butter"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:border-butter hover:text-butter"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-sm text-muted-foreground">
        © {new Date().getFullYear()} {site.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}