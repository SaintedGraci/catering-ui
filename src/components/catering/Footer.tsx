import { useBooking } from "./BookingProvider";
import { ArrowUpRight, Instagram, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  const { open } = useBooking();
  return (
    <footer className="relative gradient-ink text-background overflow-hidden grain">
      <div
        aria-hidden
        className="absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[140px]"
      />

      {/* CTA band */}
      <div className="container relative pt-24 lg:pt-32 pb-16">
        <div className="grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-primary-glow mb-5">
              ✦ Let's plan your handaan
            </p>
            <h2 className="font-display font-medium text-5xl lg:text-7xl leading-[0.95] tracking-tight text-balance">
              Ready to set the{" "}
              <em className="italic font-light text-gradient-warm">table</em>?
            </h2>
          </div>
          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              onClick={open}
              className="group inline-flex items-center gap-3 pl-7 pr-3 py-3 rounded-full bg-background text-foreground hover:shadow-glow transition-all"
            >
              <span className="font-medium tracking-wide">Book your event</span>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-foreground text-background transition-transform group-hover:rotate-45">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Link grid */}
      <div className="container relative border-t border-background/10 pt-14 pb-12 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="font-display text-3xl">
            Sampaguita <span className="text-primary-glow italic">&amp;</span> Saro
          </div>
          <p className="mt-4 max-w-sm text-background/60 text-sm leading-relaxed">
            Heirloom Filipino catering for kasalan, corporate handaan and intimate boodle dinners across Metro Manila &amp; beyond.
          </p>
          <div className="mt-8 flex items-center gap-3">
            {[Instagram, Facebook, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Social link"
                className="w-10 h-10 rounded-full border border-background/20 flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50 mb-5">
            Explore
          </p>
          <ul className="space-y-3 text-sm">
            {[
              { l: "Menus", h: "#menus" },
              { l: "Process", h: "#process" },
              { l: "Gallery", h: "#gallery" },
              { l: "Stories", h: "#testimonials" },
            ].map((l) => (
              <li key={l.h}>
                <a
                  href={l.h}
                  className="text-background/80 hover:text-primary-glow transition-colors"
                >
                  {l.l}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={open}
                className="text-background/80 hover:text-primary-glow transition-colors"
              >
                Book now
              </button>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-4">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-background/50 mb-5">
            Get in touch
          </p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3 text-background/80">
              <Phone className="w-4 h-4 text-primary-glow" />
              +63 917 555 0142
            </li>
            <li className="flex items-center gap-3 text-background/80">
              <Mail className="w-4 h-4 text-primary-glow" />
              kumain@sampaguitasaro.ph
            </li>
            <li className="text-background/60 text-xs leading-relaxed mt-4">
              Studio · 14 Sampaguita Lane,
              <br />
              Quezon City, Metro Manila
            </li>
          </ul>
        </div>
      </div>

      <div className="container relative border-t border-background/10 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/50 font-mono tracking-wide">
        <span>© {new Date().getFullYear()} Sampaguita &amp; Saro Catering Co.</span>
        <span>Made with kalinga in Manila ✦</span>
      </div>
    </footer>
  );
};

export default Footer;
