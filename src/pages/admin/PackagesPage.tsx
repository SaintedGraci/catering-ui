import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star } from "lucide-react";
import { packageService, menuService, type Package, type Menu } from "@/lib/api";
import { toast } from "sonner";
import PackageFormDialog from "@/components/admin/PackageFormDialog";

const PackagesPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMenuType, setFilterMenuType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [eventTypes, setEventTypes] = useState<Menu[]>([]);

  useEffect(() => {
    document.title = "Packages — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPackages();
      fetchEventTypes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterPackages();
  }, [searchQuery, filterMenuType, packages]);

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const response = await packageService.getAllAdmin();
      setPackages(response.data || []);
    } catch (error) {
      toast.error("Failed to load packages");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const response = await menuService.getAll();
      setEventTypes(response.data || []);
    } catch (error) {
      console.error("Failed to fetch event types:", error);
    }
  };

  const filterPackages = () => {
    let filtered = [...packages];

    if (filterMenuType !== "all") {
      filtered = filtered.filter((pkg) => pkg.menuType === filterMenuType);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.menuType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by menuType, then featured, then name
    filtered.sort((a, b) => {
      if (a.menuType !== b.menuType) {
        return a.menuType.localeCompare(b.menuType);
      }
      if (a.isFeatured !== b.isFeatured) {
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredPackages(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this package?")) return;

    try {
      await packageService.delete(id);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (error) {
      toast.error("Failed to delete package");
      console.error(error);
    }
  };

  const handleToggleActive = async (pkg: Package) => {
    try {
      await packageService.update(pkg.id, { isActive: !pkg.isActive });
      toast.success(`Package ${!pkg.isActive ? "activated" : "deactivated"}`);
      fetchPackages();
    } catch (error) {
      toast.error("Failed to update package");
      console.error(error);
    }
  };

  const handleToggleFeatured = async (pkg: Package) => {
    try {
      await packageService.update(pkg.id, { isFeatured: !pkg.isFeatured });
      toast.success(`Package ${!pkg.isFeatured ? "featured" : "unfeatured"}`);
      fetchPackages();
    } catch (error) {
      toast.error("Failed to update package");
      console.error(error);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    if (success) {
      fetchPackages();
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Manage <span className="italic font-light text-gradient-warm">Packages</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              Create and customize package tiers for each event type
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Package
          </button>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterMenuType}
              onChange={(e) => setFilterMenuType(e.target.value)}
              className="px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Types</option>
              {eventTypes.map((menu) => (
                <option key={menu.id} value={menu.type}>
                  {menu.name}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading packages...</p>
            </div>
          ) : filteredPackages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No packages found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-2xl font-medium text-foreground">
                          {pkg.name}
                        </h3>
                        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase">
                          {eventTypes.find(m => m.type === pkg.menuType)?.name || pkg.menuType}
                        </span>
                        {pkg.isFeatured && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-xs font-medium">
                            <Star className="w-3 h-3 fill-current" />
                            Featured
                          </span>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-foreground/70 mb-3">{pkg.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm text-foreground/60 mb-3">
                        <span className="font-display text-lg font-medium text-foreground">
                          {pkg.priceRange}
                        </span>
                        {pkg.dishSelectionCount && (
                          <span>Customer selects {pkg.dishSelectionCount} dishes</span>
                        )}
                        {pkg.dishes && pkg.dishes.length > 0 && (
                          <span>{pkg.dishes.length} dishes available</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleFeatured(pkg)}
                        className={`p-2 rounded-lg transition-colors ${
                          pkg.isFeatured
                            ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                            : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
                        }`}
                        title={pkg.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <Star className={`w-5 h-5 ${pkg.isFeatured ? "fill-current" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(pkg)}
                        className={`p-2 rounded-lg transition-colors ${
                          pkg.isActive
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }`}
                      >
                        {pkg.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {pkg.includes && pkg.includes.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <p className="font-mono text-xs tracking-[0.2em] uppercase text-foreground/60 mb-3">
                        Includes
                      </p>
                      <ul className="space-y-2">
                        {pkg.includes.map((item, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-foreground/70">
                            <span className="text-primary">·</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {pkg.dishes && pkg.dishes.length > 0 && (
                    <div className="pt-4 border-t border-border mt-4">
                      <p className="font-mono text-xs tracking-[0.2em] uppercase text-foreground/60 mb-3">
                        Available Dishes ({pkg.dishes.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {pkg.dishes.map((dish) => (
                          <span
                            key={dish.id}
                            className="px-3 py-1 rounded-full bg-foreground/5 text-foreground text-sm"
                          >
                            {dish.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PackageFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        package={editingPackage}
      />
    </AdminLayout>
  );
};

export default PackagesPage;
