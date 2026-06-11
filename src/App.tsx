import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Analysis } from './pages/Analysis';
import { Market } from './pages/Market';
import { News } from './pages/News';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Pricing } from './pages/Pricing';
import { NotFound } from './pages/NotFound';
import { Support } from './pages/Support';
import { DataPage } from './pages/Data';
import { Subscription } from './pages/Subscription';
import { Profile } from './pages/Profile';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './auth/authStore';

function App() {
  const { initialize } = useAuthStore();

  // Initialize auth session on app mount
  useEffect(() => {
    initialize();
    
    // Start WebSocket for current symbol
    import('./api/websocketManager').then(({ wsManager }) => {
      import('./store/useMarketStore').then(({ useMarketStore }) => {
        wsManager.connect(useMarketStore.getState().symbol);
      });
    });
  }, [initialize]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      
      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="market" element={<Market />} />
          <Route path="news" element={<News />} />
          <Route path="support" element={<Support />} />
          <Route path="data" element={<DataPage />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
