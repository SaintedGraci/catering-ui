import Nav from "@/components/catering/Nav";
import Hero from "@/components/catering/Hero";
import Menus from "@/components/catering/Menus";
import Process from "@/components/catering/Process";
import Gallery from "@/components/catering/Gallery";
import Testimonials from "@/components/catering/Testimonials";
import Footer from "@/components/catering/Footer";
import { BookingProvider } from "@/components/catering/BookingProvider";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "Sampaguita & Saro — Filipino Catering for Unforgettable Handaan";
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute(
      "content",
      "Heirloom Filipino catering for kasalan, corporate handaan and intimate boodle dinners. Lechon, kare-kare, kakanin and more. Book Sampaguita & Saro."
    );
  }, []);

  return (
    <BookingProvider>
      <main className="bg-background">
        <Nav />
        <Hero />
        <Menus />
        <Process />
        <Gallery />
        <Testimonials />
        <Footer />
      </main>
    </BookingProvider>
  );
};

export default Index;
