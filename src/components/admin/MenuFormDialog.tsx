import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { menuService, uploadService, type Menu } from "@/lib/api";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface MenuFormDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
  menu: Menu | null;
}

const MenuFormDialog = ({ open, onClose, menu }: MenuFormDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "wedding",
    isActive: true,
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        description: menu.description || "",
        type: menu.type,
        isActive: menu.isActive,
        image: menu.image || "",
      });
      setImagePreview(menu.image ? `http://localhost:5000${menu.image}` : "");
      setSelectedFile(null);
    } else {
      setFormData({
        name: "",
        description: "",
        type: "wedding",
        isActive: true,
        image: "",
      });
      setImagePreview("");
      setSelectedFile(null);
    }
  }, [menu, open]);

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

    if (!formData.name || !formData.type) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);

      let imagePath = formData.image;

      // Upload image if a new file was selected
      if (selectedFile) {
        const uploadResponse = await uploadService.uploadImage(selectedFile);
        if (uploadResponse.success && uploadResponse.data) {
          imagePath = uploadResponse.data.path;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        isActive: formData.isActive,
        image: imagePath || undefined,
      };

      if (menu) {
        await menuService.update(menu.id, payload);
        toast.success("Event type updated successfully");
      } else {
        await menuService.create(payload);
        toast.success("Event type created successfully");
      }

      onClose(true);
    } catch (error) {
      console.error("Menu form error:", error);
      toast.error(menu ? "Failed to update event type" : "Failed to create event type");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="font-display text-2xl">
            {menu ? "Edit Event Type" : "Create New Event Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto flex-1 pr-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Type Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Wedding, Corporate Event"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this event type"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="type">Type Identifier *</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              >
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="private">Private</option>
                <option value="birthday">Birthday</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <Label htmlFor="image">Event Type Image</Label>
              
              {imagePreview && (
                <div className="mb-3 relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImagePreview("");
                      setSelectedFile(null);
                      setFormData({ ...formData, image: "" });
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer relative z-50">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                      {selectedFile ? selectedFile.name : "Choose image file"}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="menu-image-upload"
                  />
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this event type to customers
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

          <div className="flex gap-3 justify-end pt-4 border-t flex-shrink-0">
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : menu ? "Update Event Type" : "Create Event Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MenuFormDialog;
