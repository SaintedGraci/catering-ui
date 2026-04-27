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

const Step = ({ s, i, last }: { s: typeof steps[number]; i: number; last: boolean }) => {
  const r = useReveal<HTMLDivElement>();
  return (
    <div ref={r.ref} className={`relative ${r.visible ? `reveal reveal-delay-${i + 1}` : "opacity-0"}`}>
      <div className="font-display text-7xl text-primary-glow/40 leading-none mb-6">{s.n}</div>
      <h3 className="font-display text-3xl text-background mb-4">{s.title}</h3>
      <p className="text-background/70 leading-relaxed">{s.desc}</p>
      {!last && <div aria-hidden className="hidden md:block absolute top-8 -right-8 w-16 h-px bg-background/20" />}
    </div>
  );
};

const Process = () => {
  const head = useReveal<HTMLDivElement>();
  return (
    <section id="process" className="py-28 lg:py-40 bg-foreground text-background relative overflow-hidden">
      <div className="container relative z-10">
        <div ref={head.ref} className={`max-w-2xl mb-20 ${head.visible ? "reveal" : "opacity-0"}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary-glow mb-5">How it works</p>
          <h2 className="font-display text-5xl lg:text-6xl text-balance">
            From first hello to <em className="italic text-primary-glow">last bite</em>.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
          {steps.map((s, i) => (
            <Step key={s.n} s={s} i={i} last={i === steps.length - 1} />
          ))}
        </div>
      </div>
      <div aria-hidden className="absolute top-1/2 -translate-y-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-primary/20 blur-3xl" />
    </section>
  );
};

export default Process;
