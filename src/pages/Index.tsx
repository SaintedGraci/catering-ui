import Nav from "@/components/catering/Nav";
import Hero from "@/components/catering/Hero";
import Menus from "@/components/catering/Menus";
import Process from "@/components/catering/Process";
import Gallery from "@/components/catering/Gallery";
import Testimonials from "@/components/catering/Testimonials";
import Footer from "@/components/catering/Footer";
import { BookingProvider } from "@/components/catering/BookingProvider";
import { useEffect, useState } from "react";
import { settingsService, type Settings } from "@/lib/api";

const Index = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    settingsService.get().then(res => {
      if (res.data) setSettings(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const businessName = settings?.websiteName || settings?.businessName || "Sampaguita & Saro";
    const metaTitle = settings?.metaTitle || `${businessName} — Filipino Catering for Unforgettable Handaan`;
    const metaDescription = settings?.metaDescription || `Heirloom Filipino catering for kasalan, corporate handaan and intimate boodle dinners. Lechon, kare-kare, kakanin and more. Book ${businessName}.`;

    document.title = metaTitle;
    const meta =
      document.querySelector('meta[name="description"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("name", "description");
        document.head.appendChild(m);
        return m;
      })();
    meta.setAttribute("content", metaDescription);
  }, [settings]);

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
