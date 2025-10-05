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
import OwnerDashboard from "./pages/OwnerDashboard";
import MyProperties from "./pages/MyProperties";
import AddProperty from "./pages/AddProperty";
import EditProperty from "./pages/EditProperty";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyApplications from "./pages/PropertyApplications";
import Messages from "./pages/Messages";
import Application from "./pages/Application";
import Applications from "./pages/Applications";
import Leases from "./pages/Leases";
import Payments from "./pages/Payments";
import Verification from "./pages/Verification";
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
              path="/analytics" 
              element={
                <ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
                  <OwnerDashboard />
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
              path="/ajouter-bien" 
              element={
                <ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
                  <AddProperty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/biens/:id/modifier" 
              element={
                <ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
                  <EditProperty />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/biens/:id/candidatures" 
              element={
                <ProtectedRoute allowedUserTypes={['proprietaire', 'agence']}>
                  <PropertyApplications />
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
            <Route 
              path="/baux" 
              element={
                <ProtectedRoute>
                  <Leases />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payments" 
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/verification" 
              element={
                <ProtectedRoute>
                  <Verification />
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
