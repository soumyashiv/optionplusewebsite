import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { SideNavBar } from '../components/SideNavBar';
import { TopNavBar } from '../components/TopNavBar';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../auth/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { TrialBanner } from '../components/TrialBanner';
import { TrialExpiredModal } from '../components/TrialExpiredModal';
import { useSubscription } from '../hooks/useSubscription';
import { useEffect } from 'react';
import { cn } from '../utils/cn';

export function DashboardLayout() {
  const { isSidebarOpen, setSidebarOpen, toasts, removeToast } = useAppStore();
  const { summary } = useSubscription();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Subscription fetch removed
  }, [location.pathname]);

  const isSubscriptionPage = location.pathname === '/dashboard/subscription';
  const showExpiredModal = summary && summary.status !== 'active' && !isSubscriptionPage;

  return (
    <div className="bg-background text-on-background font-body-md antialiased h-screen overflow-hidden flex w-full">
      {/* Desktop Sidebar */}
      <SideNavBar />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface shadow-xl lg:hidden"
            >
              {/* Reuse SideNavBar content but we need a wrapper, for now we can render a mobile version or tweak SideNavBar to just render its contents. Let's just use a div block wrapper for mobile sidebar contents */}
              <div className="h-full flex flex-col">
                <SideNavBarMobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <TrialBanner />
        <TopNavBar />
        {/* The Outlet renders the page components like Dashboard, Analysis, etc. */}
        <Outlet />
      </div>

      {showExpiredModal && (
        <TrialExpiredModal onSubscribe={() => navigate('/dashboard/subscription')} />
      )}

      {/* Toast Notifications container */}
      <div className="fixed bottom-lg right-lg z-50 flex flex-col gap-sm">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "px-md py-sm rounded shadow-lg flex items-center gap-sm font-label-md min-w-[200px]",
                toast.type === 'success' ? "bg-primary text-on-primary" :
                  toast.type === 'error' ? "bg-error text-on-error" :
                    "bg-surface-container-highest text-on-surface"
              )}
            >
              <span className="material-symbols-outlined text-[1.2rem]">
                {toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-auto flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[1rem]">close</span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}



const navItems = [
  { icon: 'dashboard', label: 'Home', path: '/dashboard' },
  { icon: 'show_chart', label: 'Market', path: '/dashboard/market' },
  { icon: 'analytics', label: 'Analysis', path: '/dashboard/analysis' },
  { icon: 'article', label: 'News', path: '/dashboard/news' },
  { icon: 'database', label: 'Data', path: '/dashboard/data' },
];

function SideNavBarMobile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setSidebarOpen, addToast } = useAppStore();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    setSidebarOpen(false);
    await signOut();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full py-lg px-md gap-sm bg-surface border-r border-outline-variant/20 flex-shrink-0 relative">
      <div className="mb-xl px-sm flex justify-between items-center">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
          OptionPluse
        </h1>
        <button onClick={() => setSidebarOpen(false)} className="text-on-surface-variant">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="flex flex-col gap-sm flex-grow">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-sm px-md py-sm rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-secondary-container text-on-secondary-container font-bold translate-x-1'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              <span
                className={cn(
                  'material-symbols-outlined transition-colors',
                  isActive ? 'fill-icon' : 'group-hover:text-primary'
                )}
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-sm border-t border-outline-variant/20 pt-md">
        <div className="flex flex-col gap-xs">
          <Link
            to="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined text-body-lg">account_circle</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link
            to="/dashboard/support"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined text-body-lg">help_outline</span>
            <span className="font-label-md text-label-md">Support</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-sm px-md py-sm text-error hover:bg-error-container/20 rounded-lg transition-colors group w-full"
          >
            <span className="material-symbols-outlined text-body-lg">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
