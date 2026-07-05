import { Instagram, Linkedin, Mail } from "lucide-react";
import { siteSettings } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <p className="text-2xl font-semibold text-butter">Vamos conversar?</p>
          <a
            href={`mailto:${siteSettings.email}`}
            className="mt-1 inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
          >
            <Mail className="h-4 w-4" /> {siteSettings.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={siteSettings.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:border-butter hover:text-butter"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href={siteSettings.linkedin}
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
        © {new Date().getFullYear()} {siteSettings.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}