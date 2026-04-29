import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { menuService, type Menu } from "@/lib/api";
import { toast } from "sonner";
import MenuFormDialog from "@/components/admin/MenuFormDialog";

const MenusPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  useEffect(() => {
    document.title = "Menus — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenus();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterMenus();
  }, [searchQuery, menus]);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const response = await menuService.getAll();
      setMenus(response.data || []);
    } catch (error) {
      toast.error("Failed to load menus");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMenus = () => {
    let filtered = [...menus];

    if (searchQuery) {
      filtered = filtered.filter(
        (menu) =>
          menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          menu.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          menu.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredMenus(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this menu?")) return;

    try {
      await menuService.delete(id);
      toast.success("Menu deleted successfully");
      fetchMenus();
    } catch (error) {
      toast.error("Failed to delete menu");
      console.error(error);
    }
  };

  const handleToggleActive = async (menu: Menu) => {
    try {
      await menuService.update(menu.id, { isActive: !menu.isActive });
      toast.success(`Menu ${!menu.isActive ? "activated" : "deactivated"}`);
      fetchMenus();
    } catch (error) {
      toast.error("Failed to update menu");
      console.error(error);
    }
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingMenu(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    setEditingMenu(null);
    if (success) {
      fetchMenus();
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Manage <span className="italic font-light text-gradient-warm">Event Types</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              Create event type categories (Wedding, Corporate, etc.)
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Event Type
          </button>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search event types..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading event types...</p>
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No event types found</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-2xl font-medium text-foreground">
                          {menu.name}
                        </h3>
                        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase">
                          {menu.type}
                        </span>
                      </div>
                      {menu.description && (
                        <p className="text-foreground/70 mb-3">{menu.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(menu)}
                        className={`p-2 rounded-lg transition-colors ${
                          menu.isActive
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }`}
                      >
                        {menu.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(menu)}
                        className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <MenuFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        menu={editingMenu}
      />
    </AdminLayout>
  );
};

export default MenusPage;
