interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
}

interface BrandsMarqueeProps {
  brands: Brand[];
  title?: string;
  titleStyle?: React.CSSProperties;
}

export function BrandsMarquee({ brands, title, titleStyle }: BrandsMarqueeProps) {
  if (brands.length === 0) return null;
  const duration = Math.max(20, brands.length * 5);

  // Each group is an identical, self-contained copy. The trailing gap (pr-16)
  // matches the inner gap, so translating the two-group track by exactly -50%
  // (one full group width) produces a seamless, perfect loop in the order
  // the brands are registered.
  const Group = ({ hidden }: { hidden?: boolean }) => (
    <div className="flex shrink-0 items-center gap-16 pr-16" aria-hidden={hidden}>
      {brands.map((b, i) => (
        <div key={`${b.id}-${i}`} className="flex h-16 shrink-0 items-center">
          {b.logo_url && (
            <img
              src={b.logo_url}
              alt={b.name}
              loading="lazy"
              className="h-full w-auto max-w-[140px] object-contain opacity-70 transition-opacity duration-300 hover:opacity-100 sm:max-w-[160px]"
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <section className="mt-16 border-y border-border py-10 sm:mt-24">
      <h2
        className="mb-8 px-5 text-center text-2xl font-bold uppercase text-butter sm:text-3xl"
        style={titleStyle}
      >
        {title || "Marcas que confiam no meu trabalho"}
      </h2>
      <div className="group relative overflow-hidden">
        <div
          className="marquee-track flex w-max items-center group-hover:[animation-play-state:paused]"
          style={{ ["--marquee-duration" as string]: `${duration}s` }}
        >
          <Group />
          <Group hidden />
        </div>
      </div>
    </section>
  );
}