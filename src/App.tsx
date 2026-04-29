import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import DishesPage from "./pages/admin/DishesPage.tsx";
import MenusPage from "./pages/admin/MenusPage.tsx";
import PackagesPage from "./pages/admin/PackagesPage.tsx";
import BookingsPage from "./pages/admin/BookingsPage.tsx";
import CustomersPage from "./pages/admin/CustomersPage.tsx";
import TestimonialsPage from "./pages/admin/TestimonialsPage.tsx";
import SettingsPage from "./pages/admin/SettingsPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/dishes" element={<DishesPage />} />
            <Route path="/admin/menus" element={<MenusPage />} />
            <Route path="/admin/packages" element={<PackagesPage />} />
            <Route path="/admin/bookings" element={<BookingsPage />} />
            <Route path="/admin/customers" element={<CustomersPage />} />
            <Route path="/admin/testimonials" element={<TestimonialsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
