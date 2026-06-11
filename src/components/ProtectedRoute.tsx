import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // Show loading state while checking auth session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined text-primary text-4xl animate-spin">progress_activity</span>
          <p className="font-body-md text-on-surface-variant">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
