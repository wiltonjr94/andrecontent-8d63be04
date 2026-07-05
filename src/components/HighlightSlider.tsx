import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Highlight } from "@/lib/content";

export function HighlightSlider({ highlights }: { highlights: Highlight[] }) {
  const [active, setActive] = useState(0);
  const count = highlights.length;
  if (count === 0) return null;

  const go = (dir: number) => setActive((a) => (a + dir + count) % count);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {highlights.map((h) => (
          <Link
            key={h.id}
            to={h.link}
            className="group relative aspect-[16/10] w-full shrink-0 sm:aspect-[21/9]"
          >
            <img
              src={h.image}
              alt={h.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-denim/90 via-denim/20 to-transparent" />
            <div className="absolute bottom-0 left-0 flex items-center gap-2 p-6 sm:p-10">
              <span className="text-2xl font-semibold text-butter sm:text-4xl">
                {h.title}
              </span>
              <ArrowUpRight className="h-6 w-6 text-butter transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => go(-1)}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-denim/70 text-foreground backdrop-blur transition-colors hover:bg-tomato hover:text-tomato-foreground"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        aria-label="Próximo"
        className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-denim/70 text-foreground backdrop-blur transition-colors hover:bg-tomato hover:text-tomato-foreground"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-5 right-6 flex gap-2">
        {highlights.map((h, i) => (
          <button
            key={h.id}
            onClick={() => setActive(i)}
            aria-label={`Ir para destaque ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-butter" : "w-2 bg-foreground/40 hover:bg-foreground/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}