import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Search, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { testimonialService, type Testimonial } from "@/lib/api";
import { toast } from "sonner";
import TestimonialFormDialog from "@/components/admin/TestimonialFormDialog";

const TestimonialsPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    document.title = "Testimonials — Sampaguita & Saro Admin";
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTestimonials();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterTestimonials();
  }, [searchQuery, testimonials]);

  const fetchTestimonials = async () => {
    try {
      setIsLoading(true);
      const response = await testimonialService.getAllAdmin();
      setTestimonials(response.data || []);
    } catch (error) {
      toast.error("Failed to load testimonials");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = [...testimonials];

    if (searchQuery) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          testimonial.eventType?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTestimonials(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    try {
      await testimonialService.delete(id);
      toast.success("Testimonial deleted successfully");
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to delete testimonial");
      console.error(error);
    }
  };

  const handleToggleActive = async (testimonial: Testimonial) => {
    try {
      await testimonialService.update(testimonial.id, { isActive: !testimonial.isActive });
      toast.success(`Testimonial ${!testimonial.isActive ? "activated" : "deactivated"}`);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update testimonial");
      console.error(error);
    }
  };

  const handleToggleFeatured = async (testimonial: Testimonial) => {
    try {
      await testimonialService.update(testimonial.id, { isFeatured: !testimonial.isFeatured });
      toast.success(`Testimonial ${!testimonial.isFeatured ? "featured" : "unfeatured"}`);
      fetchTestimonials();
    } catch (error) {
      toast.error("Failed to update testimonial");
      console.error(error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingTestimonial(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (success?: boolean) => {
    setIsDialogOpen(false);
    setEditingTestimonial(null);
    if (success) {
      fetchTestimonials();
    }
  };

  if (loading || !isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-medium text-foreground">
              Customer <span className="italic font-light text-gradient-warm">Testimonials</span>
            </h1>
            <p className="text-foreground/60 mt-1">
              Manage reviews and feedback
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-foreground text-background hover:shadow-glow transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        </div>

        <div className="glass rounded-2xl p-6 shadow-card mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
              <input
                type="text"
                placeholder="Search testimonials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
              <p className="text-foreground/60">Loading testimonials...</p>
            </div>
          ) : filteredTestimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground/60">No testimonials found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-background rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl font-medium text-foreground">
                          {testimonial.customerName}
                        </h3>
                        {testimonial.isFeatured && (
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                            Featured
                          </span>
                        )}
                        {!testimonial.isActive && (
                          <span className="px-2 py-1 rounded-md bg-red-500/10 text-red-500 text-xs font-medium">
                            Hidden
                          </span>
                        )}
                      </div>
                      {testimonial.customerRole && (
                        <p className="text-sm text-foreground/60 mb-2">{testimonial.customerRole}</p>
                      )}
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < testimonial.rating
                                ? "fill-primary text-primary"
                                : "text-foreground/20"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        "{testimonial.content}"
                      </p>
                      {testimonial.eventType && (
                        <span className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent text-xs">
                          {testimonial.eventType}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleToggleFeatured(testimonial)}
                        className={`p-2 rounded-lg transition-colors ${
                          testimonial.isFeatured
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-foreground/5 hover:bg-foreground/10 text-foreground"
                        }`}
                        title={testimonial.isFeatured ? "Unfeature" : "Feature"}
                      >
                        <Star className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(testimonial)}
                        className={`p-2 rounded-lg transition-colors ${
                          testimonial.isActive
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }`}
                        title={testimonial.isActive ? "Hide" : "Show"}
                      >
                        {testimonial.isActive ? (
                          <Eye className="w-5 h-5" />
                        ) : (
                          <EyeOff className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
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

      <TestimonialFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        testimonial={editingTestimonial}
      />
    </AdminLayout>
  );
};

export default TestimonialsPage;
