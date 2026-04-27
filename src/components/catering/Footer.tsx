import { useBooking } from "./BookingProvider";

const Footer = () => {
  const { open } = useBooking();
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container flex flex-col md:flex-row gap-6 md:items-center justify-between text-sm text-muted-foreground">
        <div className="font-display text-xl text-foreground">
          Saffron <span className="text-primary">&amp;</span> Sage
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="#menus" className="hover:text-primary transition-colors">Menus</a>
          <a href="#process" className="hover:text-primary transition-colors">Process</a>
          <a href="#gallery" className="hover:text-primary transition-colors">Gallery</a>
          <button onClick={open} className="hover:text-primary transition-colors">Book now</button>
        </div>
        <div>© {new Date().getFullYear()} Saffron &amp; Sage Catering Co.</div>
      </div>
    </footer>
  );
};

export default Footer;
