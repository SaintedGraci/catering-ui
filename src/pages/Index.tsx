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
    document.title = "Saffron & Sage — Editorial Catering for Unforgettable Events";
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
      "Seasonal, hand-plated catering for weddings, corporate events and private dinners. Book a tasting with Saffron & Sage."
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
