import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategoriesQuery } from "@/api/hooks/category.hooks";
import { useAttributesQuery } from "@/api/hooks/attribute.hooks";
import { useBrandsQuery } from "@/api/hooks/brand.hooks";
import {
  useProductDetailQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/api/hooks/product.hooks";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Package,
  Truck,
  Search as SearchIcon,
  Info,
  IndianRupee,
  Loader2,
} from "lucide-react";
import { createProductSchema } from "@/validations/product.validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/imageCompressor";

const existingProducts: Record<string, any> = {
  "1": {
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium wireless headphones with noise cancellation technology. Experience crystal-clear audio with deep bass and exceptional comfort for extended listening sessions.",
    sku: "WBH-001",
    category: "electronics",
    subcategory: "audio",
    price: 129.99,
    comparePrice: 159.99,
    cost: 65.0,
    stock: 145,
    lowStockThreshold: 10,
    weight: 0.35,
    weightUnit: "kg",
    status: "active",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    ],
    variants: [
      { id: 1, name: "Black", sku: "WBH-001-BLK", stock: 80, price: 129.99 },
      { id: 2, name: "White", sku: "WBH-001-WHT", stock: 65, price: 129.99 },
    ],
    seo: {
      title: "Wireless Bluetooth Headphones - Premium Sound Quality",
      description:
        "Shop premium wireless headphones with active noise cancellation. Free shipping on orders over ₹50.",
      keywords: "wireless headphones, bluetooth headphones, noise cancellation",
    },
    taxable: true,
    shippingRequired: true,
  },
};

