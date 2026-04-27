import { useReveal } from "@/hooks/use-reveal";

const steps = [
  {
    n: "01",
    title: "Kuwentuhan",
    desc: "We meet over coffee or kapeng barako to learn about your event, your guests and your vision.",
  },
  {
    n: "02",
    title: "The Menu",
    desc: "Our chefs design a bespoke Filipino menu — heirloom or modern — tailored to your venue and your guests.",
  },
  {
    n: "03",
    title: "The Handaan",
    desc: "We arrive early, plate beautifully, and serve with kalinga and grace from start to finish.",
  },
];

const Step = ({ s, i }: { s: typeof steps[number]; i: number }) => {
  const r = useReveal<HTMLDivElement>();
  return (
    <div
      ref={r.ref}
      className={`relative group rounded-3xl p-8 lg:p-10 border border-background/10 bg-background/[0.03] hover:bg-background/[0.06] transition-all hover:-translate-y-2 duration-500 ${
        r.visible ? `reveal reveal-delay-${i + 1}` : "opacity-0"
      }`}
    >
      <div className="flex items-start justify-between mb-10">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary-glow/80">
          Step {s.n}
        </span>
        <span className="font-display italic text-7xl lg:text-8xl text-gradient-warm leading-none">
          {s.n}
        </span>
      </div>
      <h3 className="font-display text-3xl lg:text-4xl text-background mb-4 tracking-tight">
        {s.title}
      </h3>
      <p className="text-background/65 leading-relaxed text-pretty">{s.desc}</p>

      <div className="mt-10 h-px bg-gradient-to-r from-primary-glow/40 via-background/10 to-transparent" />
    </div>
  );
};

const Process = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section
      id="process"
      className="relative py-28 lg:py-40 gradient-ink text-background overflow-hidden grain"
    >
      <div
        aria-hidden
        className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/30 blur-[150px] animate-orb"
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/20 blur-[150px] animate-orb"
        style={{ animationDelay: "-9s" }}
      />

      <div className="container relative z-10">
        <div
          ref={head.ref}
          className={`max-w-3xl mb-16 lg:mb-24 ${head.visible ? "reveal" : "opacity-0"}`}
        >
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary-glow mb-5">
            ✦ How it works
          </p>
          <h2 className="font-display font-medium text-5xl lg:text-7xl leading-[0.95] tracking-tight text-balance">
            From first hello
            <br />
            to <em className="italic font-light text-gradient-warm">last bite</em>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((s, i) => (
            <Step key={s.n} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;
