import { useState, useEffect } from "react";
import { X, Star, Upload } from "lucide-react";
import { testimonialService, uploadService, type Testimonial } from "@/lib/api";
import { toast } from "sonner";

interface TestimonialFormDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  testimonial: Testimonial | null;
}

const TestimonialFormDialog = ({ open, onClose, testimonial }: TestimonialFormDialogProps) => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerRole: "",
    content: "",
    rating: 5,
    eventType: "",
    image: "",
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (testimonial) {
      setFormData({
        customerName: testimonial.customerName,
        customerRole: testimonial.customerRole || "",
        content: testimonial.content,
        rating: testimonial.rating,
        eventType: testimonial.eventType || "",
        image: testimonial.image || "",
        isActive: testimonial.isActive,
        isFeatured: testimonial.isFeatured,
        sortOrder: testimonial.sortOrder,
      });
      // Cloudinary URLs are already full URLs, local uploads start with /uploads
      setImagePreview(testimonial.image ? (testimonial.image.startsWith('http') ? testimonial.image : `${import.meta.env.VITE_API_URL}${testimonial.image}`) : "");
      setSelectedFile(null);
    } else {
      setFormData({
        customerName: "",
        customerRole: "",
        content: "",
        rating: 5,
        eventType: "",
        image: "",
        isActive: true,
        isFeatured: false,
        sortOrder: 0,
      });
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [testimonial, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imagePath = formData.image;

      // Upload image if a new file was selected
      if (selectedFile) {
        const uploadResponse = await uploadService.uploadImage(selectedFile);
        if (uploadResponse.success && uploadResponse.data) {
          imagePath = uploadResponse.data.path;
        }
      }

      const payload = {
        ...formData,
        image: imagePath,
      };

      if (testimonial) {
        await testimonialService.update(testimonial.id, payload);
        toast.success("Testimonial updated successfully");
      } else {
        await testimonialService.create(payload);
        toast.success("Testimonial created successfully");
      }
      onClose(true);
    } catch (error) {
      toast.error(testimonial ? "Failed to update testimonial" : "Failed to create testimonial");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-soft">
        <div className="sticky top-0 glass-dark border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium text-foreground">
            {testimonial ? "Edit" : "Add New"}{" "}
            <span className="italic font-light text-gradient-warm">Testimonial</span>
          </h2>
          <button
            onClick={() => onClose()}
            className="p-2 rounded-lg hover:bg-foreground/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Maria Santos"
              />
            </div>

            {/* Customer Role */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Role / Title
              </label>
              <input
                type="text"
                value={formData.customerRole}
                onChange={(e) =>
                  setFormData({ ...formData, customerRole: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Bride, CEO, Event Coordinator"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Event Type
              </label>
              <input
                type="text"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Wedding, Corporate Event"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= formData.rating
                          ? "fill-primary text-primary"
                          : "text-foreground/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Testimonial Content *
              </label>
              <textarea
                rows={5}
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Write the customer's testimonial..."
              />
            </div>

            {/* Customer Photo */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Customer Photo
              </label>
              
              {imagePreview && (
                <div className="mb-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-full mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setSelectedFile(null);
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-0 right-1/2 translate-x-16 p-2 rounded-lg bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 border border-border transition-colors">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm">
                      {selectedFile ? selectedFile.name : "Choose image file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-foreground/50 mt-2">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="0"
              />
              <p className="text-xs text-foreground/50 mt-1">Lower numbers appear first</p>
            </div>

            {/* Checkboxes */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-foreground/70">
                  Active (visible on website)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData({ ...formData, isFeatured: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-foreground/70">
                  Featured (appears first)
                </span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-6 py-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-foreground text-background hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : testimonial ? "Update Testimonial" : "Create Testimonial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestimonialFormDialog;
