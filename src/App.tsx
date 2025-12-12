import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { VendorLayout } from "@/layouts/VendorLayout";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/vendor/Dashboard";
import Products from "@/pages/vendor/Products";
import Orders from "@/pages/vendor/Orders";
import Categories from "@/pages/vendor/Categories";
import Messages from "@/pages/vendor/Messages";
import Analytics from "@/pages/vendor/Analytics";
import Payments from "@/pages/vendor/Payments";
import Notifications from "@/pages/vendor/Notifications";
import Settings from "@/pages/vendor/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<VendorLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
