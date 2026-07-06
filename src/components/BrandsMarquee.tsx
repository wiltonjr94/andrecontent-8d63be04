interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

export function BrandsMarquee({ brands }: { brands: Brand[] }) {
  if (brands.length === 0) return null;
  // Duplicate the list so the -50% translate loops seamlessly.
  const loop = [...brands, ...brands];
  const duration = Math.max(20, brands.length * 5);

  return (
    <section className="mt-24 border-y border-border py-10 sm:mt-32">
      <p className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Marcas que confiam no meu trabalho
      </p>
      <div className="group relative overflow-hidden">
        <div
          className="marquee-track flex w-max items-center gap-16 group-hover:[animation-play-state:paused]"
          style={{ ["--marquee-duration" as string]: `${duration}s` }}
        >
          {loop.map((b, i) => (
            <div
              key={`${b.id}-${i}`}
              className="flex h-16 shrink-0 items-center"
              aria-hidden={i >= brands.length}
            >
              {b.logo_url && (
                <img
                  src={b.logo_url}
                  alt={b.name}
                  loading="lazy"
                  className="h-full w-auto max-w-[160px] object-contain opacity-70 transition-opacity duration-300 hover:opacity-100"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}