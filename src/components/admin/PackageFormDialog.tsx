import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { packageService, dishService, menuService, type Package, type Dish, type Menu } from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";

interface PackageFormDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  package: Package | null;
}

const PackageFormDialog = ({ open, onClose, package: pkg }: PackageFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    menuType: "wedding",
    priceRange: "",
    includes: [] as string[],
    dishSelectionCount: "",
    selectedDishes: [] as number[],
    isFeatured: false,
    isActive: true
  });
  const [includeInput, setIncludeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [isLoadingDishes, setIsLoadingDishes] = useState(false);
  const [eventTypes, setEventTypes] = useState<Menu[]>([]);
  const [isLoadingEventTypes, setIsLoadingEventTypes] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDishes();
      fetchEventTypes();
    }
    if (pkg) {
      setFormData({
        name: pkg.name,
        description: pkg.description || "",
        menuType: pkg.menuType,
        priceRange: pkg.priceRange,
        includes: pkg.includes || [],
        dishSelectionCount: pkg.dishSelectionCount?.toString() || "",
        selectedDishes: pkg.dishes?.map(d => d.id) || [],
        isFeatured: pkg.isFeatured,
        isActive: pkg.isActive
      });
    } else {
      setFormData({
        name: "",
        description: "",
        menuType: "",
        priceRange: "",
        includes: [],
        dishSelectionCount: "",
        selectedDishes: [],
        isFeatured: false,
        isActive: true
      });
    }
    setIncludeInput("");
  }, [pkg, open]);

  const fetchDishes = async () => {
    try {
      setIsLoadingDishes(true);
      const response = await dishService.getAll();
      setAvailableDishes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch dishes:", error);
      toast.error("Failed to load dishes");
    } finally {
      setIsLoadingDishes(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      setIsLoadingEventTypes(true);
      const response = await menuService.getAll();
      const activeMenus = (response.data || []).filter((menu: Menu) => menu.isActive);
      setEventTypes(activeMenus);
    } catch (error) {
      console.error("Failed to fetch event types:", error);
      toast.error("Failed to load event types");
    } finally {
      setIsLoadingEventTypes(false);
    }
  };

  const handleAddInclude = () => {
    if (includeInput.trim()) {
      setFormData({
        ...formData,
        includes: [...formData.includes, includeInput.trim()],
      });
      setIncludeInput("");
    }
  };

  const handleRemoveInclude = (index: number) => {
    setFormData({
      ...formData,
      includes: formData.includes.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.menuType || !formData.priceRange) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.includes.length === 0) {
      toast.error("Please add at least one included item");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        menuType: formData.menuType,
        priceRange: formData.priceRange,
        includes: formData.includes,
        dishSelectionCount: formData.dishSelectionCount ? parseInt(formData.dishSelectionCount) : undefined,
        dishes: formData.selectedDishes, // Send array of dish IDs directly
        isFeatured: formData.isFeatured,
        isActive: formData.isActive
      };

      if (pkg) {
        await packageService.update(pkg.id, payload);
        toast.success("Package updated successfully");
      } else {
        await packageService.create(payload);
        toast.success("Package created successfully");
      }

      onClose(true);
    } catch (error) {
      console.error("Package form error:", error);
      toast.error(pkg ? "Failed to update package" : "Failed to create package");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display text-2xl">
            {pkg ? "Edit Package" : "Create New Package"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bahay Kubo, Salu-Salo"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the package"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="menuType">Event Type *</Label>
              {isLoadingEventTypes ? (
                <div className="w-full px-3 py-2 rounded-md border border-border bg-background text-muted-foreground">
                  Loading event types...
                </div>
              ) : eventTypes.length === 0 ? (
                <div className="w-full px-3 py-2 rounded-md border border-border bg-background text-muted-foreground">
                  No event types available. Please create event types first.
                </div>
              ) : (
                <select
                  id="menuType"
                  value={formData.menuType}
                  onChange={(e) => setFormData({ ...formData, menuType: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  required
                >
                  <option value="">Select an event type</option>
                  {eventTypes.map((menu) => (
                    <option key={menu.id} value={menu.type}>
                      {menu.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <Label htmlFor="priceRange">Price Range *</Label>
              <Input
                id="priceRange"
                value={formData.priceRange}
                onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                placeholder="e.g., ₱850 – ₱1,500 / guest"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Display price for customers (e.g., ₱850 / guest or ₱850 – ₱1,500 / guest)
              </p>
            </div>

            <div>
              <Label htmlFor="dishSelectionCount">Dish Selection Count</Label>
              <Input
                id="dishSelectionCount"
                type="number"
                value={formData.dishSelectionCount}
                onChange={(e) => setFormData({ ...formData, dishSelectionCount: e.target.value })}
                placeholder="e.g., 3, 5, 8 (how many dishes customer can select)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Number of dishes customer can choose from the available dishes below
              </p>
            </div>

            <div>
              <Label>Available Dishes for This Package</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Select dishes that customers can choose from
              </p>
              {isLoadingDishes ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading dishes...</p>
                </div>
              ) : availableDishes.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No dishes available</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto border border-border rounded-lg p-4 space-y-2">
                  {availableDishes.map((dish) => (
                    <div key={dish.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dish-${dish.id}`}
                        checked={formData.selectedDishes.includes(dish.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData({
                              ...formData,
                              selectedDishes: [...formData.selectedDishes, dish.id]
                            });
                          } else {
                            setFormData({
                              ...formData,
                              selectedDishes: formData.selectedDishes.filter(id => id !== dish.id)
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`dish-${dish.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {dish.name}
                        <span className="text-muted-foreground ml-2">
                          ({dish.category})
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {formData.selectedDishes.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.selectedDishes.length} dish(es) selected
                </p>
              )}
            </div>

            <div>
              <Label>Includes *</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInclude();
                    }
                  }}
                  placeholder="Add an included item (press Enter)"
                />
                <Button type="button" onClick={handleAddInclude} variant="outline">
                  Add
                </Button>
              </div>
              {formData.includes.length > 0 && (
                <div className="space-y-2">
                  {formData.includes.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted"
                    >
                      <span className="text-sm">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInclude(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured Package
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show "Most chosen" badge
                </p>
              </div>
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isFeatured: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this package to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : pkg ? "Update Package" : "Create Package"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PackageFormDialog;
