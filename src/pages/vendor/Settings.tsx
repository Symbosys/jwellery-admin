import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  MapPin, 
  CreditCard,
  FileText,
  Save,
  Upload,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  useAdminSettingsQuery, 
  useUpdateAdminSettingsMutation,
  PickupAddress 
} from '@/api/hooks/admin.hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const tabs = [
  { id: 'profile', label: 'Business Profile', icon: Store },
  { id: 'addresses', label: 'Pickup Addresses', icon: MapPin },
  { id: 'banking', label: 'Bank Details', icon: CreditCard },
  { id: 'tax', label: 'GST & Tax Info', icon: FileText },
];

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');

  // Queries & Mutations
  const { data: config, isLoading } = useAdminSettingsQuery();
  const updateSettingsMutation = useUpdateAdminSettingsMutation();

  // Business Profile states
  const [storeName, setStoreName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [website, setWebsite] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  // Banking Details states
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  // Tax Info states
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [registeredBusinessName, setRegisteredBusinessName] = useState('');

  // Pickup Addresses
  const [pickupAddresses, setPickupAddresses] = useState<PickupAddress[]>([]);

  // Address dialog states
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<PickupAddress | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrCountry, setAddrCountry] = useState('United States');
  const [addrIsPrimary, setAddrIsPrimary] = useState(false);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (config && !isInitialized) {
      setStoreName(config.storeName || '');
      setBusinessEmail(config.businessEmail || '');
      setPhoneNumber(config.phoneNumber || '');
      setWebsite(config.website || '');
      setStoreDescription(config.storeDescription || '');
      setLogoPreview(config.logo || '');

      setBankName(config.bankName || '');
      setAccountHolderName(config.accountHolderName || '');
      setAccountNumber(config.accountNumber || '');
      setRoutingNumber(config.routingNumber || '');

      setGstNumber(config.gstNumber || '');
      setPanNumber(config.panNumber || '');
      setRegisteredBusinessName(config.registeredBusinessName || '');

      setPickupAddresses((config.pickupAddresses as PickupAddress[]) || []);
      setIsInitialized(true);
    }
  }, [config, isInitialized]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      formData.append('storeName', storeName.trim());
      formData.append('businessEmail', businessEmail.trim());
      formData.append('phoneNumber', phoneNumber.trim());
      formData.append('website', website.trim());
      formData.append('storeDescription', storeDescription.trim());
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      await updateSettingsMutation.mutateAsync(formData);
      toast({ title: 'Success', description: 'Business profile updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update settings', variant: 'destructive' });
    }
  };

  const handleSaveBanking = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim(),
        accountNumber: accountNumber.trim(),
        routingNumber: routingNumber.trim(),
      });
      toast({ title: 'Success', description: 'Banking details updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update banking details', variant: 'destructive' });
    }
  };

  const handleSaveTax = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        gstNumber: gstNumber.trim(),
        panNumber: panNumber.trim(),
        registeredBusinessName: registeredBusinessName.trim(),
      });
      toast({ title: 'Success', description: 'Tax information updated successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update tax info', variant: 'destructive' });
    }
  };

  const handleOpenAddressModal = (addr: PickupAddress | null = null) => {
    if (addr) {
      setEditingAddress(addr);
      setAddrName(addr.name);
      setAddrLine1(addr.addressLine1);
      setAddrLine2(addr.addressLine2 || '');
      setAddrCity(addr.city);
      setAddrState(addr.state);
      setAddrPincode(addr.pincode);
      setAddrCountry(addr.country);
      setAddrIsPrimary(addr.isPrimary);
    } else {
      if (pickupAddresses.length >= 2) {
        toast({
          title: 'Limit Exceeded',
          description: 'You can add a maximum of 2 pickup addresses.',
          variant: 'destructive',
        });
        return;
      }
      setEditingAddress(null);
      setAddrName('');
      setAddrLine1('');
      setAddrLine2('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
      setAddrCountry('United States');
      setAddrIsPrimary(false);
    }
    setIsAddressOpen(true);
  };

  const handleSaveAddress = async () => {
    if (!addrName.trim() || !addrLine1.trim() || !addrCity.trim() || !addrState.trim() || !addrPincode.trim()) {
      toast({ title: 'Validation Error', description: 'All fields marked with * are required', variant: 'destructive' });
      return;
    }

    if (!editingAddress && pickupAddresses.length >= 2) {
      toast({
        title: 'Limit Exceeded',
        description: 'You can add a maximum of 2 pickup addresses.',
        variant: 'destructive',
      });
      return;
    }

    let updatedAddresses = [...pickupAddresses];

    const newAddress: PickupAddress = {
      id: editingAddress ? editingAddress.id : Math.random().toString(36).substring(2, 9),
      name: addrName.trim(),
      addressLine1: addrLine1.trim(),
      addressLine2: addrLine2.trim() || undefined,
      city: addrCity.trim(),
      state: addrState.trim(),
      pincode: addrPincode.trim(),
      country: addrCountry.trim(),
      isPrimary: addrIsPrimary,
    };

    if (addrIsPrimary) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isPrimary: false }));
    }

    if (editingAddress) {
      updatedAddresses = updatedAddresses.map((a) => a.id === editingAddress.id ? newAddress : a);
    } else {
      if (updatedAddresses.length === 0) {
        newAddress.isPrimary = true;
      }
      updatedAddresses.push(newAddress);
    }

    try {
      await updateSettingsMutation.mutateAsync({
        pickupAddresses: updatedAddresses,
      });
      setPickupAddresses(updatedAddresses);
      setIsAddressOpen(false);
      toast({ title: 'Success', description: editingAddress ? 'Address updated successfully' : 'Address added successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to save address', variant: 'destructive' });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    let updatedAddresses = pickupAddresses.filter((a) => a.id !== id);
    
    if (pickupAddresses.find((a) => a.id === id)?.isPrimary && updatedAddresses.length > 0) {
      const first = updatedAddresses[0];
      if (first) {
        first.isPrimary = true;
      }
    }

    try {
      await updateSettingsMutation.mutateAsync({
        pickupAddresses: updatedAddresses,
      });
      setPickupAddresses(updatedAddresses);
      toast({ title: 'Success', description: 'Address deleted successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete address', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings and preferences</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl shadow-soft"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-border">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto overflow-x-auto flex-nowrap">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "rounded-none border-b-2 border-transparent px-4 py-3 font-medium text-muted-foreground whitespace-nowrap",
                    "data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
                  )}
                >
                  <tab.icon className="w-4 h-4 mr-2 hidden sm:inline-block" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Business Profile */}
          <TabsContent value="profile" className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={logoPreview || undefined} />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {storeName ? storeName.substring(0, 2).toUpperCase() : 'VS'}
                  </AvatarFallback>
                </Avatar>
                <input 
                  type="file" 
                  id="logo-upload-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoChange}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2" 
                  onClick={() => document.getElementById('logo-upload-input')?.click()}
                  disabled={updateSettingsMutation.isPending}
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store Name</Label>
                  <Input 
                    id="store-name"
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)} 
                    placeholder="Enter store name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input 
                    id="business-email"
                    type="email" 
                    value={businessEmail} 
                    onChange={(e) => setBusinessEmail(e.target.value)} 
                    placeholder="Enter business email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input 
                    id="phone-number"
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website-url">Website</Label>
                  <Input 
                    id="website-url"
                    type="url" 
                    value={website} 
                    onChange={(e) => setWebsite(e.target.value)} 
                    placeholder="https://yourstore.com" 
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="store-desc">Store Description</Label>
                  <Textarea 
                    id="store-desc"
                    placeholder="Tell customers about your store..." 
                    rows={4}
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                className="gap-2" 
                onClick={handleSaveProfile}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses" className="p-6 space-y-6">
            <div className="space-y-4">
              {pickupAddresses.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No pickup addresses added yet.</p>
                </div>
              ) : (
                pickupAddresses.map((addr) => (
                  <div key={addr.id} className="bg-muted/30 rounded-xl p-4 border border-border">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{addr.name}</h4>
                          {addr.isPrimary && (
                            <span className="text-[10px] bg-primary/20 text-primary font-semibold px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {addr.addressLine1}
                          {addr.addressLine2 && <><br />{addr.addressLine2}</>}
                          <br />
                          {addr.city}, {addr.state} {addr.pincode}
                          <br />
                          {addr.country}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleOpenAddressModal(addr)}
                          disabled={updateSettingsMutation.isPending}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive" 
                          onClick={() => handleDeleteAddress(addr.id)}
                          disabled={updateSettingsMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={() => handleOpenAddressModal(null)}
              disabled={updateSettingsMutation.isPending || pickupAddresses.length >= 2}
            >
              <MapPin className="w-4 h-4" />
              Add New Address
            </Button>
            {pickupAddresses.length >= 2 && (
              <p className="text-xs text-muted-foreground mt-2">
                Maximum limit of 2 pickup addresses reached.
              </p>
            )}
          </TabsContent>

          {/* Banking */}
          <TabsContent value="banking" className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Input 
                  id="bank-name"
                  placeholder="Enter bank name" 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-holder">Account Holder Name</Label>
                <Input 
                  id="account-holder"
                  placeholder="Enter account holder name" 
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-number">Account Number</Label>
                <Input 
                  id="account-number"
                  placeholder="Enter account number" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routing-number">Routing Number</Label>
                <Input 
                  id="routing-number"
                  placeholder="Enter routing number" 
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                className="gap-2" 
                onClick={handleSaveBanking}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Banking Details
              </Button>
            </div>
          </TabsContent>

          {/* Tax */}
          <TabsContent value="tax" className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gst-number">GST Number</Label>
                <Input 
                  id="gst-number"
                  placeholder="Enter GST number" 
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan-number">PAN Number</Label>
                <Input 
                  id="pan-number"
                  placeholder="Enter PAN number" 
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="business-name">Registered Business Name</Label>
                <Input 
                  id="business-name"
                  placeholder="Enter registered business name" 
                  value={registeredBusinessName}
                  onChange={(e) => setRegisteredBusinessName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button 
                className="gap-2" 
                onClick={handleSaveTax}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Tax Info
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Address Dialog */}
      <Dialog open={isAddressOpen} onOpenChange={setIsAddressOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Pickup Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="addr-name">Address Name *</Label>
              <Input 
                id="addr-name"
                placeholder="e.g. Primary Warehouse" 
                value={addrName}
                onChange={(e) => setAddrName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-line1">Address Line 1 *</Label>
              <Input 
                id="addr-line1"
                placeholder="Street address, P.O. Box" 
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-line2">Address Line 2</Label>
              <Input 
                id="addr-line2"
                placeholder="Apartment, suite, unit, building" 
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addr-city">City *</Label>
                <Input 
                  id="addr-city"
                  placeholder="City" 
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-state">State *</Label>
                <Input 
                  id="addr-state"
                  placeholder="State/Province" 
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addr-pincode">Pincode *</Label>
                <Input 
                  id="addr-pincode"
                  placeholder="Pincode/Zip code" 
                  value={addrPincode}
                  onChange={(e) => setAddrPincode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="addr-country">Country *</Label>
                <Input 
                  id="addr-country"
                  value={addrCountry}
                  onChange={(e) => setAddrCountry(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="addr-primary">Set as Primary Address</Label>
              <Switch 
                id="addr-primary"
                checked={addrIsPrimary} 
                onCheckedChange={setAddrIsPrimary}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => setIsAddressOpen(false)}
                disabled={updateSettingsMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveAddress}
                disabled={updateSettingsMutation.isPending}
              >
                {updateSettingsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingAddress ? 'Save Changes' : 'Add Address'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
