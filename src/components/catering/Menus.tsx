import menuCorporate from "@/assets/menu-corporate.jpg";
import menuWeddings from "@/assets/menu-weddings.jpg";
import menuPrivate from "@/assets/menu-private.jpg";
import { useReveal } from "@/hooks/use-reveal";

const menus = [
  {
    img: menuCorporate,
    tag: "Corporate",
    title: "Handa sa Opisina",
    desc: "Adobo rice bowls, breakfast silog spreads and merienda grazing tables that keep teams fed and focused.",
    price: "from ₱850 / guest",
  },
  {
    img: menuWeddings,
    tag: "Kasalan",
    title: "Pamamanhikan",
    desc: "Multi-course Filipino tasting menus with lechon centerpieces and tropical pairings, served family-style or plated.",
    price: "from ₱2,800 / guest",
  },
  {
    img: menuPrivate,
    tag: "Private",
    title: "Boodle sa Bahay",
    desc: "Intimate kamayan dinners for 6 to 30. A chef in your kitchen, banana leaves on your table.",
    price: "from ₱1,950 / guest",
  },
];

const MenuCard = ({ m, i }: { m: typeof menus[number]; i: number }) => {
  const r = useReveal<HTMLElement>();
  return (
    <article
      ref={r.ref}
      className={`group cursor-pointer ${r.visible ? `reveal reveal-delay-${i + 1}` : "opacity-0"}`}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-muted">
        <img
          src={m.img}
          alt={m.title}
          loading="lazy"
          width={1024}
          height={1280}
          className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-[0.2em] uppercase text-foreground rounded-full">
          {m.tag}
        </div>
      </div>
      <h3 className="font-display text-3xl text-foreground group-hover:text-primary transition-colors">
        {m.title}
      </h3>
      <p className="mt-3 text-muted-foreground leading-relaxed">{m.desc}</p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-medium text-foreground">{m.price}</span>
        <span className="text-sm text-primary group-hover:translate-x-1 transition-transform">View →</span>
      </div>
    </article>
  );
};

const Menus = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section id="menus" className="py-28 lg:py-40 bg-background">
      <div className="container">
        <div ref={head.ref} className={`max-w-2xl mb-20 ${head.visible ? "reveal" : "opacity-0"}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary mb-5">Signature Menus</p>
          <h2 className="font-display text-5xl lg:text-6xl text-balance text-foreground">
            Three menus. <em className="italic text-primary">Endlessly</em> personal.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Every menu starts as a conversation — about the room, the season, and the people you're feeding.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {menus.map((m, i) => (
            <MenuCard key={m.title} m={m} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Menus;
