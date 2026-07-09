import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import { VendorLayout } from "@/layouts/VendorLayout";
import { Toaster } from "@/components/ui/toaster";

import Dashboard from "@/pages/vendor/Dashboard";
import Products from "@/pages/vendor/Products";
import ProductForm from "@/pages/vendor/ProductForm";
import ProductView from "@/pages/vendor/ProductView";
import Orders from "@/pages/vendor/Orders";
import OrderDetails from "@/pages/vendor/OrderDetails";
import Categories from "@/pages/vendor/Categories";
import SubCategories from "@/pages/vendor/subCategories";
import Brands from "@/pages/vendor/Brands";

import Reviews from "@/pages/vendor/Reviews";
import Customers from "@/pages/vendor/Customers";
import Inventory from "@/pages/vendor/Inventory";
import Coupons from "@/pages/vendor/Coupons";
import Banners from "@/pages/vendor/Banners";
import Offer from "@/pages/vendor/offer";
import Messages from "@/pages/vendor/Messages";
import Analytics from "@/pages/vendor/Analytics";
import Payments from "@/pages/vendor/Payments";
import Settings from "@/pages/vendor/Settings";
import Blogs from "@/pages/vendor/blogs";
import NotFound from "@/pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <SidebarProvider>
              <Routes>
                <Route element={<VendorLayout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/new" element={<ProductForm />} />
                  <Route path="/products/:productId" element={<ProductView />} />
                  <Route
                    path="/products/:productId/edit"
                    element={<ProductForm />}
                  />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:orderId" element={<OrderDetails />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/subcategories" element={<SubCategories />} />
                  <Route path="/brands" element={<Brands />} />

                  <Route path="/customers/list" element={<Customers />} />
                  <Route path="/customers/reviews" element={<Reviews />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/marketing/coupons" element={<Coupons />} />
                  <Route path="/marketing/banners" element={<Banners />} />
                  <Route path="/marketing/offers" element={<Offer />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/blogs" element={<Blogs />} />
                </Route>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </SidebarProvider>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
