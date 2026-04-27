import heroSpread from "@/assets/hero-spread.jpg";
import { useBooking } from "./BookingProvider";

const Hero = () => {
  const { open } = useBooking();
  return (
    <section id="top" className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      <div className="container grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 relative z-10">
          <p className="reveal text-sm tracking-[0.25em] uppercase text-primary mb-8">
            Filipino Catering · Est. 2014
          </p>
          <h1 className="reveal reveal-delay-1 font-display text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] text-balance text-foreground">
            Salu-salo, made <em className="text-primary not-italic font-display italic">unforgettable</em>.
          </h1>
          <p className="reveal reveal-delay-2 mt-8 text-lg text-muted-foreground max-w-md leading-relaxed">
            From lechon to kakanin — heirloom Filipino menus, hand-plated by our chefs and served with kalinga at every scale.
          </p>
          <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={open}
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all"
            >
              Book your event
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
            <a
              href="#menus"
              className="inline-flex items-center gap-2 px-6 py-4 text-foreground border-b border-foreground/30 hover:border-primary hover:text-primary transition-colors"
            >
              Explore the menus
            </a>
          </div>

          <div className="reveal reveal-delay-3 mt-16 grid grid-cols-3 gap-6 max-w-md">
            {[
              { n: "12+", l: "Years catering" },
              { n: "800", l: "Events served" },
              { n: "4.9★", l: "Client rating" },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-3xl text-foreground">{s.n}</div>
                <div className="text-xs tracking-wide uppercase text-muted-foreground mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Image */}
        <div className="lg:col-span-6 relative">
          <div className="relative aspect-[4/5] rounded-sm overflow-hidden shadow-soft">
            <img
              src={heroSpread}
              alt="Editorial overhead spread of Filipino catering with lechon, kare-kare, pancit and lumpia on banana leaves"
              width={1536}
              height={1536}
              className="w-full h-full object-cover animate-float-slow"
            />
            <div className="absolute inset-0 gradient-overlay pointer-events-none" />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden md:block bg-background border border-border px-6 py-4 rounded-sm shadow-card max-w-[220px]">
            <p className="font-display italic text-foreground leading-snug">
              "Food that tastes like a memory."
            </p>
            <p className="text-xs tracking-wide uppercase text-muted-foreground mt-2">— Condé Nast Traveler</p>
          </div>
        </div>
      </div>

      {/* Background flourish */}
      <div aria-hidden className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl -z-0" />
      <div aria-hidden className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl -z-0" />
    </section>
  );
};

export default Hero;
