import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, ChevronDown, ChevronUp, Image as ImageIcon, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useAttributesQuery,
  useCreateAttributeMutation,
  useAddAttributeValuesMutation,
  useUpdateAttributeValueMutation,
  useDeleteAttributeMutation,
  useDeleteAttributeValueMutation,
} from '@/api/hooks/attribute.hooks';
import { Card } from '@/components/ui/card';
import { compressImage } from '@/lib/imageCompressor';

interface AttributeManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttributeManagerModal({ open, onOpenChange }: AttributeManagerModalProps) {
  const { toast } = useToast();
  const { data: attributes, isLoading } = useAttributesQuery();
  const createAttribute = useCreateAttributeMutation();
  const addValues = useAddAttributeValuesMutation();
  const updateValue = useUpdateAttributeValueMutation();
  const deleteAttribute = useDeleteAttributeMutation();
  const deleteValue = useDeleteAttributeValueMutation();

  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValues, setNewAttrValues] = useState(''); // comma separated
  
  // State for single value input per attribute
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});
  const [newValueImageInputs, setNewValueImageInputs] = useState<Record<string, string>>({});
  const [isCompressingNewValueImg, setIsCompressingNewValueImg] = useState<Record<string, boolean>>({});

  // Expanded attributes state (default to expanded)
  const [collapsedAttrs, setCollapsedAttrs] = useState<Record<string, boolean>>({});
  const [uploadingValueId, setUploadingValueId] = useState<string | null>(null);

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim()) {
      toast({ title: 'Validation Error', description: 'Attribute name is required', variant: 'destructive' });
      return;
    }
    
    try {
      const values = newAttrValues
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== '');
        
      await createAttribute.mutateAsync({ name: newAttrName.trim(), values: values.length > 0 ? values : undefined });
      
      setNewAttrName('');
      setNewAttrValues('');
      toast({ title: 'Success', description: 'Attribute created successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to create attribute', variant: 'destructive' });
    }
  };

  const handleAddValue = async (attributeId: string) => {
    const valText = newValueInputs[attributeId]?.trim();
    const valImage = newValueImageInputs[attributeId];

    if (!valText) return;

    try {
      // Pass structured value item with optional image
      await addValues.mutateAsync({
        id: attributeId,
        values: [{ value: valText, image: valImage || null }]
      });

      setNewValueInputs(prev => ({ ...prev, [attributeId]: '' }));
      setNewValueImageInputs(prev => ({ ...prev, [attributeId]: '' }));
      toast({ title: 'Success', description: `Value "${valText}" added successfully` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to add value', variant: 'destructive' });
    }
  };

  const handleNewValueImageSelected = async (attributeId: string, file: File) => {
    setIsCompressingNewValueImg(prev => ({ ...prev, [attributeId]: true }));
    try {
      const base64 = await compressImage(file);
      setNewValueImageInputs(prev => ({ ...prev, [attributeId]: base64 }));
    } catch (err: any) {
      toast({ title: 'Image Error', description: 'Failed to process image', variant: 'destructive' });
    } finally {
      setIsCompressingNewValueImg(prev => ({ ...prev, [attributeId]: false }));
    }
  };

  const handleValueImageUpload = async (valueId: string, file: File) => {
    setUploadingValueId(valueId);
    try {
      const base64Image = await compressImage(file);
      await updateValue.mutateAsync({ valueId, image: base64Image });
      toast({ title: 'Success', description: 'Value image updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to upload value image', variant: 'destructive' });
    } finally {
      setUploadingValueId(null);
    }
  };

  const handleRemoveValueImage = async (valueId: string) => {
    setUploadingValueId(valueId);
    try {
      await updateValue.mutateAsync({ valueId, image: null });
      toast({ title: 'Success', description: 'Value image removed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to remove value image', variant: 'destructive' });
    } finally {
      setUploadingValueId(null);
    }
  };

  const handleDeleteAttribute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attribute and all its values?')) return;
    
    try {
      await deleteAttribute.mutateAsync(id);
      toast({ title: 'Success', description: 'Attribute deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to delete attribute', variant: 'destructive' });
    }
  };

  const handleDeleteValue = async (valueId: string) => {
    if (!confirm('Are you sure you want to delete this value?')) return;
    
    try {
      await deleteValue.mutateAsync(valueId);
      toast({ title: 'Success', description: 'Value deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to delete value', variant: 'destructive' });
    }
  };

  const toggleExpand = (id: string) => {
    setCollapsedAttrs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5 text-primary" />
            Manage Product Attributes & Value Images
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          {/* Create New Attribute */}
          <Card className="p-4 bg-muted/20 border-dashed">
            <h3 className="text-sm font-semibold mb-3">Create New Attribute</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input 
                  placeholder="Attribute Name (e.g. Color, Size, Material)" 
                  value={newAttrName} 
                  onChange={e => setNewAttrName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="Initial Values (e.g. Red, Blue, Black)" 
                  value={newAttrValues} 
                  onChange={e => setNewAttrValues(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateAttribute} disabled={createAttribute.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Create Attribute
              </Button>
            </div>
          </Card>

          {/* List Attributes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Existing Attributes</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading attributes...</div>
            ) : !attributes || attributes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No attributes found. Create one above!
              </div>
            ) : (
              <div className="space-y-4">
                {attributes.map(attr => {
                  const isExpanded = !collapsedAttrs[attr.id];
                  const newValueImg = newValueImageInputs[attr.id];
                  const isCompressingImg = isCompressingNewValueImg[attr.id];

                  return (
                    <div key={attr.id} className="border rounded-lg overflow-hidden bg-card shadow-sm">
                      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(attr.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <span className="font-semibold text-base">{attr.name}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium">
                            {attr.values?.length || 0} values
                          </span>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8" onClick={() => handleDeleteAttribute(attr.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-muted/5 space-y-4">
                              {/* Add Value Form with Optional Image Upload */}
                              <div className="p-3 border rounded-lg bg-background/50 space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Add Value to {attr.name}</Label>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                  <Input 
                                    placeholder={`New ${attr.name} value (e.g. Red)...`} 
                                    className="h-9 text-sm flex-1"
                                    value={newValueInputs[attr.id] || ''}
                                    onChange={e => setNewValueInputs(prev => ({ ...prev, [attr.id]: e.target.value }))}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddValue(attr.id);
                                    }}
                                  />

                                  {/* Optional Image File Input */}
                                  {newValueImg ? (
                                    <div className="relative group w-9 h-9 rounded border overflow-hidden flex-shrink-0 bg-muted">
                                      <img src={newValueImg} alt="Preview" className="w-full h-full object-cover" />
                                      <button
                                        type="button"
                                        title="Remove Image"
                                        onClick={() => setNewValueImageInputs(prev => ({ ...prev, [attr.id]: '' }))}
                                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="h-9 px-3 rounded border border-dashed hover:border-primary flex items-center justify-center cursor-pointer text-muted-foreground hover:text-primary transition-colors text-xs font-medium gap-1.5 bg-background flex-shrink-0">
                                      {isCompressingImg ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Upload className="w-3.5 h-3.5" />
                                      )}
                                      <span>{isCompressingImg ? "Compressing..." : "Attach Image"}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isCompressingImg}
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleNewValueImageSelected(attr.id, file);
                                          e.target.value = '';
                                        }}
                                      />
                                    </label>
                                  )}

                                  <Button size="sm" className="h-9 px-4" onClick={() => handleAddValue(attr.id)} disabled={addValues.isPending || isCompressingImg}>
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Add Value
                                  </Button>
                                </div>
                              </div>

                              {/* Values List with Explicit Image Upload Buttons */}
                              <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Values ({attr.values?.length || 0})</Label>
                                {(!attr.values || attr.values.length === 0) ? (
                                  <p className="text-sm text-muted-foreground italic py-2">No values added yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                    {attr.values.map(val => (
                                      <div key={val.id} className="flex items-center justify-between gap-2 bg-background border rounded-lg p-2 shadow-sm">
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                          {/* Image preview / Upload button */}
                                          {val.image ? (
                                            <div className="relative group w-9 h-9 rounded border overflow-hidden flex-shrink-0 bg-muted">
                                              <img src={val.image} alt={val.value} className="w-full h-full object-cover" />
                                              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                                                <Upload className="w-3.5 h-3.5" />
                                                <input
                                                  type="file"
                                                  accept="image/*"
                                                  className="hidden"
                                                  disabled={uploadingValueId === val.id}
                                                  onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleValueImageUpload(val.id, file);
                                                    e.target.value = '';
                                                  }}
                                                />
                                              </label>
                                            </div>
                                          ) : (
                                            <label className="h-8 px-2 rounded border border-dashed border-primary/40 hover:border-primary bg-primary/5 hover:bg-primary/10 flex items-center justify-center cursor-pointer text-primary transition-colors text-xs font-medium gap-1 flex-shrink-0">
                                              {uploadingValueId === val.id ? (
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                              ) : (
                                                <>
                                                  <Upload className="w-3 h-3" />
                                                  <span>Image</span>
                                                </>
                                              )}
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                disabled={uploadingValueId === val.id}
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleValueImageUpload(val.id, file);
                                                  e.target.value = '';
                                                }}
                                              />
                                            </label>
                                          )}

                                          <span className="font-semibold text-sm truncate">{val.value}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          {val.image && (
                                            <Button 
                                              variant="ghost" 
                                              size="icon" 
                                              title="Remove image"
                                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                              disabled={uploadingValueId === val.id}
                                              onClick={() => handleRemoveValueImage(val.id)}
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </Button>
                                          )}
                                          <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            title="Delete value"
                                            className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDeleteValue(val.id)}
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
