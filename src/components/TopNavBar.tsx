import { useAppStore } from '../store/useAppStore';

export function TopNavBar() {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="bg-surface/80 backdrop-blur-md flex justify-between items-center px-lg h-16 w-full z-30 flex-shrink-0 border-b border-outline-variant/30 lg:justify-end sticky top-0">
      {/* Mobile Menu & Brand */}
      <div className="flex items-center gap-md lg:hidden">
        <button onClick={toggleSidebar} className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
          OptionPluse
        </span>
      </div>

      {/* Desktop Search & Actions */}
      <div className="flex items-center gap-md ml-auto">
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search markets..."
            className="pl-xl pr-md py-sm rounded-full bg-surface-container-low border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md w-64 transition-all"
          />
        </div>
        <div className="flex items-center gap-sm text-on-surface-variant">
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>
    </header>
  );
}
