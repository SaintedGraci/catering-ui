import { useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { dishService, uploadService, type Dish } from "@/lib/api";
import { toast } from "sonner";

interface DishFormDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  dish: Dish | null;
}

const DishFormDialog = ({ open, onClose, dish }: DishFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "main_course",
    image: "",
    isAvailable: true,
    servingSize: "",
    preparationTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name,
        description: dish.description || "",
        category: dish.category,
        image: dish.image || "",
        isAvailable: dish.isAvailable,
        servingSize: dish.servingSize || "",
        preparationTime: dish.preparationTime?.toString() || "",
      });
      // Cloudinary URLs are already full URLs, local uploads start with /uploads
      setImagePreview(dish.image ? (dish.image.startsWith('http') ? dish.image : `${import.meta.env.VITE_API_URL}${dish.image}`) : "");
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "main_course",
        image: "",
        isAvailable: true,
        servingSize: "",
        preparationTime: "",
      });
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [dish, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
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
        preparationTime: formData.preparationTime
          ? parseInt(formData.preparationTime)
          : undefined,
      };

      if (dish) {
        await dishService.update(dish.id, payload);
        toast.success("Dish updated successfully");
      } else {
        await dishService.create(payload);
        toast.success("Dish created successfully");
      }
      onClose(true);
    } catch (error) {
      toast.error(dish ? "Failed to update dish" : "Failed to create dish");
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
            {dish ? "Edit" : "Add New"}{" "}
            <span className="italic font-light text-gradient-warm">Dish</span>
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
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Dish Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Lechon Kawali"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="appetizer">Appetizer</option>
                <option value="main_course">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="beverage">Beverage</option>
                <option value="side_dish">Side Dish</option>
              </select>
            </div>

            {/* Serving Size */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Serving Size
              </label>
              <input
                type="text"
                value={formData.servingSize}
                onChange={(e) =>
                  setFormData({ ...formData, servingSize: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Serves 10-15 people"
              />
            </div>

            {/* Preparation Time */}
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Prep Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.preparationTime}
                onChange={(e) =>
                  setFormData({ ...formData, preparationTime: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="30"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Describe the dish..."
              />
            </div>

            {/* Image URL */}
            <div className="md:col-span-2">
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-foreground/70 mb-2">
                Dish Image
              </label>
              
              {imagePreview && (
                <div className="mb-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setSelectedFile(null);
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-destructive/90 hover:bg-destructive text-destructive-foreground"
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
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            {/* Availability */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAvailable: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
                />
                <span className="font-mono text-xs tracking-[0.2em] uppercase text-foreground/70">
                  Available for ordering
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
              {isSubmitting ? "Saving..." : dish ? "Update Dish" : "Create Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishFormDialog;
