import heroSpread from "@/assets/hero-spread.jpg";
import menuPrivate from "@/assets/menu-private.jpg";
import { useBooking } from "./BookingProvider";
import { ArrowUpRight, Sparkles } from "lucide-react";

const marqueeWords = [
  "Lechon",
  "Kare-Kare",
  "Sinigang",
  "Adobo",
  "Kakanin",
  "Boodle",
  "Pancit",
  "Sisig",
  "Halo-Halo",
  "Lumpia",
];

const Hero = () => {
  const { open } = useBooking();
  return (
    <section
      id="top"
      className="relative min-h-screen pt-32 pb-24 overflow-hidden grain"
    >
      {/* Animated orbs */}
      <div
        aria-hidden
        className="absolute -top-40 -right-32 w-[600px] h-[600px] rounded-full bg-primary/25 blur-[120px] animate-orb -z-10"
      />
      <div
        aria-hidden
        className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-accent/30 blur-[120px] animate-orb -z-10"
        style={{ animationDelay: "-6s" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[120px] animate-orb -z-10"
        style={{ animationDelay: "-12s" }}
      />

      <div className="container relative">
        {/* Top eyebrow */}
        <div className="reveal flex items-center gap-3 mb-10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-foreground/70">
            Now booking · Q2 2026
          </span>
        </div>

        {/* Massive headline */}
        <h1 className="reveal reveal-delay-1 font-display font-medium text-[clamp(3.5rem,11vw,10rem)] leading-[0.88] tracking-[-0.04em] text-foreground text-balance max-w-[18ch]">
          Heirloom <span className="italic font-light text-gradient-warm">Filipino</span> feasts,
          <br className="hidden md:block" />
          <span className="inline-flex items-baseline gap-4 flex-wrap">
            plated for
            <span className="relative inline-block">
              <span className="italic font-light">today.</span>
              <svg
                aria-hidden
                viewBox="0 0 200 12"
                className="absolute -bottom-2 left-0 w-full text-primary"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 8 Q 50 2, 100 6 T 198 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
        </h1>

        {/* Lower row: copy + image collage */}
        <div className="mt-16 grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          <div className="lg:col-span-5 reveal reveal-delay-2">
            <p className="text-lg lg:text-xl text-foreground/75 leading-relaxed text-pretty max-w-md">
              From <em className="text-primary not-italic font-medium">lechon centerpieces</em> to chef-led boodle dinners — Sampaguita &amp; Saro brings heirloom Filipino menus, hand-plated with kalinga, to every salu-salo.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={open}
                className="group relative inline-flex items-center gap-3 pl-7 pr-3 py-3 rounded-full bg-foreground text-background overflow-hidden transition-all hover:shadow-glow"
              >
                <span className="font-medium tracking-wide relative z-10">Book your event</span>
                <span className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background text-foreground transition-transform group-hover:rotate-45">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
                <span className="absolute inset-0 gradient-warm opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <a
                href="#menus"
                className="group inline-flex items-center gap-2 px-5 py-3 text-foreground hover:text-primary transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span className="border-b border-foreground/30 group-hover:border-primary pb-0.5">
                  Explore the menus
                </span>
              </a>
            </div>

            <div className="mt-14 grid grid-cols-3 gap-4 max-w-md">
              {[
                { n: "12+", l: "Years catering" },
                { n: "800", l: "Events served" },
                { n: "4.9★", l: "Client rating" },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-primary/40 pl-4">
                  <div className="font-display text-4xl text-foreground tracking-tight">{s.n}</div>
                  <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1.5">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image collage */}
          <div className="lg:col-span-7 relative reveal reveal-delay-3">
            <div className="relative grid grid-cols-12 gap-4">
              {/* Big image */}
              <div className="col-span-12 sm:col-span-9 relative aspect-[5/6] rounded-3xl overflow-hidden shadow-soft grain">
                <img
                  src={heroSpread}
                  alt="Editorial overhead spread of Filipino catering with lechon, kare-kare, pancit and lumpia on banana leaves"
                  width={1536}
                  height={1536}
                  className="w-full h-full object-cover animate-float-slow"
                />
                <div className="absolute inset-0 gradient-overlay pointer-events-none" />
                {/* Floating press card */}
                <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:max-w-[260px] glass-dark text-background rounded-2xl px-5 py-4">
                  <p className="font-display italic text-base leading-snug">
                    "Lasang lutong-bahay, dressed for the occasion."
                  </p>
                  <p className="text-[10px] tracking-[0.25em] uppercase text-background/60 mt-2 font-mono">
                    — Manila Bulletin
                  </p>
                </div>
              </div>

              {/* Side stack */}
              <div className="col-span-12 sm:col-span-3 flex sm:flex-col gap-4">
                <div className="relative flex-1 aspect-square sm:aspect-auto sm:h-1/2 rounded-2xl overflow-hidden shadow-card grain">
                  <img
                    src={menuPrivate}
                    alt="Boodle fight Filipino feast"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative flex-1 sm:h-1/2 rounded-2xl gradient-warm p-5 text-primary-foreground flex flex-col justify-between shadow-card overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-background/20 blur-2xl" />
                  <p className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-80">
                    Chef's pick
                  </p>
                  <div>
                    <p className="font-display text-2xl leading-tight">Lechon de Leche</p>
                    <p className="text-xs opacity-80 mt-1">slow-roasted, banana-leaf rested</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative spinning badge */}
            <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 hidden md:flex items-center justify-center w-28 h-28 rounded-full bg-foreground text-background animate-spin-slow">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                <defs>
                  <path
                    id="circle"
                    d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                  />
                </defs>
                <text className="font-mono text-[9px] tracking-[0.3em] uppercase fill-background">
                  <textPath href="#circle">
                    Hand-plated · Slow-cooked · Made with kalinga ·
                  </textPath>
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="relative mt-24 border-y border-border/60 bg-background/40 backdrop-blur-sm py-6 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeWords, ...marqueeWords].map((w, i) => (
            <span
              key={i}
              className="font-display italic text-4xl md:text-5xl px-8 text-foreground/80"
            >
              {w}
              <span className="text-primary mx-6">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
