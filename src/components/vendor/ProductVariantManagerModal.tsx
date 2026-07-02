import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAttributesQuery } from '@/api/hooks/attribute.hooks';
import { useUpdateProductMutation } from '@/api/hooks/product.hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VariantInput {
  sku: string;
  price: string;
  discountPrice: string;
  quantity: string;
  image: string;
  attributeValues: string[]; // array of AttributeValue IDs
}

interface ProductVariantManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  existingVariants: any[]; // The existing variants from the product query
}

export function ProductVariantManagerModal({ 
  open, 
  onOpenChange, 
  productId,
  existingVariants
}: ProductVariantManagerModalProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateProductMutation();
  const { data: globalAttributes } = useAttributesQuery();
  
  // Local state for all variants (so we can save them all at once)
  const [variants, setVariants] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      // Map existing variants to the format we need when saving
      const mapped = existingVariants.map(v => ({
        id: v.id, // Keep ID for rendering, though backend replaces it
        sku: v.sku || '',
        price: Number(v.price) || 0,
        discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
        quantity: v.quantity || 0,
        image: v.image || '',
        attributeValues: v.attributeValues?.map((av: any) => av.id) || []
      }));
      setVariants(mapped);
    }
  }, [open, existingVariants]);

  // State for the NEW variant form
  const [newVariant, setNewVariant] = useState<VariantInput>({
    sku: '',
    price: '',
    discountPrice: '',
    quantity: '',
    image: '',
    attributeValues: []
  });

  const handleAddVariant = () => {
    if (!newVariant.price || !newVariant.quantity) {
      toast({ title: 'Validation Error', description: 'Price and Quantity are required.', variant: 'destructive' });
      return;
    }

    const variantToAdd = {
      sku: newVariant.sku.trim() || undefined,
      price: parseFloat(newVariant.price),
      discountPrice: newVariant.discountPrice ? parseFloat(newVariant.discountPrice) : undefined,
      quantity: parseInt(newVariant.quantity, 10),
      image: newVariant.image.trim() || undefined,
      attributeValues: newVariant.attributeValues
    };

    setVariants(prev => [...prev, variantToAdd]);
    
    // Reset form
    setNewVariant({
      sku: '',
      price: '',
      discountPrice: '',
      quantity: '',
      image: '',
      attributeValues: []
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const toggleAttributeValue = (valueId: string) => {
    setNewVariant(prev => {
      const current = prev.attributeValues;
      if (current.includes(valueId)) {
        return { ...prev, attributeValues: current.filter(id => id !== valueId) };
      }
      return { ...prev, attributeValues: [...current, valueId] };
    });
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        id: productId,
        data: {
          variants: variants.map(v => ({
            sku: v.sku || undefined,
            price: Number(v.price),
            discountPrice: v.discountPrice ? Number(v.discountPrice) : undefined,
            quantity: Number(v.quantity),
            image: v.image || undefined,
            attributeValues: v.attributeValues || []
          }))
        }
      });
      toast({ title: 'Success', description: 'Product variants updated successfully.' });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update variants', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Manage Product Variants
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          {/* Add New Variant Section */}
          <Card className="p-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-4">Add New Variant</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>SKU</Label>
                <Input 
                  placeholder="e.g. TSHIRT-RED-M" 
                  value={newVariant.sku}
                  onChange={e => setNewVariant(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00" 
                  value={newVariant.price}
                  onChange={e => setNewVariant(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Price</Label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00" 
                  value={newVariant.discountPrice}
                  onChange={e => setNewVariant(prev => ({ ...prev, discountPrice: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input 
                  type="number"
                  min="0"
                  placeholder="0" 
                  value={newVariant.quantity}
                  onChange={e => setNewVariant(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <Label>Select Attributes for this Variant</Label>
              {(!globalAttributes || globalAttributes.length === 0) ? (
                <p className="text-sm text-muted-foreground italic">No global attributes found. You can create them in the Global Attributes manager.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {globalAttributes.map(attr => (
                    <div key={attr.id} className="border p-3 rounded-md bg-background">
                      <Label className="text-xs text-muted-foreground mb-2 block">{attr.name}</Label>
                      <Select 
                        value={newVariant.attributeValues.find(id => attr.values?.some(v => v.id === id)) || ""}
                        onValueChange={(val) => {
                          // Remove any existing value for this attribute first
                          const otherAttrValues = newVariant.attributeValues.filter(id => !attr.values?.some(v => v.id === id));
                          if (val !== "none") {
                            setNewVariant(prev => ({ ...prev, attributeValues: [...otherAttrValues, val] }));
                          } else {
                            setNewVariant(prev => ({ ...prev, attributeValues: otherAttrValues }));
                          }
                        }}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder={`Select ${attr.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {attr.values?.map(val => (
                            <SelectItem key={val.id} value={val.id}>{val.value}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={handleAddVariant} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Variant
            </Button>
          </Card>

          {/* List Variants Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Current Variants ({variants.length})</h3>
            {variants.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
                No variants found for this product.
              </div>
            ) : (
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 border rounded-lg bg-card gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground">SKU</p>
                        <p className="font-medium text-sm">{variant.sku || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-medium text-sm">${Number(variant.price).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Stock</p>
                        <p className="font-medium text-sm">{variant.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Attributes</p>
                        <p className="font-medium text-sm">
                          {variant.attributeValues.length > 0 ? `${variant.attributeValues.length} selected` : 'None'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveVariant(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
