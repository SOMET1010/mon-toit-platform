import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Certification from "./pages/Certification";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import MyProperties from "./pages/MyProperties";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import PropertyDetail from "./pages/PropertyDetail";
import Messages from "./pages/Messages";
import Application from "./pages/Application";
import Applications from "./pages/Applications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/recherche" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/certification" element={<Certification />} />
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/profil" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedUserTypes={['admin_ansut']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/favoris" 
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mes-biens" 
              element={
                <ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
                  <MyProperties />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/application/:propertyId" 
              element={
                <ProtectedRoute>
                  <Application />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidatures" 
              element={
                <ProtectedRoute>
                  <Applications />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
