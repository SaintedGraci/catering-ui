import menuCorporate from "@/assets/menu-corporate.jpg";
import menuWeddings from "@/assets/menu-weddings.jpg";
import menuPrivate from "@/assets/menu-private.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { ArrowUpRight } from "lucide-react";

const menus = [
  {
    img: menuWeddings,
    tag: "Kasalan",
    n: "01",
    title: "Pamamanhikan",
    desc: "Multi-course Filipino tasting menus with lechon centerpieces and tropical pairings, served family-style or plated.",
    price: "from ₱2,800 / guest",
    span: "lg:col-span-7 lg:row-span-2",
    aspect: "lg:aspect-auto aspect-[4/5]",
    feature: true,
  },
  {
    img: menuCorporate,
    tag: "Corporate",
    n: "02",
    title: "Handa sa Opisina",
    desc: "Adobo rice bowls, silog spreads and merienda grazing tables that keep teams fed and focused.",
    price: "from ₱850 / guest",
    span: "lg:col-span-5",
    aspect: "aspect-[5/4]",
  },
  {
    img: menuPrivate,
    tag: "Private",
    n: "03",
    title: "Boodle sa Bahay",
    desc: "Intimate kamayan dinners for 6 to 30. A chef in your kitchen, banana leaves on your table.",
    price: "from ₱1,950 / guest",
    span: "lg:col-span-5",
    aspect: "aspect-[5/4]",
  },
];

const MenuCard = ({ m, i }: { m: typeof menus[number]; i: number }) => {
  const r = useReveal<HTMLElement>();
  return (
    <article
      ref={r.ref}
      className={`group relative ${m.span} ${
        r.visible ? `reveal reveal-delay-${(i % 3) + 1}` : "opacity-0"
      }`}
    >
      <div
        className={`relative ${m.aspect} overflow-hidden rounded-3xl bg-muted grain shadow-card`}
      >
        <img
          src={m.img}
          alt={m.title}
          loading="lazy"
          width={1024}
          height={1280}
          className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />

        {/* Top tag row */}
        <div className="absolute top-5 left-5 right-5 flex items-center justify-between text-background">
          <span className="glass-dark px-4 py-1.5 text-[10px] tracking-[0.25em] uppercase rounded-full font-mono">
            {m.tag}
          </span>
          <span className="font-mono text-xs tracking-[0.2em] opacity-70">{m.n}</span>
        </div>

        {/* Bottom content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-background">
          <h3
            className={`font-display ${
              m.feature ? "text-5xl lg:text-6xl" : "text-3xl lg:text-4xl"
            } leading-[0.95] tracking-tight`}
          >
            {m.title}
          </h3>
          <p
            className={`mt-3 text-background/80 leading-relaxed text-pretty ${
              m.feature ? "max-w-md text-base" : "text-sm"
            }`}
          >
            {m.desc}
          </p>
          <div className="mt-5 pt-4 border-t border-background/20 flex items-center justify-between">
            <span className="text-sm font-medium text-background">{m.price}</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-background text-foreground transition-transform group-hover:rotate-45">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

const Menus = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section
      id="menus"
      className="relative py-28 lg:py-40 bg-background overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-accent/15 blur-[120px] -z-0"
      />
      <div className="container relative">
        <div
          ref={head.ref}
          className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-20 ${
            head.visible ? "reveal" : "opacity-0"
          }`}
        >
          <div className="max-w-2xl">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-5">
              ✦ Signature Menus
            </p>
            <h2 className="font-display font-medium text-5xl lg:text-7xl leading-[0.95] tracking-tight text-balance text-foreground">
              Three menus.
              <br />
              <em className="italic font-light text-gradient-warm">Endlessly</em> Pinoy.
            </h2>
          </div>
          <p className="max-w-sm text-base lg:text-lg text-muted-foreground leading-relaxed">
            Every menu begins as a kuwentuhan — about the celebration, the season, and the people you're feeding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:auto-rows-[300px]">
          {menus.map((m, i) => (
            <MenuCard key={m.title} m={m} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menus;
