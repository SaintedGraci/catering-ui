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
  const [currentCategoryModal, setCurrentCategoryModal] = useState<string | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    setValidationErrors({});
  };

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) setTimeout(reset, 300);
  };

  // Validation helper functions
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'customerName':
        if (!value || value.length < 2) return 'Name must be at least 2 characters';
        if (value.length > 200) return 'Name cannot exceed 200 characters';
        return null;
      case 'customerEmail':
        if (!value) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Please provide a valid email address';
        return null;
      case 'customerPhone':
        if (!value) return 'Phone number is required';
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value)) return 'Please provide a valid phone number';
        if (value.length < 7) return 'Phone number must be at least 7 characters';
        if (value.length > 20) return 'Phone number cannot exceed 20 characters';
        return null;
      case 'eventDate':
        if (!value) return 'Event date is required';
        return null;
      case 'guestCount':
        if (!value) return 'Guest count is required';
        const count = parseInt(value);
        if (isNaN(count) || count < 1) return 'Guest count must be at least 1';
        if (count > 10000) return 'Guest count cannot exceed 10,000';
        return null;
      default:
        return null;
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    // Update the field value
    if (field === 'customerName' || field === 'customerEmail' || field === 'customerPhone') {
      setInfo({ ...info, [field.replace('customer', '').toLowerCase()]: value });
    } else if (field === 'eventDate' || field === 'guestCount') {
      const key = field === 'eventDate' ? 'date' : 'guests';
      setDetails({ ...details, [key]: value });
    }

    // Clear validation error for this field if it exists
    if (validationErrors[field]) {
      const newErrors = { ...validationErrors };
      delete newErrors[field];
      setValidationErrors(newErrors);
    }
  };

  const submit = async () => {
    // Prevent double submission
    if (isSubmitting) return;
    
    // Clear previous validation errors
    setValidationErrors({});
    
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
    } catch (error: any) {
      console.error("Booking error:", error);
      
      // Parse validation errors from API response
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const errors: Record<string, string> = {};
        error.response.data.errors.forEach((err: any) => {
          if (err.field && err.message) {
            errors[err.field] = err.message;
          }
        });
        setValidationErrors(errors);
        
        // Show first error in toast
        const firstError = error.response.data.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message || "Please check your input and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to submit booking. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-gray-400 transition-all duration-200 outline-none";
  const inputErrorCls = "w-full bg-red-50 dark:bg-red-950/20 border-2 border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-500/10 rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-red-300 transition-all duration-200 outline-none";
  const inputSuccessCls = "w-full bg-green-50 dark:bg-green-950/20 border-2 border-green-500 focus:border-green-600 focus:ring-4 focus:ring-green-500/10 rounded-xl px-4 py-3.5 text-base text-foreground placeholder:text-green-300 transition-all duration-200 outline-none";

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden p-0 gap-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-0 shadow-2xl rounded-3xl">
        {/* Modern Progress Header */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-6 sm:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-primary mb-1">Book Your Event</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Step {step} of {dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) ? 5 : 4}</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-medium text-primary">In Progress</span>
            </div>
          </div>
          {/* Modern Progress Bar */}
          <div className="flex gap-2">
            {Array.from({ length: dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) ? 5 : 4 }).map((_, n) => (
              <div
                key={n}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  n < step 
                    ? "bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30" 
                    : n === step - 1
                    ? "bg-gradient-to-r from-primary/60 to-primary/40"
                    : "bg-gray-200 dark:bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 sm:px-10 py-8 sm:py-10 overflow-y-auto max-h-[calc(95vh-180px)]">
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
                <div className="grid sm:grid-cols-2 gap-5">
                  {packages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPkg(p.id)}
                      className={`group text-left rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        pkg === p.id 
                          ? "border-primary shadow-2xl shadow-primary/20 scale-[1.02]" 
                          : "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-xl"
                      }`}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <img src={p.img} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                        {pkg === p.id && (
                          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-6 bg-white dark:bg-gray-900">
                        <div className="font-display text-2xl font-bold text-foreground mb-2">{p.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">{p.tagline}</div>
                        <div className="flex flex-wrap gap-2">
                          {p.price && (
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{p.price}</span>
                          )}
                          {p.dishCount !== undefined && p.dishCount > 0 && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">{p.dishCount} dishes</span>
                          )}
                          {p.minGuests && (
                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium">{p.minGuests}-{p.maxGuests || "+"} guests</span>
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
              <div className="text-center max-w-2xl mx-auto py-12">
                <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-4">
                  Let's choose your <em className="italic text-primary">perfect menu</em>
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  We'll guide you through selecting dishes for each category, one step at a time.
                </p>
                
                {/* Category Preview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {Object.entries(dishSelectionRules).map(([category, required]: [string, any]) => {
                    if (required === 0) return null;
                    const selected = selectedDishesByCategory[category]?.length || 0;
                    const isComplete = selected === required;
                    
                    const getCategoryIcon = (cat: string) => {
                      const icons: Record<string, string> = {
                        appetizer: '🥗',
                        main_course: '🍖',
                        side_dish: '🍚',
                        dessert: '🍰',
                        beverage: '🥤'
                      };
                      return icons[cat] || '🍽️';
                    };
                    
                    return (
                      <div
                        key={category}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isComplete 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-muted/30 border-border'
                        }`}
                      >
                        <div className="text-4xl mb-2">{getCategoryIcon(category)}</div>
                        <div className="font-semibold text-sm capitalize mb-1">
                          {category.replace('_', ' ')}
                        </div>
                        <div className={`text-xs ${isComplete ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isComplete ? '✓ Complete' : `Select ${required}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Progress Summary */}
                {(() => {
                  const totalRequired = Object.values(dishSelectionRules).reduce((sum: number, count: any) => sum + count, 0);
                  const totalSelected = Object.values(selectedDishesByCategory).flat().length;
                  
                  if (totalSelected > 0) {
                    return (
                      <div className="mb-8 p-4 rounded-lg bg-primary/10 border-2 border-primary/30">
                        <div className="text-sm text-muted-foreground mb-2">Your Progress</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 bg-background rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${(totalSelected / totalRequired) * 100}%` }}
                            />
                          </div>
                          <div className="font-bold text-primary">
                            {totalSelected}/{totalRequired}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
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
              
              {/* Start Selection Button - Shows at beginning */}
              {(() => {
                const hasAnySelection = Object.values(selectedDishesByCategory).some(arr => arr && arr.length > 0);
                if (hasAnySelection) return null;
                
                return (
                  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 animate-in slide-in-from-bottom duration-500">
                    <button
                      onClick={() => {
                        // Set up category order
                        const categories = Object.entries(dishSelectionRules)
                          .filter(([_, required]) => required > 0)
                          .map(([category]) => category);
                        setCategoryOrder(categories);
                        setCurrentCategoryModal(categories[0]);
                      }}
                      className="flex items-center gap-3 px-8 py-4 rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/50 hover:shadow-primary/70 hover:scale-105 transition-all font-semibold text-lg"
                    >
                      <span>Start Selecting Dishes</span>
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
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Event date *</span>
                  <input 
                    type="date" 
                    value={details.date} 
                    onChange={(e) => handleFieldChange('eventDate', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('eventDate', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, eventDate: error });
                      }
                    }}
                    className={
                      validationErrors.eventDate ? inputErrorCls :
                      details.date && !validateField('eventDate', details.date) ? inputSuccessCls :
                      inputCls
                    }
                  />
                  {validationErrors.eventDate && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.eventDate}</p>
                  )}
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Guest count *</span>
                  <input 
                    type="number" 
                    min={1} 
                    value={details.guests} 
                    onChange={(e) => handleFieldChange('guestCount', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('guestCount', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, guestCount: error });
                      }
                    }}
                    className={
                      validationErrors.guestCount ? inputErrorCls :
                      details.guests && !validateField('guestCount', details.guests) ? inputSuccessCls :
                      inputCls
                    }
                    placeholder="e.g. 80" 
                  />
                  {validationErrors.guestCount && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.guestCount}</p>
                  )}
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
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Event date *</span>
                  <input 
                    type="date" 
                    value={details.date} 
                    onChange={(e) => handleFieldChange('eventDate', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('eventDate', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, eventDate: error });
                      }
                    }}
                    className={
                      validationErrors.eventDate ? inputErrorCls :
                      details.date && !validateField('eventDate', details.date) ? inputSuccessCls :
                      inputCls
                    }
                  />
                  {validationErrors.eventDate && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.eventDate}</p>
                  )}
                </label>
                <label className="block">
                  <span className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Guest count *</span>
                  <input 
                    type="number" 
                    min={1} 
                    value={details.guests} 
                    onChange={(e) => handleFieldChange('guestCount', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('guestCount', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, guestCount: error });
                      }
                    }}
                    className={
                      validationErrors.guestCount ? inputErrorCls :
                      details.guests && !validateField('guestCount', details.guests) ? inputSuccessCls :
                      inputCls
                    }
                    placeholder="e.g. 80" 
                  />
                  {validationErrors.guestCount && (
                    <p className="text-xs text-destructive mt-1">{validationErrors.guestCount}</p>
                  )}
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
              <h2 className="font-display text-3xl sm:text-4xl text-foreground text-balance mb-3">
                Last step — how can we <em className="italic text-primary">reach you</em>?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">We'll be in touch within one business day.</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Full name *</span>
                  <input 
                    value={info.name} 
                    onChange={(e) => handleFieldChange('customerName', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('customerName', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, customerName: error });
                      }
                    }}
                    className={
                      validationErrors.customerName ? inputErrorCls :
                      info.name && !validateField('customerName', info.name) ? inputSuccessCls :
                      inputCls
                    }
                    placeholder="John Doe" 
                  />
                  {validationErrors.customerName && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.customerName}
                    </p>
                  )}
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</span>
                  <input 
                    type="email" 
                    value={info.email} 
                    onChange={(e) => handleFieldChange('customerEmail', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('customerEmail', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, customerEmail: error });
                      }
                    }}
                    className={
                      validationErrors.customerEmail ? inputErrorCls :
                      info.email && !validateField('customerEmail', info.email) ? inputSuccessCls :
                      inputCls
                    }
                    placeholder="john@example.com" 
                  />
                  {validationErrors.customerEmail && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.customerEmail}
                    </p>
                  )}
                </label>
                <label className="block sm:col-span-2 space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone *</span>
                  <input 
                    type="tel" 
                    value={info.phone} 
                    onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
                    onBlur={(e) => {
                      const error = validateField('customerPhone', e.target.value);
                      if (error) {
                        setValidationErrors({ ...validationErrors, customerPhone: error });
                      }
                    }}
                    className={
                      validationErrors.customerPhone ? inputErrorCls :
                      info.phone && !validateField('customerPhone', info.phone) ? inputSuccessCls :
                      inputCls
                    }
                    placeholder="+1 (555) 000-0000 (min. 7 characters)" 
                  />
                  {validationErrors.customerPhone && (
                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {validationErrors.customerPhone}
                    </p>
                  )}
                </label>
                <label className="block sm:col-span-2 space-y-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Special requests (optional)</span>
                  <textarea rows={4} value={info.notes} onChange={(e) => setInfo({ ...info, notes: e.target.value })} className={`${inputCls} resize-none`} placeholder="Dietary restrictions, theme preferences, special accommodations..." />
                </label>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 rounded-2xl border border-primary/20">
                <div className="text-xs font-semibold tracking-wider uppercase text-primary mb-4">Booking Summary</div>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Event Type</p>
                      <p className="font-semibold text-foreground">{packages.find(p => p.id === pkg)?.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Package Tier</p>
                      <p className="font-semibold text-foreground">{tiers.find(t => t.id === tier)?.name}</p>
                    </div>
                  </div>
                  {(() => {
                    const totalSelected = Object.values(selectedDishesByCategory).flat().length;
                    return totalSelected > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Selected Dishes</p>
                          <p className="font-semibold text-foreground">{totalSelected} dishes</p>
                        </div>
                      </div>
                    );
                  })()}
                  {details.date && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Event Date</p>
                        <p className="font-semibold text-foreground">{details.date}</p>
                      </div>
                    </div>
                  )}
                  {details.guests && (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-0.5">Guest Count</p>
                        <p className="font-semibold text-foreground">{details.guests} people</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Footer */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-6 sm:px-10 py-6 flex items-center justify-between gap-4">
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
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {/* Hide Continue button on step 3 (dish selection) - only show floating "Start Selecting Dishes" button */}
          {step === 3 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0) ? (
            <div></div>
          ) : ((step < 4 && (!dishSelectionRules || !Object.values(dishSelectionRules).some(count => count > 0))) || (step < 5 && dishSelectionRules && Object.values(dishSelectionRules).some(count => count > 0))) ? (
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
                (step === 2 && !tier)
              }
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setIsFinalConfirmModalOpen(true)}
              disabled={!info.name || !info.email || isSubmitting}
              className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Category-by-Category Selection Modal */}
      <Dialog open={currentCategoryModal !== null} onOpenChange={(open) => !open && setCurrentCategoryModal(null)}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden p-0 gap-0">
          {currentCategoryModal && (() => {
            const category = currentCategoryModal;
            const required = dishSelectionRules?.[category] || 0;
            const categoryDishes = availableDishes.filter(d => d.category === category);
            const selectedInCategory = selectedDishesByCategory[category] || [];
            const currentIndex = categoryOrder.indexOf(category);
            const isLastCategory = currentIndex === categoryOrder.length - 1;
            
            const getCategoryIcon = (cat: string) => {
              const icons: Record<string, string> = {
                appetizer: '🥗',
                main_course: '🍖',
                side_dish: '🍚',
                dessert: '🍰',
                beverage: '🥤'
              };
              return icons[cat] || '🍽️';
            };
            
            const getCategoryColor = (cat: string) => {
              const colors: Record<string, string> = {
                appetizer: 'from-green-500 to-emerald-600',
                main_course: 'from-orange-500 to-red-600',
                side_dish: 'from-yellow-500 to-amber-600',
                dessert: 'from-pink-500 to-rose-600',
                beverage: 'from-blue-500 to-cyan-600'
              };
              return colors[cat] || 'from-primary to-primary';
            };
            
            return (
              <>
                {/* Header with Progress */}
                <div className={`relative bg-gradient-to-r ${getCategoryColor(category)} p-6 text-white`}>
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-5xl">{getCategoryIcon(category)}</span>
                        <div>
                          <h2 className="font-display text-3xl font-bold capitalize">
                            {category.replace('_', ' ')}
                          </h2>
                          <p className="text-white/90 text-sm mt-1">
                            Select {required} {required === 1 ? 'dish' : 'dishes'} from this category
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold">{selectedInCategory.length}/{required}</div>
                        <div className="text-xs text-white/80 uppercase tracking-wider">Selected</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex gap-1">
                      {categoryOrder.map((cat, idx) => (
                        <div
                          key={cat}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            idx < currentIndex ? 'bg-white' :
                            idx === currentIndex ? 'bg-white/60' :
                            'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs text-white/80 mt-2 text-center">
                      Step {currentIndex + 1} of {categoryOrder.length}
                    </div>
                  </div>
                </div>
                
                {/* Dishes Grid */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-280px)]">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                                description: `You can only select ${required} ${category.replace('_', ' ')}`,
                                variant: "destructive",
                              });
                            }
                          }}
                          className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "ring-4 ring-white shadow-2xl scale-105"
                              : "hover:shadow-xl hover:scale-102"
                          }`}
                        >
                          {/* Dish Image */}
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
                                <UtensilsCrossed className="w-12 h-12 text-muted-foreground/30" />
                              </div>
                            )}
                            
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${
                              isSelected 
                                ? 'from-white/95 via-white/60 to-transparent' 
                                : 'from-black/80 via-black/30 to-transparent group-hover:from-black/90'
                            }`} />
                            
                            {/* Selected Badge */}
                            {isSelected && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-20 h-20 rounded-full bg-gradient-to-r ${getCategoryColor(category)} shadow-2xl flex items-center justify-center animate-in zoom-in duration-300`}>
                                  <span className="text-4xl">✓</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Content */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h4 className={`font-display text-sm font-bold leading-tight line-clamp-2 ${
                                isSelected ? 'text-foreground' : 'text-white drop-shadow-lg'
                              }`}>
                                {dish.name}
                              </h4>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Footer Actions */}
                <div className="border-t border-border p-6 bg-muted/30">
                  <div className="flex gap-3">
                    {currentIndex > 0 && (
                      <button
                        onClick={() => setCurrentCategoryModal(categoryOrder[currentIndex - 1])}
                        className="px-6 py-3 rounded-lg border-2 border-border hover:bg-muted transition-colors font-medium"
                      >
                        ← Previous
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (selectedInCategory.length === required) {
                          if (isLastCategory) {
                            setCurrentCategoryModal(null);
                            setIsDishConfirmModalOpen(true);
                          } else {
                            setCurrentCategoryModal(categoryOrder[currentIndex + 1]);
                          }
                        } else {
                          toast({
                            title: "Selection incomplete",
                            description: `Please select ${required} ${category.replace('_', ' ')}`,
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={selectedInCategory.length !== required}
                      className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${getCategoryColor(category)} text-white shadow-lg hover:shadow-xl`}
                    >
                      {isLastCategory ? 'Review Selections →' : 'Next Category →'}
                    </button>
                  </div>
                </div>
              </>
            );
          })()}
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
