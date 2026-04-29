import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Download } from "lucide-react";

const CustomersPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Customers — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Customer <span className="italic font-light text-gradient-warm">Directory</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              View and manage customer information
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all">
            <Download className="w-5 h-5" />
            Export List
          </button>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <p className="text-center text-foreground/60 py-12">
            Customer management coming soon...
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CustomersPage;
