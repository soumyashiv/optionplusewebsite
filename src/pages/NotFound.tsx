
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-gutter">
      <div className="text-center space-y-lg max-w-md">
        <span className="material-symbols-outlined text-[80px] text-primary">
          route
        </span>
        <h1 className="font-headline-lg text-5xl text-on-surface">
          404
        </h1>
        <h2 className="font-headline-sm text-2xl text-on-surface">
          Page Not Found
        </h2>
        <p className="font-body-md text-on-surface-variant">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-md">
          <button 
            onClick={() => navigate('/')}
            className="bg-primary text-on-primary font-label-md px-8 py-3 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}
