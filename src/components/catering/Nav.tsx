import { useEffect, useState } from "react";
import { useBooking } from "./BookingProvider";

const Nav = () => {
  const { open } = useBooking();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 py-3"
          : "bg-transparent py-6"
      }`}
    >
      <div className="container flex items-center justify-between">
        <a href="#top" className="font-display text-2xl tracking-tight text-foreground">
          Sampaguita <span className="text-primary">&amp;</span> Saro
        </a>
        <nav className="hidden md:flex items-center gap-10 text-sm tracking-wide">
          <a href="#menus" className="text-foreground/70 hover:text-primary transition-colors">Menus</a>
          <a href="#process" className="text-foreground/70 hover:text-primary transition-colors">Process</a>
          <a href="#gallery" className="text-foreground/70 hover:text-primary transition-colors">Gallery</a>
          <a href="#testimonials" className="text-foreground/70 hover:text-primary transition-colors">Stories</a>
        </nav>
        <button
          onClick={open}
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm hover:bg-primary transition-colors"
        >
          Book now
        </button>
      </div>
    </header>
  );
};

export default Nav;
