import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { menuService, bookingService, packageService, type Menu, type Package } from "@/lib/api";
import { Eye } from "lucide-react";
import menuCorporate from "@/assets/menu-corporate.jpg";
import menuWeddings from "@/assets/menu-weddings.jpg";
import menuPrivate from "@/assets/menu-private.jpg";
import heroSpread from "@/assets/hero-spread.jpg";

type Pkg = { 
  id: string; 
  title: string; 
  tagline: string; 
  img: string;
  price?: string;
  minGuests?: number;
  maxGuests?: number;
  dishCount?: number;
  menuType?: string;
};

type Tier = { 
  id: string; 
  name: string; 
  price: string; 
  includes: string[]; 
  featured?: boolean;
  dishes?: any[];
  dishSelectionCount?: number;
  minPrice?: number;
  maxPrice?: number;
};

const fallbackPackages: Pkg[] = [
  { id: "kasalan", title: "Kasalan", tagline: "Weddings, kasal at handaan", img: menuWeddings },
  { id: "corporate", title: "Corporate", tagline: "Office lunches, launches, off-sites", img: menuCorporate },
  { id: "boodle", title: "Boodle / Private", tagline: "Kamayan dinners at home", img: menuPrivate },
  { id: "fiesta", title: "Fiesta / Social", tagline: "Birthdays, debut, salu-salo", img: heroSpread },
];

