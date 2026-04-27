import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import menuCorporate from "@/assets/menu-corporate.jpg";
import menuWeddings from "@/assets/menu-weddings.jpg";
import menuPrivate from "@/assets/menu-private.jpg";
import heroSpread from "@/assets/hero-spread.jpg";

type Pkg = { id: string; title: string; tagline: string; img: string };
type Tier = { id: string; name: string; price: string; includes: string[]; featured?: boolean };

const packages: Pkg[] = [
  { id: "wedding", title: "Wedding", tagline: "Ceremonies & receptions", img: menuWeddings },
  { id: "corporate", title: "Corporate", tagline: "Lunches, launches, off-sites", img: menuCorporate },
  { id: "private", title: "Private Dinner", tagline: "Intimate gatherings at home", img: menuPrivate },
  { id: "cocktail", title: "Cocktail / Social", tagline: "Canapés & grazing", img: heroSpread },
];

const tiers: Tier[] = [
  {
    id: "essential",
    name: "Essential",
    price: "$45 – $75 / guest",
    includes: ["3-course seasonal menu", "Plated or buffet service", "Standard tableware", "Service team for 4 hrs"],
  },
  {
    id: "signature",
    name: "Signature",
    price: "$95 – $145 / guest",
    includes: ["5-course tasting menu", "Wine pairing options", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
    featured: true,
  },
  {
    id: "bespoke",
    name: "Bespoke",
    price: "From $200 / guest",
    includes: ["Custom-designed menu", "Sommelier service", "Full styling & florals coordination", "Chef's table experience", "Unlimited service hours"],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const BookingDialog = ({ open, onOpenChange }: Props) => {
  const [step, setStep] = useState(1);
  const [pkg, setPkg] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const [details, setDetails] = useState({ date: "", guests: "", venue: "" });
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });

  const reset = () => {
    setStep(1); setPkg(""); setTier(""); setDetails({ date: "", guests: "", venue: "" });
    setInfo({ name: "", email: "", phone: "", notes: "" });
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 300);
  };

  const submit = () => {
    toast({
      title: "Inquiry received ✓",
      description: `Your ${tiers.find(t => t.id === tier)?.name} ${packages.find(p => p.id === pkg)?.title} request is in. We'll respond within 1 business day.`,
    });
    close(false);
  };

  const inputCls = "w-full bg-transparent border-b border-border focus:border-primary outline-none py-3 text-foreground placeholder:text-muted-foreground transition-colors";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 bg-background border-border">
        {/* Progress header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs tracking-[0.25em] uppercase text-primary">Plan your event</p>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Step {step} of 4</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`h-0.5 flex-1 rounded-full transition-colors ${n <= step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-10">
          {/* STEP 1 — Package */}
          {step === 1 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                What kind of event are you <em className="italic text-primary">planning</em>?
              </h2>
              <p className="text-muted-foreground mb-8">Pick the closest match — we'll tailor everything from here.</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {packages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPkg(p.id)}
                    className={`group text-left rounded-sm overflow-hidden border-2 transition-all ${
                      pkg === p.id ? "border-primary shadow-card" : "border-transparent hover:border-border"
                    }`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {pkg === p.id && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">✓</div>
                      )}
                    </div>
                    <div className="p-5 bg-card">
                      <div className="font-display text-xl text-foreground">{p.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">{p.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 — Tier */}
          {step === 2 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Choose your <em className="italic text-primary">experience</em>.
              </h2>
              <p className="text-muted-foreground mb-8">All tiers can be customized. Final pricing depends on guest count and menu.</p>

              <div className="grid md:grid-cols-3 gap-4">
                {tiers.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTier(t.id)}
                    className={`relative text-left p-6 rounded-sm border-2 transition-all flex flex-col ${
                      tier === t.id
                        ? "border-primary bg-card shadow-card"
                        : "border-border bg-card hover:border-foreground/30"
                    }`}
                  >
                    {t.featured && (
                      <span className="absolute -top-2.5 left-6 px-2.5 py-0.5 text-[10px] tracking-[0.2em] uppercase bg-foreground text-background rounded-full">
                        Most chosen
                      </span>
                    )}
                    <div className="font-display text-2xl text-foreground">{t.name}</div>
                    <div className="text-sm text-primary mt-1 mb-5">{t.price}</div>
                    <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                      {t.includes.map((i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-primary mt-0.5">·</span>
                          <span>{i}</span>
                        </li>
                      ))}
                    </ul>
                    {tier === t.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Details */}
          {step === 3 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Tell us about the <em className="italic text-primary">day</em>.
              </h2>
              <p className="text-muted-foreground mb-8">A few quick details so we can check availability.</p>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Event date</span>
                  <input type="date" value={details.date} onChange={(e) => setDetails({ ...details, date: e.target.value })} className={inputCls} />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Guest count</span>
                  <input type="number" min={1} value={details.guests} onChange={(e) => setDetails({ ...details, guests: e.target.value })} className={inputCls} placeholder="e.g. 80" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Venue or location</span>
                  <input value={details.venue} onChange={(e) => setDetails({ ...details, venue: e.target.value })} className={inputCls} placeholder="Venue name, address, or 'TBD'" />
                </label>
              </div>
            </div>
          )}

          {/* STEP 4 — Info */}
          {step === 4 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Last step — how can we <em className="italic text-primary">reach you</em>?
              </h2>
              <p className="text-muted-foreground mb-8">We'll be in touch within one business day.</p>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Full name</span>
                  <input value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} className={inputCls} placeholder="Your name" />
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Email</span>
                  <input type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} className={inputCls} placeholder="you@email.com" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Phone</span>
                  <input type="tel" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} className={inputCls} placeholder="+1 (555) 000-0000" />
                </label>
                <label className="block sm:col-span-2 mt-2">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Anything we should know?</span>
                  <textarea rows={3} value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} className={`${inputCls} resize-none`} placeholder="Dietary needs, theme, special requests…" />
                </label>
              </div>

              {/* Summary */}
              <div className="mt-8 p-5 bg-muted rounded-sm">
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Your selections</div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
                  <span><span className="text-muted-foreground">Event:</span> {packages.find(p => p.id === pkg)?.title}</span>
                  <span><span className="text-muted-foreground">Tier:</span> {tiers.find(t => t.id === tier)?.name}</span>
                  {details.date && <span><span className="text-muted-foreground">Date:</span> {details.date}</span>}
                  {details.guests && <span><span className="text-muted-foreground">Guests:</span> {details.guests}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer nav */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 sm:px-10 py-5 flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? close(false) : setStep(step - 1))}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !pkg) || (step === 2 && !tier)}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!info.name || !info.email}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit inquiry
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
