import { useReveal } from "@/hooks/use-reveal";

const quotes = [
  {
    q: "Saffron & Sage turned our launch dinner into the talk of the season. Every detail — exquisite.",
    name: "Lena Ortiz",
    role: "Head of Brand, Maison Verre",
  },
  {
    q: "They cooked for 180 guests and somehow made it feel like a dinner party for twelve.",
    name: "Ravi Mehta",
    role: "Father of the bride",
  },
  {
    q: "We've worked with them quarterly for three years. Always seasonal, always surprising.",
    name: "Camille Beaumont",
    role: "COO, Atrium Studios",
  },
];

const QuoteCard = ({ t, i }: { t: typeof quotes[number]; i: number }) => {
  const r = useReveal<HTMLElement>();
  return (
    <figure
      ref={r.ref}
      className={`bg-background p-8 lg:p-10 rounded-sm shadow-card flex flex-col justify-between min-h-[280px] ${
        r.visible ? `reveal reveal-delay-${i + 1}` : "opacity-0"
      }`}
    >
      <blockquote className="font-display italic text-xl lg:text-2xl text-foreground leading-snug">
        "{t.q}"
      </blockquote>
      <figcaption className="mt-8 pt-6 border-t border-border">
        <div className="font-medium text-foreground">{t.name}</div>
        <div className="text-sm text-muted-foreground mt-1">{t.role}</div>
      </figcaption>
    </figure>
  );
};

const Testimonials = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section id="testimonials" className="py-28 lg:py-40 bg-muted">
      <div className="container">
        <div ref={head.ref} className={`max-w-2xl mb-16 ${head.visible ? "reveal" : "opacity-0"}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary mb-5">Stories</p>
          <h2 className="font-display text-5xl lg:text-6xl text-foreground text-balance">
            Words from <em className="italic text-primary">our tables</em>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {quotes.map((t, i) => (
            <QuoteCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
