import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  useDeleteAttributeMutation,
  useDeleteAttributeValueMutation,
} from '@/api/hooks/attribute.hooks';
import { Card } from '@/components/ui/card';

interface AttributeManagerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttributeManagerModal({ open, onOpenChange }: AttributeManagerModalProps) {
  const { toast } = useToast();
  const { data: attributes, isLoading } = useAttributesQuery();
  const createAttribute = useCreateAttributeMutation();
  const addValues = useAddAttributeValuesMutation();
  const deleteAttribute = useDeleteAttributeMutation();
  const deleteValue = useDeleteAttributeValueMutation();

  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValues, setNewAttrValues] = useState(''); // comma separated
  const [newValueInputs, setNewValueInputs] = useState<Record<string, string>>({});
  const [expandedAttrs, setExpandedAttrs] = useState<Record<string, boolean>>({});

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
    const val = newValueInputs[attributeId];
    if (!val || !val.trim()) return;

    try {
      const values = val
        .split(',')
        .map(v => v.trim())
        .filter(v => v !== '');

      if (values.length === 0) return;

      await addValues.mutateAsync({ id: attributeId, values });
      setNewValueInputs(prev => ({ ...prev, [attributeId]: '' }));
      toast({ title: 'Success', description: 'Values added successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || err.message || 'Failed to add values', variant: 'destructive' });
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
    setExpandedAttrs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Manage Product Attributes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6 py-4">
          {/* Create New Attribute */}
          <Card className="p-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-3">Create New Attribute</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input 
                  placeholder="Attribute Name (e.g. Size, Color)" 
                  value={newAttrName} 
                  onChange={e => setNewAttrName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input 
                  placeholder="Initial Values (comma separated)" 
                  value={newAttrValues} 
                  onChange={e => setNewAttrValues(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateAttribute} disabled={createAttribute.isPending}>
                <Plus className="w-4 h-4 mr-2" />
                Create
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
              <div className="space-y-3">
                {attributes.map(attr => (
                  <div key={attr.id} className="border rounded-lg overflow-hidden bg-card">
                    <div className="flex items-center justify-between p-3 border-b bg-muted/10">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(attr.id)}>
                          {expandedAttrs[attr.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                        <span className="font-medium">{attr.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {attr.values?.length || 0} values
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8" onClick={() => handleDeleteAttribute(attr.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <AnimatePresence>
                      {expandedAttrs[attr.id] && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-muted/5 space-y-4">
                            <div className="flex gap-2 max-w-md">
                              <Input 
                                placeholder="Add new values (comma separated)..." 
                                className="h-8 text-sm"
                                value={newValueInputs[attr.id] || ''}
                                onChange={e => setNewValueInputs(prev => ({ ...prev, [attr.id]: e.target.value }))}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddValue(attr.id);
                                }}
                              />
                              <Button size="sm" variant="secondary" onClick={() => handleAddValue(attr.id)} disabled={addValues.isPending}>
                                Add
                              </Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {(!attr.values || attr.values.length === 0) ? (
                                <span className="text-sm text-muted-foreground italic">No values yet</span>
                              ) : (
                                attr.values.map(val => (
                                  <div key={val.id} className="flex items-center gap-1 bg-background border rounded-md pl-2 pr-1 py-1 text-sm">
                                    <span>{val.value}</span>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive"
                                      onClick={() => handleDeleteValue(val.id)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
