import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useAuthStore } from './app/store';
import AdminLayout from './components/layout/AdminLayout';
import { Providers } from './app/providers';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import FloatingAssistant from './components/Assistant/FloatingAssistant';
import BottomNavigation from './components/layout/BottomNavigation';
import PlacesPage from './pages/PlacesPage';
import PlaceDetailPage from './pages/PlaceDetailPage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailPage from './pages/HotelDetailPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import TransportsPage from './pages/TransportsPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminPlacesPage from './pages/AdminPlacesPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OwnerServicesPage from './pages/OwnerServicesPage';
import ProfilePage from './pages/ProfilePage';
import ProviderRegistrationWizardPage from './pages/ProviderRegistrationWizardPage';
import AdminProviderApplicationsPage from './pages/AdminProviderApplicationsPage';
import PassengerTransportSearchPage from './pages/PassengerTransportSearchPage';
import { ProtectedRoute, RoleRoute } from './routes';
import NavigationPage from './pages/NavigationPage';
import LandingPage from './pages/LandingPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const theme = useAuthStore((state) => state.theme);
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans antialiased transition-colors duration-300">
      {!isAdminPath && <Navbar />}
      <main className="flex-grow flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Business modules catalogs and details */}
          <Route path="/places" element={<PlacesPage />} />
          <Route path="/places/:id" element={<PlaceDetailPage />} />
          
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
          
          <Route path="/transports" element={<TransportsPage />} />
          <Route path="/passenger-transports" element={<PassengerTransportSearchPage />} />
          
          <Route path="/guides" element={<GuidesPage />} />
          <Route path="/guides/:id" element={<GuideDetailPage />} />
          <Route path="/map" element={<NavigationPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/register-provider" element={<ProviderRegistrationWizardPage />} />

            {/* Owner Guarded Route */}
            <Route element={<RoleRoute allowedRoles={['HotelOwner', 'RestaurantOwner', 'TransportOwner', 'Admin', 'SuperAdmin']} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/owner/services" element={<OwnerServicesPage />} />
            </Route>

            {/* Admin Guarded Route */}
            <Route element={<RoleRoute allowedRoles={['Admin', 'SuperAdmin']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/places" element={<AdminPlacesPage />} />
                <Route path="/admin/provider-applications" element={<AdminProviderApplicationsPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Route>
          </Route>

          {/* 404 — must stay the last route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
      <FloatingAssistant />
      {!isAdminPath && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </Providers>
  );
}

export default App;

