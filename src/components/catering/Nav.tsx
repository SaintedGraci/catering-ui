import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useBooking } from "./BookingProvider";
import { settingsService, type Settings } from "@/lib/api";

const links = [
  { href: "#menus", label: "Menus" },
  { href: "#process", label: "Process" },
  { href: "#gallery", label: "Gallery" },
  { href: "#testimonials", label: "Stories" },
];

const Nav = () => {
  const { open } = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    settingsService.get().then(res => {
      if (res.data) setSettings(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled || mobileOpen
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container flex items-center justify-between">
        <a
          href="#top"
          onClick={() => setMobileOpen(false)}
          className="font-display text-2xl tracking-tight text-foreground"
        >
          {settings?.websiteName || settings?.businessName || "Sampaguita & Saro"}
        </a>

        <nav className="hidden md:flex items-center gap-10 text-sm tracking-wide">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-foreground/70 hover:text-primary transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm hover:bg-primary transition-colors"
          >
            Book now
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-foreground hover:text-primary transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="container flex flex-col py-6 gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="py-3 text-lg font-display text-foreground/80 hover:text-primary transition-colors border-b border-border/40"
            >
              {l.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              open();
            }}
            className="mt-5 inline-flex items-center justify-center px-5 py-3 rounded-full bg-foreground text-background text-sm hover:bg-primary transition-colors"
          >
            Book now
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
