import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useReveal } from "@/hooks/use-reveal";

const Inquire = () => {
  const head = useReveal<HTMLDivElement>();
  const [form, setForm] = useState({
    name: "",
    email: "",
    date: "",
    guests: "",
    type: "Wedding",
    notes: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Inquiry received ✓",
      description: "We'll be in touch within one business day to start the conversation.",
    });
    setForm({ name: "", email: "", date: "", guests: "", type: "Wedding", notes: "" });
  };

  const inputCls =
    "w-full bg-transparent border-b border-border focus:border-primary outline-none py-3 text-foreground placeholder:text-muted-foreground transition-colors";

  return (
    <section id="inquire" className="py-28 lg:py-40">
      <div className="container grid lg:grid-cols-12 gap-16">
        <div ref={head.ref} className={`lg:col-span-5 ${head.visible ? "reveal" : "opacity-0"}`}>
          <p className="text-sm tracking-[0.25em] uppercase text-primary mb-5">Begin</p>
          <h2 className="font-display text-5xl lg:text-6xl text-foreground text-balance">
            Let's set the <em className="italic text-primary">table</em>.
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
            Share a few details and we'll respond within one business day with availability and a tailored proposal.
          </p>

          <div className="mt-12 space-y-4 text-sm">
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Email</div>
              <a href="mailto:hello@saffronsage.co" className="text-foreground hover:text-primary transition-colors">
                hello@saffronsage.co
              </a>
            </div>
            <div>
              <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Studio</div>
              <div className="text-foreground">218 Linden Ave · Brooklyn, NY</div>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="lg:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-2">
          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Name</span>
            <input required value={form.name} onChange={set("name")} className={inputCls} placeholder="Your name" />
          </label>
          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Email</span>
            <input required type="email" value={form.email} onChange={set("email")} className={inputCls} placeholder="you@email.com" />
          </label>
          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Event date</span>
            <input type="date" value={form.date} onChange={set("date")} className={inputCls} />
          </label>
          <label className="block">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Guests</span>
            <input type="number" min={1} value={form.guests} onChange={set("guests")} className={inputCls} placeholder="e.g. 80" />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Event type</span>
            <select value={form.type} onChange={set("type")} className={inputCls}>
              <option>Wedding</option>
              <option>Corporate</option>
              <option>Private dinner</option>
              <option>Cocktail / launch</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block sm:col-span-2 mt-2">
            <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Tell us about the event</span>
            <textarea rows={4} value={form.notes} onChange={set("notes")} className={`${inputCls} resize-none`} placeholder="Venue, vibe, dietary notes…" />
          </label>
          <div className="sm:col-span-2 mt-8">
            <button
              type="submit"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all"
            >
              Send inquiry
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Inquire;
