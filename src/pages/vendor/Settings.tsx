import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Store, 
  MapPin, 
  CreditCard,
  FileText,
  Shield,
  Users,
  Bell,
  Save,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Business Profile', icon: Store },
  { id: 'addresses', label: 'Pickup Addresses', icon: MapPin },
  { id: 'banking', label: 'Bank Details', icon: CreditCard },
  { id: 'tax', label: 'GST & Tax Info', icon: FileText },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

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
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">VS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input defaultValue="Vendor Store" />
                </div>
                <div className="space-y-2">
                  <Label>Business Email</Label>
                  <Input type="email" defaultValue="vendor@store.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input type="tel" defaultValue="+1 234 567 890" />
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input type="url" placeholder="https://yourstore.com" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Store Description</Label>
                  <Textarea 
                    placeholder="Tell customers about your store..." 
                    rows={4}
                    defaultValue="We are a premium electronics retailer offering the latest gadgets and accessories."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Addresses */}
          <TabsContent value="addresses" className="p-6 space-y-6">
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">Primary Warehouse</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    123 Business Park, Suite 456<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                </div>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <MapPin className="w-4 h-4" />
              Add New Address
            </Button>
          </TabsContent>

          {/* Banking */}
          <TabsContent value="banking" className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input placeholder="Enter bank name" />
              </div>
              <div className="space-y-2">
                <Label>Account Holder Name</Label>
                <Input placeholder="Enter account holder name" />
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <Input placeholder="Enter account number" />
              </div>
              <div className="space-y-2">
                <Label>Routing Number</Label>
                <Input placeholder="Enter routing number" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Banking Details
              </Button>
            </div>
          </TabsContent>

          {/* Tax */}
          <TabsContent value="tax" className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GST Number</Label>
                <Input placeholder="Enter GST number" />
              </div>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input placeholder="Enter PAN number" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Registered Business Name</Label>
                <Input placeholder="Enter registered business name" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Tax Info
              </Button>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input type="password" placeholder="Enter current password" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Confirm new password" />
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Update Password
              </Button>
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team" className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-sm text-muted-foreground">john@store.com</p>
                  </div>
                </div>
                <span className="badge-success">Admin</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-info/10 text-info">JS</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">jane@store.com</p>
                  </div>
                </div>
                <span className="badge-muted">Editor</span>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" />
              Invite Team Member
            </Button>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="p-6 space-y-6">
            <div className="space-y-4">
              {[
                { label: 'Order Notifications', description: 'Get notified for new orders' },
                { label: 'Low Stock Alerts', description: 'Alert when products run low' },
                { label: 'Payment Updates', description: 'Notify for payment status changes' },
                { label: 'Marketing Emails', description: 'Receive tips and promotions' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
