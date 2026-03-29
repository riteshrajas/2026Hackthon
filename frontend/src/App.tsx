import { Routes, Route, Navigate } from 'react-router-dom';
import { FeedPage } from './pages/FeedPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ActionsPage } from './pages/ActionsPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { ImpactPage } from './pages/ImpactPage';
import { CommunityPage } from './pages/CommunityPage';
import { SettingsPage } from './pages/SettingsPage';
import { EventsPage } from './pages/EventsPage';
import { DisasterRecoveryPage } from './pages/DisasterRecoveryPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen bg-surface flex items-center justify-center font-bold text-primary">Loading...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      
      <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
      <Route path="/actions" element={<ProtectedRoute><ActionsPage /></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
      <Route path="/impact" element={<ProtectedRoute><ImpactPage /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
      <Route path="/disaster-recovery" element={<ProtectedRoute><DisasterRecoveryPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      
      <Route path="/" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
