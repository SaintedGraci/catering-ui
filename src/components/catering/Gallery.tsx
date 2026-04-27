import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { useBooking } from "./BookingProvider";
import { ArrowUpRight } from "lucide-react";

const Gallery = () => {
  const { open } = useBooking();
  const head = useReveal<HTMLDivElement>();
  return (
    <section id="gallery" className="relative py-28 lg:py-40 overflow-hidden">
      <div
        aria-hidden
        className="absolute -top-20 left-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] -z-0"
      />
      <div className="container relative">
        <div
          ref={head.ref}
          className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 lg:mb-20 ${
            head.visible ? "reveal" : "opacity-0"
          }`}
        >
          <div className="max-w-xl">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary mb-5">
              ✦ Moments
            </p>
            <h2 className="font-display font-medium text-5xl lg:text-7xl leading-[0.95] tracking-tight text-balance text-foreground">
              From our{" "}
              <em className="italic font-light text-gradient-warm">recent tables</em>.
            </h2>
          </div>
          <button
            onClick={open}
            className="group inline-flex items-center gap-3 self-start md:self-end px-5 py-3 rounded-full border border-foreground/15 hover:border-primary hover:bg-primary/5 transition-all"
          >
            <span className="text-sm font-medium text-foreground">Book a tasting</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background transition-transform group-hover:rotate-45">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <figure className="col-span-12 md:col-span-7 aspect-[4/3] overflow-hidden rounded-3xl group relative grain shadow-card">
            <img
              src={g3}
              alt="Filipino fiesta outdoor dinner under capiz lanterns"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
            />
            <figcaption className="absolute bottom-5 left-5 glass-dark text-background px-4 py-2 rounded-full text-xs font-mono tracking-[0.2em] uppercase">
              Fiesta · Tagaytay
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-5 aspect-square overflow-hidden rounded-3xl group relative grain shadow-card">
            <img
              src={g1}
              alt="Chef plating sisig on a sizzling plate"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
            />
            <figcaption className="absolute bottom-5 left-5 glass-dark text-background px-4 py-2 rounded-full text-xs font-mono tracking-[0.2em] uppercase">
              Sisig · Plated
            </figcaption>
          </figure>
          <figure className="col-span-6 md:col-span-5 aspect-[4/5] overflow-hidden rounded-3xl group relative grain shadow-card">
            <img
              src={g2}
              alt="Calamansi mojitos and lumpia at a cocktail event"
              loading="lazy"
              width={1024}
              height={1024}
              className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
            />
            <figcaption className="absolute bottom-5 left-5 glass-dark text-background px-4 py-2 rounded-full text-xs font-mono tracking-[0.2em] uppercase">
              Cocktails · Makati
            </figcaption>
          </figure>
          <div className="col-span-12 md:col-span-7 aspect-[5/4] overflow-hidden rounded-3xl group bg-foreground text-background relative p-10 lg:p-14 flex items-center justify-center text-center grain shadow-card">
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary/40 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/30 blur-3xl"
            />
            <div className="relative z-10">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-primary-glow">
                Client letter
              </span>
              <p className="mt-6 font-display italic font-light text-3xl lg:text-5xl text-balance leading-[1.05]">
                "Bawat sabaw, bawat ihaw — para kang nasa{" "}
                <span className="text-gradient-warm">bahay ng lola</span>."
              </p>
              <p className="mt-8 text-xs tracking-[0.3em] uppercase text-background/60 font-mono">
                Maya &amp; Iñigo · Kasalan, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
