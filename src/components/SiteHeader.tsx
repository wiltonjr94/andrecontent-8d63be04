import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin } from "lucide-react";
import { siteSettings } from "@/lib/content";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-3"
          aria-label="Ir para a home"
        >
          <img
            src={siteSettings.avatar}
            alt={siteSettings.name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-butter/60 transition-transform duration-300 group-hover:scale-105"
          />
          <span className="truncate text-lg font-semibold tracking-tight">
            {siteSettings.name}
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2">
          <SocialIcon href={siteSettings.instagram} label="Instagram">
            <Instagram className="h-5 w-5" />
          </SocialIcon>
          <SocialIcon href={siteSettings.linkedin} label="LinkedIn">
            <Linkedin className="h-5 w-5" />
          </SocialIcon>
        </nav>
      </div>
    </header>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground/80 transition-all duration-300 hover:border-butter hover:text-butter hover:-translate-y-0.5"
    >
      {children}
    </a>
  );
}