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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-background rounded-xl p-4 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-medium text-foreground mb-1">
                        {dish.name}
                      </h3>
                      <span className="inline-block px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        {dish.category.replace("_", " ")}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleAvailability(dish)}
                      className={`p-2 rounded-lg transition-colors ${
                        dish.isAvailable
                          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                      }`}
                    >
                      {dish.isAvailable ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {dish.description && (
                    <p className="text-sm text-foreground/70 mb-3 line-clamp-2">
                      {dish.description}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => handleEdit(dish)}
                      className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish.id)}
                      className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
