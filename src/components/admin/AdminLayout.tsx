import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Menu as MenuIcon,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: UtensilsCrossed, label: "Dishes", path: "/admin/dishes" },
  { icon: MenuIcon, label: "Menus", path: "/admin/menus" },
  { icon: Package, label: "Packages", path: "/admin/packages" },
  { icon: Calendar, label: "Bookings", path: "/admin/bookings" },
  { icon: MessageSquare, label: "Testimonials", path: "/admin/testimonials" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-72"
        } border-r border-border/50 bg-card/40 backdrop-blur-2xl transition-all duration-300 flex flex-col z-50 relative`}
      >
        {/* Logo */}
        <div className="h-24 border-b border-border/50 flex items-center justify-between px-6">
          {!collapsed && (
            <div className="flex flex-col">
              <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
                S&S <span className="italic font-light text-gradient-warm">Admin</span>
              </h2>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-foreground/50 mt-1">
                Dashboard
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-foreground/70" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-foreground/70" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden ${
                  active
                    ? "bg-gradient-warm text-primary-foreground shadow-glow font-medium"
                    : "text-foreground hover:bg-primary/20 hover:text-primary font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-primary-foreground" : "text-foreground/70 group-hover:text-primary"} transition-colors`} />
                {!collapsed && (
                  <span className="text-sm tracking-wide z-10">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/50 p-4 bg-gradient-to-t from-background/50 to-transparent">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-foreground/5 to-foreground/5 border border-foreground/5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-xs text-foreground/60 truncate mt-0.5">{user?.email || "admin@example.com"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/60 hover:bg-destructive/10 hover:text-destructive hover:shadow-sm transition-all duration-300 group"
              >
                <LogOut className="w-5 h-5 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-3 rounded-xl text-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background to-muted/20 relative">
        <div className="absolute inset-0 grain opacity-20 pointer-events-none" />
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