export default function ProductForm() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!productId;

  const { data: product, isLoading: isLoadingProduct } = useProductDetailQuery(
    productId || "",
    isEditing,
  );
  const { data: categoriesData } = useCategoriesQuery({ limit: 1000 });
  const { data: attributes } = useAttributesQuery();
  const { data: brandsData } = useBrandsQuery({ limit: 1000 });

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    subcategory: "",
    brandId: "",
    price: "",
    comparePrice: "",
    cost: "",
    stock: "",
    lowStockThreshold: 10,
    weight: "",
    weightUnit: "kg",
    status: "draft",
    taxable: true,
    shippingRequired: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    countryOfOrigin: "India",
    idealFor: "",
    material: "",
    packOf: "1",
    productType: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (errors.image || errors.images) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.image;
        delete next.images;
        return next;
      });
    }
  }, [images]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || product.variants?.[0]?.sku || "",
        category: product.categoryId || "",
        subcategory: product.subCategoryId || "",
        brandId: product.brandId || "",
        price: String(product.price) || "",
        comparePrice: String(product.discountPrice || "") || "",
        cost: product.cost ? String(product.cost) : "",
        stock: String(product.quantity) || "",
        lowStockThreshold: product.lowStockThreshold ?? 10,
        weight: product.weight ? String(product.weight) : "",
        weightUnit: product.weightUnit || "kg",
        status: product.status || "draft",
        taxable: product.taxable ?? true,
        shippingRequired: product.shippingRequired ?? true,
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
        seoKeywords: product.seoKeywords || "",
        countryOfOrigin: product.countryOfOrigin || "India",
        idealFor: product.idealFor || "",
        material: product.material || "",
        packOf: String(product.packOf ?? "1"),
        productType: product.productType || "",
      });
      setImages(
        Array.isArray(product.images)
          ? product.images
          : typeof product.images === "string"
            ? JSON.parse(product.images)
            : [],
      );
    }
  }, [product]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorKeysToClear = [field];
    if (field === "category") errorKeysToClear.push("categoryId");
    if (field === "subcategory") errorKeysToClear.push("subCategoryId");
    if (field === "comparePrice") errorKeysToClear.push("discountPrice");
    if (field === "stock") errorKeysToClear.push("quantity");

    setErrors((prev) => {
      const next = { ...prev };
      errorKeysToClear.forEach((k) => delete next[k]);
      return next;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (asDraft = false) => {
    const parseNumber = (val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const parseIntNumber = (val: any) => {
      if (val === "" || val === null || val === undefined) return undefined;
      const num = parseInt(val, 10);
      return isNaN(num) ? undefined : num;
    };

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseNumber(formData.price),
      discountPrice: parseNumber(formData.comparePrice),
      quantity: parseIntNumber(formData.stock) ?? 0,
      sku: formData.sku.trim() || undefined,
      cost: parseNumber(formData.cost),
      lowStockThreshold: parseIntNumber(formData.lowStockThreshold) ?? 10,
      weight: parseNumber(formData.weight),
      weightUnit: formData.weightUnit || "kg",
      status: formData.status || "active",
      taxable: formData.taxable,
      shippingRequired: formData.shippingRequired,
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDescription: formData.seoDescription.trim() || undefined,
      seoKeywords: formData.seoKeywords.trim() || undefined,
      image: images[0] || undefined,
      images: images,
      categoryId: formData.category || undefined,
      subCategoryId: formData.subcategory || undefined,
      brandId: formData.brandId || undefined,
      countryOfOrigin: formData.countryOfOrigin.trim() || "India",
      idealFor: formData.idealFor.trim() || undefined,
      material: formData.material.trim() || undefined,
      packOf: parseIntNumber(formData.packOf) ?? 1,
      productType: formData.productType.trim() || undefined,
    };

    setErrors({});
    const validationResult = createProductSchema.safeParse(payload);
    if (!validationResult.success) {
      const newErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === "string") {
          newErrors[path] = issue.message;
        }
      });
      setErrors(newErrors);

      const errorMsg = validationResult.error.issues[0]?.message || "Validation failed";
      toast({
        title: "Validation Error",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    const validatedData = validationResult.data;

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: productId!, data: validatedData });
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
        navigate("/products");
      } else {
        await createMutation.mutateAsync(validatedData);
        toast({
          title: "Product Created",
          description: "Product has been created successfully.",
        });
        navigate("/products");
      }
    } catch (err: any) {
      toast({
        title: "Error Saving Product",
        description:
          err.message || "Something went wrong while saving the product.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/products")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">
              {isEditing ? "Edit Product" : "Add Product"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing
                ? "Update product information"
                : "Create a new product listing"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={createMutation.isPending || updateMutation.isPending}
          >
            {createMutation.isPending || (isEditing && updateMutation.isPending) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Add the basic details about your product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className={cn(errors.name && "text-destructive")}>Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className={cn("mt-1.5", errors.name && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.name && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description" className={cn(errors.description && "text-destructive")}>Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Write a detailed description of your product..."
                    className={cn("mt-1.5 min-h-[120px]", errors.description && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.description && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Specifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
                <CardDescription>
                  Add detailed specifications for this product
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="countryOfOrigin">Country Of Origin</Label>
                    <Input
                      id="countryOfOrigin"
                      value={formData.countryOfOrigin}
                      onChange={(e) => handleInputChange("countryOfOrigin", e.target.value)}
                      placeholder="e.g. India"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="idealFor">Ideal For</Label>
                    <Select
                      value={formData.idealFor}
                      onValueChange={(value) => handleInputChange("idealFor", value)}
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select who this is for" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Women">Women</SelectItem>
                        <SelectItem value="Men">Men</SelectItem>
                        <SelectItem value="Unisex">Unisex</SelectItem>
                        <SelectItem value="Kids">Kids</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => handleInputChange("material", e.target.value)}
                      placeholder="e.g. Gold Tone Metal"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packOf">Pack Of</Label>
                    <Input
                      id="packOf"
                      type="number"
                      min="1"
                      value={formData.packOf}
                      onChange={(e) => handleInputChange("packOf", e.target.value)}
                      placeholder="1"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="productType">Product Type</Label>
                    <Input
                      id="productType"
                      value={formData.productType}
                      onChange={(e) => handleInputChange("productType", e.target.value)}
                      placeholder="e.g. Drop Earrings"
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Media */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Media
                </CardTitle>
                <CardDescription>
                  Add product images (drag to reorder)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ))}
                  <label className={cn(
                    "cursor-pointer aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors",
                    isUploadingImage && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}>
                    {isUploadingImage ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                    <span className="text-xs">{isUploadingImage ? "Compressing..." : "Add Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingImage}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setIsUploadingImage(true);
                          try {
                            const compressedUrl = await compressImage(file);
                            setImages((prev) => [
                              ...prev,
                              compressedUrl,
                            ]);
                          } catch (err: any) {
                            console.error("Failed to compress image:", err);
                            toast({
                              title: "Upload Error",
                              description: "Failed to process the uploaded image.",
                              variant: "destructive",
                            });
                          } finally {
                            setIsUploadingImage(false);
                          }
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                {errors.image && (
                  <p className="text-sm font-medium text-destructive mt-2">{errors.image}</p>
                )}
                {!errors.image && errors.images && (
                  <p className="text-sm font-medium text-destructive mt-2">{errors.images}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className={cn(errors.price && "text-destructive")}>Price *</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange("price", e.target.value)
                        }
                        placeholder="0.00"
                        className={cn("pl-7", errors.price && "border-destructive focus-visible:ring-destructive")}
                      />
                    </div>
                    {errors.price && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.price}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="comparePrice" className={cn(errors.discountPrice && "text-destructive")}>Compare at Price</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="comparePrice"
                        type="number"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={(e) =>
                          handleInputChange("comparePrice", e.target.value)
                        }
                        placeholder="0.00"
                        className={cn("pl-7", errors.discountPrice && "border-destructive focus-visible:ring-destructive")}
                      />
                    </div>
                    {errors.discountPrice && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.discountPrice}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cost" className={cn(errors.cost && "text-destructive")}>Cost per Item</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) =>
                          handleInputChange("cost", e.target.value)
                        }
                        placeholder="0.00"
                        className={cn("pl-7", errors.cost && "border-destructive focus-visible:ring-destructive")}
                      />
                    </div>
                    {errors.cost && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.cost}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.taxable}
                      onCheckedChange={(checked) =>
                        handleInputChange("taxable", checked)
                      }
                    />
                    <Label>Charge tax on this product</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="sku" className={cn(errors.sku && "text-destructive")}>SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="SKU-001"
                      className={cn("mt-1.5", errors.sku && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.sku && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.sku}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stock" className={cn(errors.quantity && "text-destructive")}>Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      placeholder="0"
                      className={cn("mt-1.5", errors.quantity && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.quantity && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.quantity}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lowStock" className={cn(errors.lowStockThreshold && "text-destructive")}>Low Stock Alert</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        handleInputChange("lowStockThreshold", e.target.value)
                      }
                      placeholder="10"
                      className={cn("mt-1.5", errors.lowStockThreshold && "border-destructive focus-visible:ring-destructive")}
                    />
                    {errors.lowStockThreshold && (
                      <p className="text-sm font-medium text-destructive mt-1">{errors.lowStockThreshold}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.shippingRequired}
                    onCheckedChange={(checked) =>
                      handleInputChange("shippingRequired", checked)
                    }
                  />
                  <Label>This product requires shipping</Label>
                </div>
                {formData.shippingRequired && (
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <Label htmlFor="weight" className={cn(errors.weight && "text-destructive")}>Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="0.00"
                        className={cn("mt-1.5", errors.weight && "border-destructive focus-visible:ring-destructive")}
                      />
                      {errors.weight && (
                        <p className="text-sm font-medium text-destructive mt-1">{errors.weight}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="weightUnit" className={cn(errors.weightUnit && "text-destructive")}>Weight Unit</Label>
                      <Select
                        value={formData.weightUnit}
                        onValueChange={(value) =>
                          handleInputChange("weightUnit", value)
                        }
                      >
                        <SelectTrigger className={cn("mt-1.5", errors.weightUnit && "border-destructive focus:ring-destructive")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.weightUnit && (
                        <p className="text-sm font-medium text-destructive mt-1">{errors.weightUnit}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* SEO */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SearchIcon className="w-5 h-5" />
                  Search Engine Optimization
                </CardTitle>
                <CardDescription>
                  Optimize your product for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seoTitle" className={cn(errors.seoTitle && "text-destructive")}>SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      handleInputChange("seoTitle", e.target.value)
                    }
                    placeholder="Enter SEO title"
                    className={cn("mt-1.5", errors.seoTitle && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.seoTitle && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.seoTitle}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoTitle.length}/70 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoDescription" className={cn(errors.seoDescription && "text-destructive")}>Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      handleInputChange("seoDescription", e.target.value)
                    }
                    placeholder="Enter meta description"
                    className={cn("mt-1.5", errors.seoDescription && "border-destructive focus-visible:ring-destructive")}
                    rows={3}
                  />
                  {errors.seoDescription && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.seoDescription}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoKeywords" className={cn(errors.seoKeywords && "text-destructive")}>Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      handleInputChange("seoKeywords", e.target.value)
                    }
                    placeholder="Enter keywords separated by commas"
                    className={cn("mt-1.5", errors.seoKeywords && "border-destructive focus-visible:ring-destructive")}
                  />
                  {errors.seoKeywords && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.seoKeywords}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className={cn(errors.status && "border-destructive focus:ring-destructive")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm font-medium text-destructive mt-1">{errors.status}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className={cn(errors.categoryId && "text-destructive")}>Category</Label>
                  <Select
                    value={formData.category || undefined}
                    onValueChange={(value) => {
                      handleInputChange("category", value);
                      handleInputChange("subcategory", "");
                    }}
                  >
                    <SelectTrigger className={cn("mt-1.5", errors.categoryId && "border-destructive focus:ring-destructive")}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.categoryId}</p>
                  )}
                </div>
                <div>
                  <Label className={cn(errors.subCategoryId && "text-destructive")}>Subcategory</Label>
                  <Select
                    value={formData.subcategory || undefined}
                    onValueChange={(value) =>
                      handleInputChange("subcategory", value)
                    }
                    disabled={!formData.category}
                  >
                    <SelectTrigger className={cn("mt-1.5", errors.subCategoryId && "border-destructive focus:ring-destructive")}>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const subs = categoriesData?.categories?.find(
                          (cat) => cat.id === formData.category,
                        )?.subCategories;
                        if (!subs || subs.length === 0) {
                          return (
                            <SelectItem value="none" disabled>
                              No subcategories
                            </SelectItem>
                          );
                        }
                        return subs.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                  {errors.subCategoryId && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.subCategoryId}</p>
                  )}
                </div>
                <div>
                  <Label className={cn(errors.brandId && "text-destructive")}>Brand</Label>
                  <Select
                    value={formData.brandId || undefined}
                    onValueChange={(value) =>
                      handleInputChange("brandId", value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger className={cn("mt-1.5", errors.brandId && "border-destructive focus:ring-destructive")}>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No brand</SelectItem>
                      {brandsData?.brands?.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brandId && (
                    <p className="text-sm font-medium text-destructive mt-1">{errors.brandId}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Tips for better listings</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Use high-quality images</li>
                      <li>• Write detailed descriptions</li>
                      <li>• Set competitive prices</li>
                      <li>• Add relevant keywords</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