const tiers: Tier[] = [
  {
    id: "essential",
    name: "Bahay Kubo",
    price: "₱850 – ₱1,500 / guest",
    includes: ["3-course Filipino menu", "Buffet or family-style", "Standard tableware", "Service team for 4 hrs"],
  },
  {
    id: "signature",
    name: "Salu-Salo",
    price: "₱1,800 – ₱2,800 / guest",
    includes: ["5-course tasting menu", "Lechon centerpiece", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
    featured: true,
  },
  {
    id: "bespoke",
    name: "Handaan ng Hari",
    price: "From ₱4,200 / guest",
    includes: ["Custom heirloom menu", "Sommelier & barista service", "Styling & florals coordination", "Chef's table experience", "Unlimited service hours"],
  },
];

const getMenuImage = (type: string) => {
  const images: Record<string, string> = {
    wedding: menuWeddings,
    corporate: menuCorporate,
    private: menuPrivate,
    birthday: heroSpread,
    custom: heroSpread,
  };
  return images[type] || menuPrivate;
};

const getMenuTagline = (type: string, description?: string) => {
  if (description) return description;
  
  const taglines: Record<string, string> = {
    wedding: "Weddings, kasal at handaan",
    corporate: "Office lunches, launches, off-sites",
    private: "Kamayan dinners at home",
    birthday: "Birthdays, debut, salu-salo",
    custom: "Custom events and celebrations",
  };
  return taglines[type] || "Filipino catering experience";
};

const getMenuTypeFromPackage = (pkg: Pkg): string => {
  // Try to infer menu type from package title
  const title = pkg.title.toLowerCase();
  if (title.includes('kasalan') || title.includes('wedding')) return 'wedding';
  if (title.includes('corporate')) return 'corporate';
  if (title.includes('boodle') || title.includes('private')) return 'private';
  if (title.includes('fiesta') || title.includes('birthday')) return 'birthday';
  return 'custom';
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const BookingDialog = ({ open, onOpenChange }: Props) => {
  const [step, setStep] = useState(1);
  const [pkg, setPkg] = useState<string>("");
  const [tier, setTier] = useState<string>("");
  const [selectedDishes, setSelectedDishes] = useState<number[]>([]);
  const [details, setDetails] = useState({ date: "", guests: "", venue: "" });
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });
  const [packages, setPackages] = useState<Pkg[]>(fallbackPackages);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState<string>("");
  const [availableDishes, setAvailableDishes] = useState<any[]>([]);
  const [dishSelectionCount, setDishSelectionCount] = useState<number>(0);
  const [viewingDish, setViewingDish] = useState<any | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchMenus();
    }
  }, [open]);

  useEffect(() => {
    if (pkg && step === 2) {
      const selectedPkg = packages.find(p => p.id === pkg);
      if (selectedPkg) {
        const menuType = selectedPkg.menuType || getMenuTypeFromPackage(selectedPkg);
        setSelectedMenuType(menuType);
        fetchTiers(menuType);
        // Clear tier and dishes when package changes
        setTier("");
        setSelectedDishes([]);
      }
    }
  }, [pkg, step, packages]);

  useEffect(() => {
    if (tier && step === 3) {
      const selectedTier = tiers.find(t => t.id === tier);
      if (selectedTier && selectedTier.dishes && selectedTier.dishes.length > 0) {
        setAvailableDishes(selectedTier.dishes);
        setDishSelectionCount(selectedTier.dishSelectionCount || 0);
        // Clear previously selected dishes when changing to a new package
        setSelectedDishes([]);
      } else {
        setAvailableDishes([]);
        setDishSelectionCount(0);
        setSelectedDishes([]);
      }
    }
  }, [tier, step, tiers]);

  const fetchMenus = async () => {
    try {
      setIsLoadingPackages(true);
      const response = await menuService.getAll();
      const dbMenus = response.data || [];
      const activeMenus = dbMenus.filter((menu: Menu) => menu.isActive);

      if (activeMenus.length > 0) {
        const dbPackages: Pkg[] = activeMenus.map((menu: Menu) => ({
          id: menu.id.toString(),
          title: menu.name,
          tagline: getMenuTagline(menu.type, menu.description),
          img: menu.image ? (menu.image.startsWith('http') ? menu.image : `${import.meta.env.VITE_API_URL}${menu.image}`) : getMenuImage(menu.type),
          menuType: menu.type,
        }));
        setPackages(dbPackages);
      } else {
        setPackages(fallbackPackages);
      }
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      setPackages(fallbackPackages);
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchTiers = async (menuType: string) => {
    try {
      setIsLoadingTiers(true);
      const response = await packageService.getByMenuType(menuType);
      const dbTiers = response.data || [];

      if (dbTiers.length > 0) {
        const formattedTiers: Tier[] = dbTiers.map((pkg: Package) => ({
          id: pkg.id.toString(),
          name: pkg.name,
          price: pkg.priceRange,
          includes: pkg.includes,
          featured: pkg.isFeatured,
          dishes: pkg.dishes || [],
          dishSelectionCount: pkg.dishSelectionCount,
          minPrice: pkg.minPrice,
          maxPrice: pkg.maxPrice,
        }));
        setTiers(formattedTiers);
      } else {
        // Use default tiers if no packages found
        setTiers([
          {
            id: "essential",
            name: "Bahay Kubo",
            price: "₱850 – ₱1,500 / guest",
            includes: ["3-course Filipino menu", "Buffet or family-style", "Standard tableware", "Service team for 4 hrs"],
          },
          {
            id: "signature",
            name: "Salu-Salo",
            price: "₱1,800 – ₱2,800 / guest",
            includes: ["5-course tasting menu", "Lechon centerpiece", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
            featured: true,
          },
          {
            id: "bespoke",
            name: "Handaan ng Hari",
            price: "From ₱4,200 / guest",
            includes: ["Custom heirloom menu", "Sommelier & barista service", "Styling & florals coordination", "Chef's table experience", "Unlimited service hours"],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to fetch tiers:", error);
      // Use default tiers on error
      setTiers([
        {
          id: "essential",
          name: "Bahay Kubo",
          price: "₱850 – ₱1,500 / guest",
          includes: ["3-course Filipino menu", "Buffet or family-style", "Standard tableware", "Service team for 4 hrs"],
        },
        {
          id: "signature",
          name: "Salu-Salo",
          price: "₱1,800 – ₱2,800 / guest",
          includes: ["5-course tasting menu", "Lechon centerpiece", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
          featured: true,
        },
        {
          id: "bespoke",
          name: "Handaan ng Hari",
          price: "From ₱4,200 / guest",
          includes: ["Custom heirloom menu", "Sommelier & barista service", "Styling & florals coordination", "Chef's table experience", "Unlimited service hours"],
        },
      ]);
    } finally {
      setIsLoadingTiers(false);
    }
  };

  const reset = () => {
    setStep(1); setPkg(""); setTier(""); setSelectedDishes([]); setDetails({ date: "", guests: "", venue: "" });
    setInfo({ name: "", email: "", phone: "", notes: "" });
    setAvailableDishes([]);
    setDishSelectionCount(0);
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 300);
  };

  const submit = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    
    const selectedPackage = packages.find(p => p.id === pkg);
    const selectedTier = tiers.find(t => t.id === tier);
    
    if (!selectedPackage || !selectedTier) {
      toast({
        title: "Error",
        description: "Please select a package and tier",
        variant: "destructive",
      });
      return;
    }

    // Validate dish selection if required
    if (dishSelectionCount > 0 && selectedDishes.length !== dishSelectionCount) {
      toast({
        title: "Error",
        description: `Please select exactly ${dishSelectionCount} dishes`,
        variant: "destructive",
      });
      return;
    }

    // Map tier to valid enum value based on price or default to 'signature'
    let tierEnum: 'essential' | 'signature' | 'bespoke' = 'signature';
    if (selectedTier.minPrice) {
      if (selectedTier.minPrice < 500) {
        tierEnum = 'essential';
      } else if (selectedTier.minPrice > 1500) {
        tierEnum = 'bespoke';
      }
    }

    setIsSubmitting(true);
    try {
      // Calculate estimated price
      const guestCount = parseInt(details.guests);
      const pricePerGuest = selectedTier.minPrice || 0;
      const estimatedPrice = guestCount * pricePerGuest;

      // Get dish details for storage
      const dishDetails = selectedDishes.map(dishId => {
        const dish = availableDishes.find(d => d.id === dishId);
        return dish ? { id: dish.id, name: dish.name, category: dish.category } : null;
      }).filter(Boolean);

      await bookingService.create({
        customerName: info.name,
        customerEmail: info.email,
        customerPhone: info.phone,
        eventDate: details.date,
        guestCount: guestCount,
        venue: details.venue || undefined,
        packageId: isNaN(parseInt(tier)) ? undefined : parseInt(tier),
        packageName: selectedPackage.title,
        packagePrice: selectedTier.price, // Store the package price range
        tier: tierEnum,
        tierName: selectedTier.name,
        selectedDishes: dishDetails.length > 0 ? dishDetails : undefined,
        notes: info.notes || undefined,
        estimatedPrice: estimatedPrice > 0 ? estimatedPrice : undefined,
      });

      toast({
        title: "Inquiry received ✓",
        description: `Your ${selectedTier.name} ${selectedPackage.title} request is in. We'll respond within 1 business day.`,
      });
      close(false);
    } catch (error) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full bg-transparent border-b border-border focus:border-primary outline-none py-3 text-foreground placeholder:text-muted-foreground transition-colors";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 bg-background border-border">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-8 py-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs tracking-[0.25em] uppercase text-primary">Plan your event</p>
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Step {step} of {dishSelectionCount > 0 ? 5 : 4}</p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: dishSelectionCount > 0 ? 5 : 4 }).map((_, n) => (
              <div
                key={n}
                className={`h-0.5 flex-1 rounded-full transition-colors ${n < step ? "bg-primary" : "bg-border"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-10">
          {step === 1 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                What kind of event are you <em className="italic text-primary">planning</em>?
              </h2>
              <p className="text-muted-foreground mb-8">Pick the closest match — we'll tailor everything from here.</p>

              {isLoadingPackages ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground/60">Loading packages...</p>
                </div>
              ) : (
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
                        <div className="flex flex-wrap gap-3 mt-3 text-xs text-foreground/60">
                          {p.price && <span>{p.price}</span>}
                          {p.dishCount !== undefined && p.dishCount > 0 && (
                            <span>{p.dishCount} dishes</span>
                          )}
                          {p.minGuests && (
                            <span>{p.minGuests}-{p.maxGuests || "+"} guests</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Choose your <em className="italic text-primary">experience</em>.
              </h2>
              <p className="text-muted-foreground mb-8">All tiers can be customized. Final pricing depends on guest count and menu.</p>

              {isLoadingTiers ? (
                <div className="text-center py-12">
                  <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-foreground/60">Loading packages...</p>
                </div>
              ) : tiers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-foreground/60">No packages available for this event type</p>
                </div>
              ) : (
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
                      
                      {/* Package Name */}
                      <div className="font-display text-2xl text-foreground mb-1">{t.name}</div>
                      
                      {/* Price */}
                      <div className="text-sm text-primary mb-3">{t.price}</div>
                      
                      {/* Dish Selection Count - PROMINENT */}
                      {t.dishSelectionCount && t.dishSelectionCount > 0 && (
                        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">{t.dishSelectionCount}</span>
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-primary uppercase tracking-wider">Dishes to Choose</div>
                              <div className="text-xs text-foreground/60">Select from {t.dishes?.length || 0} available</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Includes List */}
                      <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                        {t.includes.map((i, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary mt-0.5">·</span>
                            <span>{i}</span>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Selected Checkmark */}
                      {tier === t.id && (
                        <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && dishSelectionCount > 0 && availableDishes.length > 0 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Select your <em className="italic text-primary">dishes</em>.
              </h2>
              
              {/* Clear Selection Counter */}
              <div className="mb-6 p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">
                      Choose <span className="text-primary text-2xl font-bold">{dishSelectionCount}</span> dishes from the menu below
                    </p>
                    <p className="text-sm text-foreground/60 mt-1">
                      {availableDishes.length} dishes available to choose from
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {selectedDishes.length}/{dishSelectionCount}
                    </div>
                    <div className="text-xs text-foreground/60 uppercase tracking-wider">Selected</div>
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {availableDishes.map((dish) => (
                  <div
                    key={dish.id}
                    className={`relative text-left p-5 rounded-sm border-2 transition-all ${
                      selectedDishes.includes(dish.id)
                        ? "border-primary bg-card shadow-card"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-display text-lg font-medium text-foreground">
                          {dish.name}
                        </h3>
                        {dish.description && (
                          <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{dish.description}</p>
                        )}
                      </div>
                      {selectedDishes.includes(dish.id) && (
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs ml-2">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="px-2 py-1 rounded bg-accent/10 text-accent text-xs uppercase">
                        {dish.category}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingDish(dish);
                            setIsDishModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (selectedDishes.includes(dish.id)) {
                              setSelectedDishes(selectedDishes.filter(id => id !== dish.id));
                            } else if (selectedDishes.length < dishSelectionCount) {
                              setSelectedDishes([...selectedDishes, dish.id]);
                            } else {
                              toast({
                                title: "Maximum reached",
                                description: `You can only select ${dishSelectionCount} dishes`,
                                variant: "destructive",
                              });
                            }
                          }}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                            selectedDishes.includes(dish.id)
                              ? "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                              : "bg-primary hover:bg-primary/90 text-primary-foreground"
                          }`}
                        >
                          {selectedDishes.includes(dish.id) ? "Remove" : "Select"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (dishSelectionCount === 0 || availableDishes.length === 0) && (
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

          {step === 4 && dishSelectionCount > 0 && (
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

          {((step === 4 && dishSelectionCount === 0) || (step === 5 && dishSelectionCount > 0)) && (
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

              <div className="mt-8 p-5 bg-muted rounded-sm">
                <div className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Your selections</div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-foreground">
                  <span><span className="text-muted-foreground">Event:</span> {packages.find(p => p.id === pkg)?.title}</span>
                  <span><span className="text-muted-foreground">Tier:</span> {tiers.find(t => t.id === tier)?.name}</span>
                  {selectedDishes.length > 0 && (
                    <span><span className="text-muted-foreground">Dishes:</span> {selectedDishes.length} selected</span>
                  )}
                  {details.date && <span><span className="text-muted-foreground">Date:</span> {details.date}</span>}
                  {details.guests && <span><span className="text-muted-foreground">Guests:</span> {details.guests}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 sm:px-10 py-5 flex items-center justify-between">
          <button
            onClick={() => {
              if (step === 1) {
                close(false);
              } else {
                // Clear selected dishes when going back from dish selection step
                if (step === 3 && dishSelectionCount > 0) {
                  setSelectedDishes([]);
                }
                setStep(step - 1);
              }
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {((step < 4 && dishSelectionCount === 0) || (step < 5 && dishSelectionCount > 0)) ? (
            <button
              onClick={() => {
                // Check if we need to show dish selection
                if (step === 2) {
                  const selectedTier = tiers.find(t => t.id === tier);
                  const hasDishes = selectedTier && selectedTier.dishes && selectedTier.dishes.length > 0;
                  const needsDishSelection = selectedTier && selectedTier.dishSelectionCount && selectedTier.dishSelectionCount > 0;
                  
                  // If no dishes available or no selection needed, skip to step 4
                  if (!hasDishes || !needsDishSelection) {
                    setStep(4);
                  } else {
                    setStep(3);
                  }
                } else {
                  setStep(step + 1);
                }
              }}
              disabled={
                (step === 1 && !pkg) || 
                (step === 2 && !tier) ||
                (step === 3 && dishSelectionCount > 0 && selectedDishes.length !== dishSelectionCount)
              }
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!info.name || !info.email || isSubmitting}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit inquiry"}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          )}
        </div>
      </DialogContent>

      {/* Dish Detail Modal */}
      <Dialog open={isDishModalOpen} onOpenChange={setIsDishModalOpen}>
        <DialogContent className="max-w-2xl">
          {viewingDish && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl font-medium text-foreground mb-1">
                    {viewingDish.name}
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs uppercase font-medium">
                    {viewingDish.category}
                  </span>
                </div>
              </div>

              {viewingDish.image && (
                <div className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
                  <img
                    src={viewingDish.image?.startsWith('http') ? viewingDish.image : `${import.meta.env.VITE_API_URL}${viewingDish.image}`}
                    alt={viewingDish.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {viewingDish.description && (
                <div>
                  <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider mb-2">
                    Description
                  </h4>
                  <p className="text-foreground/70 leading-relaxed">
                    {viewingDish.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsDishModalOpen(false);
                    if (selectedDishes.includes(viewingDish.id)) {
                      setSelectedDishes(selectedDishes.filter(id => id !== viewingDish.id));
                    } else if (selectedDishes.length < dishSelectionCount) {
                      setSelectedDishes([...selectedDishes, viewingDish.id]);
                    } else {
                      toast({
                        title: "Maximum reached",
                        description: `You can only select ${dishSelectionCount} dishes`,
                        variant: "destructive",
                      });
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDishes.includes(viewingDish.id)
                      ? "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {selectedDishes.includes(viewingDish.id) ? "Remove from Selection" : "Add to Selection"}
                </button>
                <button
                  onClick={() => setIsDishModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default BookingDialog;
