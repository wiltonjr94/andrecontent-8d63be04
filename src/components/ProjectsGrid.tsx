import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

interface Highlight {
  id: string;
  title: string;
  image_url: string | null;
  link: string;
}

export function ProjectsGrid({ highlights }: { highlights: Highlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {highlights.map((h) => (
        <Link
          key={h.id}
          to={h.link}
          className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-card"
        >
          {h.image_url && (
            <img
              src={h.image_url}
              alt={h.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-denim/90 via-denim/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-5">
            <span className="text-lg font-semibold uppercase leading-tight text-foreground sm:text-xl">
              {h.title}
            </span>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-butter text-butter-foreground transition-transform duration-300 group-hover:translate-x-1">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
