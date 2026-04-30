import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { dishService, type Dish } from "@/lib/api";
import { toast } from "sonner";
import DishFormDialog from "@/components/admin/DishFormDialog";

const DishesPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filteredDishes, setFilteredDishes] = useState<Dish[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  useEffect(() => {
    document.title = "Dishes — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDishes();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterDishes();
  }, [searchQuery, selectedCategory, dishes]);

  const fetchDishes = async () => {
    try {
      setIsLoading(true);
      const response = await dishService.getAll();
      setDishes(response.data || []);
    } catch (error) {
      toast.error("Failed to load dishes");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterDishes = () => {
    let filtered = [...dishes];

    if (selectedCategory !== "all") {
      filtered = filtered.filter((dish) => dish.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (dish) =>
          dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          dish.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDishes(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;

    try {
      await dishService.delete(id);
      toast.success("Dish deleted successfully");
      fetchDishes();
    } catch (error) {
      toast.error("Failed to delete dish");
      console.error(error);
    }
  };

  const handleToggleAvailability = async (dish: Dish) => {
    try {
      await dishService.update(dish.id, { isAvailable: !dish.isAvailable });
      toast.success(`Dish ${!dish.isAvailable ? "enabled" : "disabled"}`);
      fetchDishes();
    } catch (error) {
      toast.error("Failed to update dish");
      console.error(error);
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingDish(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    setEditingDish(null);
    if (success) {
      fetchDishes();
    }
  };

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "appetizer", label: "Appetizers" },
    { value: "main_course", label: "Main Course" },
    { value: "dessert", label: "Desserts" },
    { value: "beverage", label: "Beverages" },
    { value: "side_dish", label: "Side Dishes" },
  ];

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Manage <span className="italic font-light text-gradient-warm">Dishes</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              Add, edit, and organize your menu items
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Dish
          </button>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading dishes...</p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No dishes found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="group relative rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-all hover:shadow-2xl hover:scale-[1.02] duration-300"
                >
                  {/* Dish Image - Full Cover */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {dish.image ? (
                      <img
                        src={dish.image.startsWith('http') ? dish.image : `${import.meta.env.VITE_API_URL || ''}${dish.image}`}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                            <span className="text-4xl">🍽️</span>
                          </div>
                          <span className="text-muted-foreground/50 font-display text-sm">No Image</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    
                    {/* Availability Badge */}
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() => handleToggleAvailability(dish)}
                        className={`px-3 py-1.5 rounded-full backdrop-blur-md border-2 transition-all font-medium text-xs uppercase tracking-wider shadow-lg ${
                          dish.isAvailable
                            ? "bg-green-500/90 text-white border-green-400 hover:bg-green-600"
                            : "bg-red-500/90 text-white border-red-400 hover:bg-red-600"
                        }`}
                        title={dish.isAvailable ? "Click to hide" : "Click to show"}
                      >
                        {dish.isAvailable ? (
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3 h-3" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-block px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/30 text-xs font-semibold uppercase tracking-wider shadow-lg">
                        {dish.category.replace("_", " ")}
                      </span>
                    </div>
                    
                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="space-y-3">
                        {/* Dish Name */}
                        <h3 className="font-display text-2xl font-bold text-white drop-shadow-lg leading-tight">
                          {dish.name}
                        </h3>
                        
                        {/* Description */}
                        {dish.description && (
                          <p className="text-sm text-white/90 line-clamp-2 drop-shadow-md leading-relaxed">
                            {dish.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons Footer */}
                  <div className="bg-card border-t border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span>ID: {dish.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors font-medium text-sm flex items-center gap-2"
                          title="Edit dish"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(dish.id)}
                          className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                          title="Delete dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DishFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        dish={editingDish}
      />
    </AdminLayout>
  );
};

export default DishesPage;
