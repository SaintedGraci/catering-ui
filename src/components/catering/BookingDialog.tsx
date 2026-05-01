import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { menuService, bookingService, packageService, type Menu, type Package } from "@/lib/api";
import { Eye, UtensilsCrossed } from "lucide-react";
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
  estimatedPrice?: string;
  goodForPax?: number;
  includes: string[]; 
  featured?: boolean;
  dishes?: any[];
  dishSelectionRules?: Record<string, number>;
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
    estimatedPrice: "850-1500",
    goodForPax: 50,
    includes: ["3-course Filipino menu", "Buffet or family-style", "Standard tableware", "Service team for 4 hrs"],
  },
  {
    id: "signature",
    name: "Salu-Salo",
    estimatedPrice: "1800-2800",
    goodForPax: 75,
    includes: ["5-course tasting menu", "Lechon centerpiece", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
    featured: true,
  },
  {
    id: "bespoke",
    name: "Handaan ng Hari",
    estimatedPrice: "4200+",
    goodForPax: 100,
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
  const [selectedDishesByCategory, setSelectedDishesByCategory] = useState<Record<string, number[]>>({
    appetizer: [],
    main_course: [],
    side_dish: [],
    dessert: [],
    beverage: []
  });
  const [details, setDetails] = useState({ date: "", guests: "", venue: "" });
  const [info, setInfo] = useState({ name: "", email: "", phone: "", notes: "" });
  const [packages, setPackages] = useState<Pkg[]>(fallbackPackages);
  const [isLoadingPackages, setIsLoadingPackages] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [isLoadingTiers, setIsLoadingTiers] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState<string>("");
  const [availableDishes, setAvailableDishes] = useState<any[]>([]);
  const [dishSelectionRules, setDishSelectionRules] = useState<Record<string, number> | null>(null);
  const [viewingDish, setViewingDish] = useState<any | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDishConfirmModalOpen, setIsDishConfirmModalOpen] = useState(false);
  const [isFinalConfirmModalOpen, setIsFinalConfirmModalOpen] = useState(false);

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
        setSelectedDishesByCategory({
          appetizer: [],
          main_course: [],
          side_dish: [],
          dessert: [],
          beverage: []
        });
      }
    }
  }, [pkg, step, packages]);

  useEffect(() => {
    if (tier && step === 3) {
      const selectedTier = tiers.find(t => t.id === tier);
      if (selectedTier && selectedTier.dishes && selectedTier.dishes.length > 0) {
        setAvailableDishes(selectedTier.dishes);
        
        // Set category-specific rules
        if (selectedTier.dishSelectionRules && Object.keys(selectedTier.dishSelectionRules).length > 0) {
          setDishSelectionRules(selectedTier.dishSelectionRules);
        } else {
          setDishSelectionRules(null);
        }
        
        // Clear previously selected dishes when changing to a new package
        setSelectedDishesByCategory({
          appetizer: [],
          main_course: [],
          side_dish: [],
          dessert: [],
          beverage: []
        });
      } else {
        setAvailableDishes([]);
        setDishSelectionRules(null);
        setSelectedDishesByCategory({
          appetizer: [],
          main_course: [],
          side_dish: [],
          dessert: [],
          beverage: []
        });
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
          estimatedPrice: pkg.estimatedPrice,
          goodForPax: pkg.goodForPax,
          includes: pkg.includes,
          featured: pkg.isFeatured,
          dishes: pkg.dishes || [],
          dishSelectionRules: pkg.dishSelectionRules,
        }));
        setTiers(formattedTiers);
      } else {
        // Use default tiers if no packages found
        setTiers([
          {
            id: "essential",
            name: "Bahay Kubo",
            estimatedPrice: "850-1500",
            goodForPax: 50,
            includes: ["3-course Filipino menu", "Buffet or family-style", "Standard tableware", "Service team for 4 hrs"],
          },
          {
            id: "signature",
            name: "Salu-Salo",
            estimatedPrice: "1800-2800",
            goodForPax: 75,
            includes: ["5-course tasting menu", "Lechon centerpiece", "Premium tableware & linens", "Dedicated event lead", "Service team for 6 hrs"],
            featured: true,
          },
          {
            id: "bespoke",
            name: "Handaan ng Hari",
            estimatedPrice: "4200+",
            goodForPax: 100,
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
    setStep(1); setPkg(""); setTier("");
    setSelectedDishesByCategory({
      appetizer: [],
      main_course: [],
      side_dish: [],
      dessert: [],
      beverage: []
    });
    setDetails({ date: "", guests: "", venue: "" });
    setInfo({ name: "", email: "", phone: "", notes: "" });
    setAvailableDishes([]);
    setDishSelectionRules(null);
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
    if (dishSelectionRules && Object.keys(dishSelectionRules).length > 0) {
      // Validate category-specific rules
      const totalSelected = Object.values(selectedDishesByCategory).flat().length;
      const totalRequired = Object.values(dishSelectionRules).reduce((sum, count) => sum + count, 0);
      
      if (totalSelected !== totalRequired) {
        const missingCategories = Object.entries(dishSelectionRules)
          .filter(([category, required]) => {
            const selected = selectedDishesByCategory[category]?.length || 0;
            return selected !== required;
          })
          .map(([category, required]) => {
            const selected = selectedDishesByCategory[category]?.length || 0;
            return `${category.replace('_', ' ')}: ${selected}/${required}`;
          });
        
        toast({
          title: "Incomplete Selection",
          description: `Please complete your dish selection: ${missingCategories.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
    }

    // Map tier to valid enum value - default to 'signature'
    const tierEnum: 'essential' | 'signature' | 'bespoke' = 'signature';

    setIsSubmitting(true);
    try {
      // Get dish IDs for storage
      const allSelectedDishIds = Object.values(selectedDishesByCategory).flat();

      await bookingService.create({
        customerName: info.name,
        customerEmail: info.email,
        customerPhone: info.phone,
        eventDate: details.date,
        guestCount: parseInt(details.guests),
        venue: details.venue || undefined,
        packageId: isNaN(parseInt(tier)) ? undefined : parseInt(tier),
        packageName: selectedPackage.title,
        tier: tierEnum,
        tierName: selectedTier.name,
        selectedDishes: allSelectedDishIds.length > 0 ? allSelectedDishIds : undefined,
        notes: info.notes || undefined,
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
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Step {step} of {dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) ? 5 : 4}</p>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) ? 5 : 4 }).map((_, n) => (
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
                      <div className="text-sm text-primary mb-3">
                        {t.estimatedPrice ? `₱${t.estimatedPrice}` : 'Contact for pricing'}
                        {t.goodForPax && <span className="text-foreground/60 ml-2">• Good for {t.goodForPax} pax</span>}
                      </div>
                      
                      {/* Dish Selection Count/Rules - PROMINENT */}
                      {t.dishSelectionRules && Object.values(t.dishSelectionRules).some((count: number) => count > 0) ? (
                        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Dishes to Choose</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(t.dishSelectionRules).map(([category, count]: [string, any]) => 
                              count > 0 && (
                                <div key={category} className="flex items-center gap-1 text-xs">
                                  <span className="font-bold text-primary">{count}</span>
                                  <span className="text-foreground/70">{category.replace('_', ' ')}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="text-xs text-muted-foreground">
                            No dish selection configured for this package
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

          {step === 3 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) && availableDishes.length > 0 && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Select your <em className="italic text-primary">dishes</em>.
              </h2>
              <p className="text-muted-foreground mb-6">Tap categories below to jump to each section</p>
              
              {/* Sticky Category Navigation - Mobile Optimized */}
              <div className="sticky top-0 z-20 -mx-6 sm:-mx-10 px-6 sm:px-10 py-4 bg-background/95 backdrop-blur-sm border-y border-border mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Object.entries(dishSelectionRules).map(([category, required]: [string, any]) => {
                    if (required === 0) return null;
                    const selected = selectedDishesByCategory[category]?.length || 0;
                    const isComplete = selected === required;
                    return (
                      <button
                        key={category}
                        onClick={() => {
                          const element = document.getElementById(`category-${category}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className={`flex-shrink-0 px-4 py-2.5 rounded-full border-2 transition-all ${
                          isComplete 
                            ? 'bg-primary border-primary text-primary-foreground shadow-lg' 
                            : 'bg-background border-border text-foreground hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {category.replace('_', ' ')}
                          </span>
                          <span className={`text-sm font-bold ${isComplete ? 'text-primary-foreground' : 'text-primary'}`}>
                            {selected}/{required}
                          </span>
                          {isComplete && <span className="text-lg">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dishes grouped by category */}
              <div className="space-y-12">
                {Object.entries(dishSelectionRules).map(([category, required]: [string, any]) => {
                  if (required === 0) return null;
                  const categoryDishes = availableDishes.filter(d => d.category === category);
                  const selectedInCategory = selectedDishesByCategory[category] || [];
                  
                  if (categoryDishes.length === 0) return null;
                  
                  return (
                    <div key={category} id={`category-${category}`} className="scroll-mt-32">
                      <div className="flex items-center justify-between mb-4 sticky top-24 z-10 bg-background/95 backdrop-blur-sm py-3 -mx-2 px-2 rounded-lg">
                        <h3 className="font-display text-2xl text-foreground capitalize flex items-center gap-3">
                          {category.replace('_', ' ')}
                          <span className={`text-sm px-3 py-1 rounded-full ${
                            selectedInCategory.length === required
                              ? 'bg-primary/20 text-primary border-2 border-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {selectedInCategory.length}/{required}
                          </span>
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {categoryDishes.map((dish) => {
                          const isSelected = selectedInCategory.includes(dish.id);
                          const canSelect = selectedInCategory.length < required;
                          
                          return (
                            <div
                              key={dish.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedDishesByCategory({
                                    ...selectedDishesByCategory,
                                    [category]: selectedInCategory.filter(id => id !== dish.id)
                                  });
                                } else if (canSelect) {
                                  setSelectedDishesByCategory({
                                    ...selectedDishesByCategory,
                                    [category]: [...selectedInCategory, dish.id]
                                  });
                                } else {
                                  toast({
                                    title: "Maximum reached",
                                    description: `You can only select ${required} ${category.replace('_', ' ')} ${required === 1 ? 'dish' : 'dishes'}`,
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? "ring-2 ring-primary shadow-lg shadow-primary/30"
                                  : "hover:shadow-lg"
                              }`}
                            >
                              {/* Dish Image - Compact for Mobile */}
                              <div className="relative aspect-square overflow-hidden bg-muted">
                                {dish.image ? (
                                  <img
                                    src={dish.image.startsWith('http') ? dish.image : `${import.meta.env.VITE_API_URL || ''}${dish.image}`}
                                    alt={dish.name}
                                    className={`w-full h-full object-cover transition-transform duration-500 ${
                                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                                    }`}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                                    <UtensilsCrossed className="w-8 h-8 text-muted-foreground/30" />
                                  </div>
                                )}
                                
                                {/* Gradient Overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                                  isSelected 
                                    ? 'from-primary/95 via-primary/60 to-transparent' 
                                    : 'from-black/85 via-black/40 to-transparent group-hover:from-black/90'
                                }`} />
                                
                                {/* Selected Badge */}
                                {isSelected && (
                                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-lg flex items-center justify-center animate-in zoom-in duration-300">
                                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                                      ✓
                                    </div>
                                  </div>
                                )}
                                
                                {/* View Details Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewingDish(dish);
                                    setIsDishModalOpen(true);
                                  }}
                                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border border-white/20 transition-all opacity-0 group-hover:opacity-100"
                                  title="View details"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                
                                {/* Content Overlay - Compact for Mobile */}
                                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                                  <div className="space-y-1">
                                    {/* Dish Name */}
                                    <h4 className="font-display text-sm font-bold text-white drop-shadow-lg leading-tight line-clamp-2">
                                      {dish.name}
                                    </h4>
                                    
                                    {/* Description - Hidden on mobile, shown on larger screens */}
                                    {dish.description && (
                                      <p className="hidden sm:block text-xs text-white/90 line-clamp-1 drop-shadow-md">
                                        {dish.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Action Button - Compact */}
                              <div className={`p-2 transition-colors ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-card border-t border-border group-hover:bg-muted'
                              }`}>
                                <div className="text-center">
                                  <span className="text-xs font-semibold">
                                    {isSelected ? '✓ Selected' : 'Tap to select'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Floating Continue Button - Shows when all selections complete */}
              {(() => {
                const allComplete = Object.entries(dishSelectionRules).every(([category, required]: [string, any]) => {
                  if (required === 0) return true;
                  const selected = selectedDishesByCategory[category]?.length || 0;
                  return selected === required;
                });
                
                if (!allComplete) return null;
                
                return (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-500">
                    <button
                      onClick={() => setIsDishConfirmModalOpen(true)}
                      className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-105 transition-all font-semibold text-lg"
                    >
                      <span>Review your selections</span>
                      <span className="text-2xl">→</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {step === 3 && (!dishSelectionRules || !Object.values(dishSelectionRules).some(count => count > 0) || availableDishes.length === 0) && (
            <div className="reveal">
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-2">
                Tell us about the <em className="italic text-primary">day</em>.
              </h2>
              <p className="text-muted-foreground mb-8">A few quick details so we can check availability.</p>

              {/* Show info message if package has no dish selection */}
              {(!dishSelectionRules || !Object.values(dishSelectionRules).some(count => count > 0)) && (
                <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> This package doesn't have dish selection configured yet. Our team will work with you to customize your menu.
                  </p>
                </div>
              )}

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

          {step === 4 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) && (
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

          {((step === 4 && (!dishSelectionRules || !Object.values(dishSelectionRules).some(count => count > 0))) || (step === 5 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0))) && (
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
                  {(() => {
                    const totalSelected = Object.values(selectedDishesByCategory).flat().length;
                    return totalSelected > 0 && (
                      <span><span className="text-muted-foreground">Dishes:</span> {totalSelected} selected</span>
                    );
                  })()}
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
                if (step === 3 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0)) {
                  setSelectedDishesByCategory({
                    appetizer: [],
                    main_course: [],
                    side_dish: [],
                    dessert: [],
                    beverage: []
                  });
                }
                setStep(step - 1);
              }
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {((step < 4 && (!dishSelectionRules || !Object.values(dishSelectionRules).some(count => count > 0))) || (step < 5 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0))) ? (
            <button
              onClick={() => {
                // Check if we need to show dish selection
                if (step === 2) {
                  const selectedTier = tiers.find(t => t.id === tier);
                  const hasDishes = selectedTier && selectedTier.dishes && selectedTier.dishes.length > 0;
                  const hasDishRules = selectedTier && selectedTier.dishSelectionRules && Object.values(selectedTier.dishSelectionRules).some(count => count > 0);
                  
                  // If no dishes available or no selection rules, skip to step 4
                  if (!hasDishes || !hasDishRules) {
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
                (step === 3 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) && (() => {
                  // Check if all category requirements are met
                  return Object.entries(dishSelectionRules).some(([category, required]: [string, any]) => {
                    if (required === 0) return false;
                    const selected = selectedDishesByCategory[category]?.length || 0;
                    return selected !== required;
                  });
                })())
              }
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          ) : (
            <button
              onClick={() => setIsFinalConfirmModalOpen(true)}
              disabled={!info.name || !info.email || isSubmitting}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full gradient-warm text-primary-foreground shadow-soft hover:shadow-card transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Review & Submit
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
                    
                    // Handle category-based selection
                    const category = viewingDish.category;
                    const selectedInCategory = selectedDishesByCategory[category] || [];
                    const required = dishSelectionRules?.[category] || 0;
                    const isSelected = selectedInCategory.includes(viewingDish.id);
                    
                    if (isSelected) {
                      setSelectedDishesByCategory({
                        ...selectedDishesByCategory,
                        [category]: selectedInCategory.filter(id => id !== viewingDish.id)
                      });
                    } else if (selectedInCategory.length < required) {
                      setSelectedDishesByCategory({
                        ...selectedDishesByCategory,
                        [category]: [...selectedInCategory, viewingDish.id]
                      });
                    } else {
                      toast({
                        title: "Maximum reached",
                        description: `You can only select ${required} ${category.replace('_', ' ')} ${required === 1 ? 'dish' : 'dishes'}`,
                        variant: "destructive",
                      });
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    (selectedDishesByCategory[viewingDish.category] || []).includes(viewingDish.id)
                      ? "bg-destructive/10 hover:bg-destructive/20 text-destructive"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                >
                  {(selectedDishesByCategory[viewingDish.category] || []).includes(viewingDish.id)
                    ? "Remove from Selection" : "Add to Selection"}
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

      {/* Dish Selection Confirmation Modal */}
      <Dialog open={isDishConfirmModalOpen} onOpenChange={setIsDishConfirmModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Confirm Your Dish Selection
              </h2>
              <p className="text-muted-foreground">
                Please review your choices. Make sure this is final before proceeding.
              </p>
            </div>

            {/* Selected Dishes by Category */}
            <div className="space-y-6">
              {Object.entries(selectedDishesByCategory).map(([category, dishIds]) => {
                if (!dishIds || dishIds.length === 0) return null;
                const categoryDishes = availableDishes.filter(d => dishIds.includes(d.id));
                if (categoryDishes.length === 0) return null;

                return (
                  <div key={category} className="bg-muted/30 rounded-xl p-5">
                    <h3 className="font-semibold text-lg text-primary uppercase tracking-wider mb-4">
                      {category.replace('_', ' ')} ({categoryDishes.length})
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {categoryDishes.map((dish) => (
                        <div key={dish.id} className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border">
                          {dish.image && (
                            <img
                              src={dish.image.startsWith('http') ? dish.image : `${import.meta.env.VITE_API_URL || ''}${dish.image}`}
                              alt={dish.name}
                              className="w-16 h-16 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">{dish.name}</p>
                            {dish.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {dish.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setIsDishConfirmModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors font-medium"
              >
                ← Go Back & Edit
              </button>
              <button
                onClick={() => {
                  setIsDishConfirmModalOpen(false);
                  setStep(4);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                Confirm & Continue →
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Final Booking Confirmation Modal */}
      <Dialog open={isFinalConfirmModalOpen} onOpenChange={setIsFinalConfirmModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">
                Review Your Booking
              </h2>
              <p className="text-muted-foreground">
                Please confirm all details are correct before submitting your inquiry.
              </p>
            </div>

            {/* Booking Summary */}
            <div className="space-y-4">
              {/* Package & Tier */}
              <div className="bg-primary/10 rounded-xl p-5 border-2 border-primary/30">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-primary mb-3">
                  Package Selection
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event Type:</span>
                    <span className="font-semibold">{packages.find(p => p.id === pkg)?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package Tier:</span>
                    <span className="font-semibold">{tiers.find(t => t.id === tier)?.name}</span>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-muted/30 rounded-xl p-5">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-3">
                  Event Details
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Date:</span>
                    <p className="font-medium">{details.date ? new Date(details.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Guests:</span>
                    <p className="font-medium">{details.guests} people</p>
                  </div>
                  {details.venue && (
                    <div className="md:col-span-2">
                      <span className="text-xs text-muted-foreground">Venue:</span>
                      <p className="font-medium">{details.venue}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-muted/30 rounded-xl p-5">
                <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-3">
                  Contact Information
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Name:</span>
                    <p className="font-medium">{info.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Phone:</span>
                    <p className="font-medium">{info.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs text-muted-foreground">Email:</span>
                    <p className="font-medium">{info.email}</p>
                  </div>
                  {info.notes && (
                    <div className="md:col-span-2">
                      <span className="text-xs text-muted-foreground">Special Requests:</span>
                      <p className="font-medium text-sm">{info.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Dishes Summary */}
              {Object.values(selectedDishesByCategory).flat().length > 0 && (
                <div className="bg-muted/30 rounded-xl p-5">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-foreground/80 mb-3">
                    Selected Dishes ({Object.values(selectedDishesByCategory).flat().length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selectedDishesByCategory).map(([category, dishIds]) => {
                      if (!dishIds || dishIds.length === 0) return null;
                      const categoryDishes = availableDishes.filter(d => dishIds.includes(d.id));
                      return categoryDishes.map(dish => (
                        <span key={dish.id} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
                          {dish.name}
                        </span>
                      ));
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => setIsFinalConfirmModalOpen(false)}
                className="flex-1 px-6 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors font-medium"
                disabled={isSubmitting}
              >
                ← Go Back & Edit
              </button>
              <button
                onClick={() => {
                  setIsFinalConfirmModalOpen(false);
                  submit();
                }}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit Inquiry →"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default BookingDialog;
