import { useReveal } from "@/hooks/use-reveal";
import { Quote, Star } from "lucide-react";

const quotes = [
  {
    q: "Sampaguita & Saro turned our debut into the talk of the barangay. Lasang lutong-bahay, presented like fine dining.",
    name: "Lara Mendoza",
    role: "Mother of the debutante",
    initials: "LM",
  },
  {
    q: "They cooked for 250 guests and somehow made it feel like a Sunday lunch with family.",
    name: "Marco Villanueva",
    role: "Father of the bride",
    initials: "MV",
  },
  {
    q: "We've booked them for every quarterly all-hands. Their kare-kare is a religious experience.",
    name: "Camille Reyes",
    role: "COO, Atrium Studios Manila",
    initials: "CR",
  },
];

const QuoteCard = ({ t, i }: { t: typeof quotes[number]; i: number }) => {
  const r = useReveal<HTMLElement>();
  return (
    <figure
      ref={r.ref}
      className={`group relative bg-background rounded-3xl p-8 lg:p-10 border border-border/60 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-[320px] ${
        r.visible ? `reveal reveal-delay-${i + 1}` : "opacity-0"
      }`}
    >
      <Quote
        aria-hidden
        className="absolute top-7 right-7 w-10 h-10 text-primary/15 group-hover:text-primary/30 transition-colors"
        strokeWidth={1.5}
      />
      <div>
        <div className="flex gap-0.5 mb-5">
          {Array.from({ length: 5 }).map((_, k) => (
            <Star key={k} className="w-3.5 h-3.5 fill-primary text-primary" />
          ))}
        </div>
        <blockquote className="font-display italic text-xl lg:text-2xl text-foreground leading-snug text-pretty">
          "{t.q}"
        </blockquote>
      </div>
      <figcaption className="mt-8 pt-6 border-t border-border/70 flex items-center gap-4">
        <div className="w-11 h-11 rounded-full gradient-warm text-primary-foreground font-display text-sm flex items-center justify-center shadow-card">
          {t.initials}
        </div>
        <div>
          <div className="font-medium text-foreground">{t.name}</div>
          <div className="text-xs tracking-wide text-muted-foreground mt-0.5">
            {t.role}
          </div>
        </div>
      </figcaption>
    </figure>
  );
};

const Testimonials = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section
      id="testimonials"
      className="relative py-28 lg:py-40 bg-muted/60 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[140px]"
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
              ✦ Stories
            </p>
            <h2 className="font-display font-medium text-5xl lg:text-7xl leading-[0.95] tracking-tight text-foreground text-balance">
              Words from{" "}
              <em className="italic font-light text-gradient-warm">our tables</em>.
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <span className="font-mono">
              <span className="font-display text-foreground text-lg">4.9</span> /
              5.0 · 240+ reviews
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {quotes.map((t, i) => (
            <QuoteCard key={t.name} t={t} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
