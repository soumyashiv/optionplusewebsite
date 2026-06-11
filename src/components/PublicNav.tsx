import { useNavigate, Link } from 'react-router-dom';

export function PublicNav() {
  const navigate = useNavigate();

  return (
    <nav className="border-b border-outline-variant/20 bg-surface/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-gutter py-md flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">candlestick_chart</span>
          <span className="font-headline-sm text-xl font-bold tracking-tight text-on-surface">
            OptionPluse
          </span>
        </Link>
        <div className="hidden md:flex gap-lg items-center font-label-md text-on-surface-variant">
          <Link to="/#features" className="hover:text-primary transition-colors">Platform</Link>
          <Link to="/#data" className="hover:text-primary transition-colors">Institutional Data</Link>
          <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
        </div>
        <div className="flex gap-sm items-center">
          <button 
            onClick={() => navigate('/login')}
            className="font-label-md text-on-surface hover:text-primary px-4 py-2 transition-colors hidden sm:block"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
