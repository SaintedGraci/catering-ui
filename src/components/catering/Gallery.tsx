import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import { useReveal } from "@/hooks/use-reveal";
import { useBooking } from "./BookingProvider";

const Gallery = () => {
  const { open } = useBooking();
  const head = useReveal<HTMLDivElement>();
  return (
    <section id="gallery" className="py-28 lg:py-40">
      <div className="container">
        <div ref={head.ref} className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 ${head.visible ? "reveal" : "opacity-0"}`}>
          <div className="max-w-xl">
            <p className="text-sm tracking-[0.25em] uppercase text-primary mb-5">Moments</p>
            <h2 className="font-display text-5xl lg:text-6xl text-balance text-foreground">
              From our <em className="italic text-primary">recent tables</em>.
            </h2>
          </div>
          <a href="#inquire" className="text-foreground border-b border-foreground/30 hover:border-primary hover:text-primary transition-colors pb-1 inline-block">
            Book a tasting →
          </a>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-7 aspect-[4/3] overflow-hidden rounded-sm group">
            <img src={g3} alt="Outdoor garden dinner under string lights" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
          </div>
          <div className="col-span-6 md:col-span-5 aspect-square overflow-hidden rounded-sm group">
            <img src={g1} alt="Chef plating with tweezers" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
          </div>
          <div className="col-span-6 md:col-span-5 aspect-[4/5] overflow-hidden rounded-sm group">
            <img src={g2} alt="Cocktail party canapés" loading="lazy" width={1024} height={1024} className="w-full h-full object-cover transition-transform duration-[1.4s] group-hover:scale-105" />
          </div>
          <div className="col-span-12 md:col-span-7 aspect-[5/4] overflow-hidden rounded-sm group bg-muted flex items-center justify-center p-12 text-center">
            <div>
              <p className="font-display italic text-3xl lg:text-4xl text-foreground text-balance leading-tight">
                "Every plate felt like it belonged to the room."
              </p>
              <p className="mt-6 text-sm tracking-[0.25em] uppercase text-muted-foreground">Maya &amp; Idris — Wedding, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
