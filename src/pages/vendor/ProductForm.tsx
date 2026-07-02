import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCategoriesQuery } from "@/api/hooks/category.hooks";
import { useAttributesQuery } from "@/api/hooks/attribute.hooks";
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
} from "lucide-react";
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
        "Shop premium wireless headphones with active noise cancellation. Free shipping on orders over $50.",
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
  const { data: categoriesData } = useCategoriesQuery();
  const { data: attributes } = useAttributesQuery();

  const createMutation = useCreateProductMutation();
  const updateMutation = useUpdateProductMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    category: "",
    subcategory: "",
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
  });

  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        sku: product.variants?.[0]?.sku || "",
        category: product.categoryId || "",
        subcategory: product.subCategoryId || "",
        price: String(product.price) || "",
        comparePrice: String(product.discountPrice || "") || "",
        cost: "",
        stock: String(product.quantity) || "",
        lowStockThreshold: 10,
        weight: "",
        weightUnit: "kg",
        status: "active",
        taxable: true,
        shippingRequired: true,
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
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
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (asDraft = false) => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product Name is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid Price is required",
        variant: "destructive",
      });
      return;
    }
    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      price: parseFloat(formData.price),
      discountPrice: formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : undefined,
      quantity: parseInt(formData.stock) || 0,
      sku: formData.sku.trim() || undefined,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      lowStockThreshold: parseInt(formData.lowStockThreshold as any) || 10,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      weightUnit: formData.weightUnit || "kg",
      status: formData.status || "active",
      taxable: formData.taxable,
      shippingRequired: formData.shippingRequired,
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDescription: formData.seoDescription.trim() || undefined,
      seoKeywords: formData.seoKeywords.trim() || undefined,
      image:
        images[0] ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      images: images,
      categoryId: formData.category,
      subCategoryId: formData.subcategory || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: productId!, data: payload });
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        });
        navigate("/products");
      } else {
        const newProduct = await createMutation.mutateAsync(payload);
        toast({
          title: "Product Created",
          description:
            "Product has been created successfully. You can now add variants.",
        });
        navigate(`/products/${newProduct.id}/edit`);
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
          <Button variant="outline" onClick={() => handleSave(true)}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-2" />
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
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter product name"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Write a detailed description of your product..."
                    className="mt-1.5 min-h-[120px]"
                  />
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
                  <label className="cursor-pointer aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setImages((prev) => [
                                ...prev,
                                reader.result as string,
                              ]);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
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
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
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
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
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
                        className="pl-7"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cost">Cost per Item</Label>
                    <div className="relative mt-1.5">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
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
                        className="pl-7"
                      />
                    </div>
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
                    <Label htmlFor="sku">SKU (Stock Keeping Unit)</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) => handleInputChange("sku", e.target.value)}
                      placeholder="SKU-001"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      placeholder="0"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStock">Low Stock Alert</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) =>
                        handleInputChange("lowStockThreshold", e.target.value)
                      }
                      placeholder="10"
                      className="mt-1.5"
                    />
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
                      <Label htmlFor="weight">Weight</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="0.00"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weightUnit">Weight Unit</Label>
                      <Select
                        value={formData.weightUnit}
                        onValueChange={(value) =>
                          handleInputChange("weightUnit", value)
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">Kilograms (kg)</SelectItem>
                          <SelectItem value="g">Grams (g)</SelectItem>
                          <SelectItem value="lb">Pounds (lb)</SelectItem>
                          <SelectItem value="oz">Ounces (oz)</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={(e) =>
                      handleInputChange("seoTitle", e.target.value)
                    }
                    placeholder="Enter SEO title"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoTitle.length}/70 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoDescription">Meta Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) =>
                      handleInputChange("seoDescription", e.target.value)
                    }
                    placeholder="Enter meta description"
                    className="mt-1.5"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.seoDescription.length}/160 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="seoKeywords">Keywords</Label>
                  <Input
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={(e) =>
                      handleInputChange("seoKeywords", e.target.value)
                    }
                    placeholder="Enter keywords separated by commas"
                    className="mt-1.5"
                  />
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Label>Category</Label>
                  <Select
                    value={formData.category || undefined}
                    onValueChange={(value) => {
                      handleInputChange("category", value);
                      handleInputChange("subcategory", "");
                    }}
                  >
                    <SelectTrigger className="mt-1.5">
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
                </div>
                <div>
                  <Label>Subcategory</Label>
                  <Select
                    value={formData.subcategory || undefined}
                    onValueChange={(value) =>
                      handleInputChange("subcategory", value)
                    }
                    disabled={!formData.category}
                  >
                    <SelectTrigger className="mt-1.5">
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
