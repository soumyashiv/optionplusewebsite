import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../auth/authStore';

const navItems = [
  { icon: 'dashboard', label: 'Home', path: '/dashboard' },
  { icon: 'show_chart', label: 'Market', path: '/dashboard/market' },
  { icon: 'analytics', label: 'Analysis', path: '/dashboard/analysis' },
  { icon: 'article', label: 'News', path: '/dashboard/news' },
  { icon: 'database', label: 'Data', path: '/dashboard/data' },
];

export function SideNavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useAppStore();
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    addToast('Signed out successfully', 'info');
    navigate('/login');
  };

  return (
    <nav className="hidden lg:flex flex-col h-full py-lg px-md gap-sm bg-surface border-r border-outline-variant/20 w-64 flex-shrink-0 z-40 relative">
      <div className="mb-xl px-sm">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
          OptionPluse
        </h1>
      </div>
      <div className="flex flex-col gap-sm flex-grow">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
            className="flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors group"
          >
            <span className="material-symbols-outlined text-body-lg">account_circle</span>
            <span className="font-label-md text-label-md">Profile</span>
          </Link>
          <Link
            to="/dashboard/support"
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
    </nav>
  );
}
