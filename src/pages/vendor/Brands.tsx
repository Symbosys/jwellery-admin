import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Upload,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Package,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  useBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  DBBrand,
} from "@/api/hooks/brand.hooks";

const BRAND_PRESETS = [
  { name: "Optimum Nutrition", url: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=400&h=400&fit=crop" },
  { name: "MuscleTech", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=400&fit=crop" },
  { name: "Dymatize", url: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&h=400&fit=crop" },
  { name: "MyProtein", url: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=400&fit=crop" }
];

export default function Brands() {
  const { toast } = useToast();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Hooks Query
  const { data: brandsData, isLoading } = useBrandsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
  });

  const brandsList = brandsData?.brands || [];
  const pagination = brandsData?.pagination;

  // Mutations
  const createBrandMutation = useCreateBrandMutation();
  const updateBrandMutation = useUpdateBrandMutation();
  const deleteBrandMutation = useDeleteBrandMutation();

  // Dialog & Form States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [brandDesc, setBrandDesc] = useState("");
  const [brandWebsite, setBrandWebsite] = useState("");
  const [brandImage, setBrandImage] = useState("");
  const [brandFile, setBrandFile] = useState<File | null>(null);
  const [brandImageMode, setBrandImageMode] = useState<"url" | "upload" | "preset">("preset");
  const [brandActive, setBrandActive] = useState(true);

  // Edit states
  const [editBrand, setEditBrand] = useState<DBBrand | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editImageMode, setEditImageMode] = useState<"url" | "upload" | "preset">("preset");
  const [editActive, setEditActive] = useState(true);

  // Form Handlers
  const handleCreateBrand = async () => {
    if (!brandName.trim()) {
      toast({
        title: "Validation Error",
        description: "Brand Name is required",
        variant: "destructive",
      });
      return;
    }

    const isImageMissing = 
      (brandImageMode === "upload" && !brandFile) || 
      (brandImageMode !== "upload" && !brandImage.trim());

    if (isImageMissing) {
      toast({
        title: "Validation Error",
        description: "Brand Logo is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (brandImageMode === "upload" && brandFile) {
        const formData = new FormData();
        formData.append("name", brandName.trim());
        if (brandDesc.trim()) formData.append("description", brandDesc.trim());
        if (brandWebsite.trim()) formData.append("website", brandWebsite.trim());
        formData.append("isActive", String(brandActive));
        formData.append("logo", brandFile);

        await createBrandMutation.mutateAsync(formData);
      } else {
        await createBrandMutation.mutateAsync({
          name: brandName.trim(),
          description: brandDesc.trim() || undefined,
          website: brandWebsite.trim() || undefined,
          logo: brandImageMode === "preset" ? brandImage : brandImage.trim() || undefined,
          isActive: brandActive,
        });
      }

      toast({
        title: "Brand Created",
        description: "Brand has been successfully created.",
      });

      // Reset
      setBrandName("");
      setBrandDesc("");
      setBrandWebsite("");
      setBrandImage("");
      setBrandFile(null);
      setBrandImageMode("preset");
      setBrandActive(true);
      setIsAddOpen(false);
    } catch (err: any) {
      toast({
        title: "Error Creating Brand",
        description: err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBrand = async () => {
    if (!editBrand) return;
    if (!editName.trim()) {
      toast({
        title: "Validation Error",
        description: "Brand Name is required",
        variant: "destructive",
      });
      return;
    }

    const isImageMissing = 
      (editImageMode === "upload" && !editFile) || 
      (editImageMode !== "upload" && !editImage.trim());

    if (isImageMissing) {
      toast({
        title: "Validation Error",
        description: "Brand Logo is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editImageMode === "upload" && editFile) {
        const formData = new FormData();
        formData.append("name", editName.trim());
        formData.append("description", editDesc.trim());
        formData.append("website", editWebsite.trim());
        formData.append("isActive", String(editActive));
        formData.append("logo", editFile);

        await updateBrandMutation.mutateAsync({
          id: editBrand.id,
          data: formData,
        });
      } else {
        await updateBrandMutation.mutateAsync({
          id: editBrand.id,
          data: {
            name: editName.trim(),
            description: editDesc.trim(),
            website: editWebsite.trim() || null,
            logo: editImageMode === "preset" ? editImage : editImage.trim() || null,
            isActive: editActive,
          },
        });
      }

      toast({
        title: "Brand Updated",
        description: "Brand has been successfully updated.",
      });

      setEditBrand(null);
    } catch (err: any) {
      toast({
        title: "Error Updating Brand",
        description: err.response?.data?.message || err.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBrand = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this brand?")) return;

    try {
      await deleteBrandMutation.mutateAsync(id);
      toast({
        title: "Brand Deleted",
        description: "Brand has been deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error Deleting Brand",
        description: err.response?.data?.message || err.message || "Cannot delete brand containing products.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (brand: DBBrand) => {
    setEditBrand(brand);
    setEditName(brand.name);
    setEditDesc(brand.description || "");
    setEditWebsite(brand.website || "");
    setEditImage(brand.logo || "");
    setEditActive(brand.isActive);
    setEditFile(null);
    setEditImageMode(brand.logo ? "url" : "preset");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage your product brands, logos, and external websites
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
        </Button>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              size="sm"
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              size="sm"
            >
              Active Only
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              size="sm"
            >
              Inactive Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brands List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : brandsList.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-4">
            <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-semibold text-lg">No Brands Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Get started by adding your first product brand to classify your catalog.
            </p>
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brandsList.map((brand) => (
            <motion.div
              layout
              key={brand.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-lg border border-border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "";
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-bold text-muted-foreground">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg truncate">{brand.name}</h3>
                        {brand.isActive ? (
                          <span className="flex items-center text-xs text-green-500 font-medium">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center text-xs text-muted-foreground font-medium">
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate max-w-xs">
                        {brand.description || "No description provided."}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        {brand.website && (
                          <a
                            href={brand.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <Globe className="w-3 h-3" />
                            Website
                          </a>
                        )}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="w-3.5 h-3.5" />
                          {brand._count?.products || 0} Products
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(brand)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Brand
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteBrand(brand.id)}
                        className="text-destructive focus:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Brand
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Brand Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand-name">Brand Name *</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Optimum Nutrition"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="brand-desc">Description</Label>
              <Textarea
                id="brand-desc"
                value={brandDesc}
                onChange={(e) => setBrandDesc(e.target.value)}
                placeholder="Brief information about this brand"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand-web">Website URL</Label>
              <Input
                id="brand-web"
                value={brandWebsite}
                onChange={(e) => setBrandWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* Logo image selector */}
            <div className="space-y-3">
              <Label>Logo Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={brandImageMode === "preset" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBrandImageMode("preset")}
                >
                  Presets
                </Button>
                <Button
                  type="button"
                  variant={brandImageMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBrandImageMode("url")}
                >
                  Logo URL
                </Button>
                <Button
                  type="button"
                  variant={brandImageMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBrandImageMode("upload")}
                >
                  Upload File
                </Button>
              </div>

              {brandImageMode === "preset" && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {BRAND_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBrandImage(preset.url)}
                      className={cn(
                        "aspect-square rounded border-2 border-border overflow-hidden relative transition-all",
                        brandImage === preset.url ? "border-primary scale-95" : "hover:border-primary/50"
                      )}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {brandImageMode === "url" && (
                <Input
                  value={brandImage}
                  onChange={(e) => setBrandImage(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              )}

              {brandImageMode === "upload" && (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="brand-logo-file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setBrandFile(e.target.files[0]);
                    }}
                  />
                  <Label htmlFor="brand-logo-file" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    <span className="block text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  </Label>
                  {brandFile && (
                    <p className="mt-2 text-xs text-muted-foreground font-medium">
                      Selected: {brandFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Allow products to be tagged with this brand
                </p>
              </div>
              <Switch checked={brandActive} onCheckedChange={setBrandActive} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)} disabled={createBrandMutation.isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateBrand} disabled={createBrandMutation.isPending}>
                {createBrandMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Brand
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Brand Dialog */}
      <Dialog open={!!editBrand} onOpenChange={(open) => !open && setEditBrand(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name">Brand Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Optimum Nutrition"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Description</Label>
              <Textarea
                id="edit-desc"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                placeholder="Brief information about this brand"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-web">Website URL</Label>
              <Input
                id="edit-web"
                value={editWebsite}
                onChange={(e) => setEditWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {/* Logo image selector */}
            <div className="space-y-3">
              <Label>Logo Source</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={editImageMode === "preset" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditImageMode("preset")}
                >
                  Presets
                </Button>
                <Button
                  type="button"
                  variant={editImageMode === "url" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditImageMode("url")}
                >
                  Logo URL
                </Button>
                <Button
                  type="button"
                  variant={editImageMode === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEditImageMode("upload")}
                >
                  Upload File
                </Button>
              </div>

              {editImageMode === "preset" && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  {BRAND_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditImage(preset.url)}
                      className={cn(
                        "aspect-square rounded border-2 border-border overflow-hidden relative transition-all",
                        editImage === preset.url ? "border-primary scale-95" : "hover:border-primary/50"
                      )}
                    >
                      <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {editImageMode === "url" && (
                <Input
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="mt-1"
                />
              )}

              {editImageMode === "upload" && (
                <div className="border border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="edit-logo-file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setEditFile(e.target.files[0]);
                    }}
                  />
                  <Label htmlFor="edit-logo-file" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    <span className="block text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</span>
                  </Label>
                  {editFile && (
                    <p className="mt-2 text-xs text-muted-foreground font-medium">
                      Selected: {editFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-muted-foreground">
                  Allow products to be tagged with this brand
                </p>
              </div>
              <Switch checked={editActive} onCheckedChange={setEditActive} />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => setEditBrand(null)} disabled={updateBrandMutation.isPending}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateBrand} disabled={updateBrandMutation.isPending}>
                {updateBrandMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
