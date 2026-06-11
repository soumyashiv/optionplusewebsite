import { useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../auth/authStore';
import { useAppStore } from '../store/useAppStore';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithOAuth, isAuthenticated, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { addToast } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Clear global auth errors when mounting/unmounting
  useEffect(() => {
    clearError();
    return () => clearError();
  }, [clearError]);

  const displayError = localError || authError;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    // Basic frontend validation
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    const success = await signIn(email, password);
    setIsSubmitting(false);

    if (success) {
      addToast('Successfully authenticated.', 'success');
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else {
      addToast('Authentication failed.', 'error');
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    await signInWithOAuth(provider);
    // OAuth redirects to Supabase → back to /dashboard
  };

  const isLoading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column: Visual/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface border-r border-outline-variant/30 flex-col justify-between p-xxl relative overflow-hidden">
        {/* Back Button Desktop */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-lg left-lg z-20 flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors bg-surface-container/50 hover:bg-surface-container py-2 px-3 rounded-full backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back
        </button>

        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-4xl">candlestick_chart</span>
          <span className="font-headline-md text-3xl font-bold text-on-surface">OptionPluse</span>
        </div>
        
        <div className="relative z-10 space-y-lg max-w-md">
           <h2 className="font-headline-lg text-4xl leading-tight text-on-surface">
             The institutional edge for independent traders.
           </h2>
           <p className="font-body-lg text-on-surface-variant">
             Access ultra-low latency data feeds, proprietary Greeks algorithms, and execution platforms built for scale.
           </p>
        </div>

        <div className="relative z-10 font-label-sm text-outline-variant">
           © 2024 OptionPluse Systems. All rights reserved.
        </div>
      </div>

      {/* Right Column: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter lg:p-xxl relative">
        {/* Back Button Mobile */}
        <button 
          onClick={() => navigate(-1)}
          className="lg:hidden absolute top-md left-md z-20 flex items-center gap-xs font-label-md text-on-surface-variant hover:text-primary transition-colors bg-surface-container/50 hover:bg-surface-container py-2 px-3 rounded-full backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-xl"
        >
          <div className="text-center lg:text-left">
            <h1 className="font-headline-md text-3xl text-on-surface mb-2">Welcome back</h1>
            <p className="font-body-md text-on-surface-variant">Sign in to your trading dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-lg">
            {displayError && (
              <div className="p-sm bg-error/10 border border-error/20 rounded-md text-error font-body-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">error</span>
                {displayError}
              </div>
            )}
            
            <div className="space-y-sm">
              <label className="font-label-md text-on-surface block uppercase tracking-wider text-xs" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg px-md py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/50"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-on-surface block uppercase tracking-wider text-xs" htmlFor="password">
                  Password
                </label>
                <a href="#" className="font-label-sm text-primary hover:underline">Forgot password?</a>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface border border-outline-variant/50 rounded-lg px-md py-3 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline/50"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-outline-variant/50 text-primary focus:ring-primary/20" />
              <label htmlFor="remember" className="font-body-sm text-on-surface-variant cursor-pointer">
                Remember this device
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary font-label-md text-lg px-4 py-4 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-outline font-label-sm uppercase tracking-wider">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <button
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-sm bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 hover:bg-surface-container-low transition-colors font-label-md text-on-surface disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button
              onClick={() => handleOAuth('apple')}
              disabled={isLoading}
              className="flex items-center justify-center gap-sm bg-surface border border-outline-variant/30 rounded-lg px-4 py-3 hover:bg-surface-container-low transition-colors font-label-md text-on-surface disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[1.2rem]">apple</span>
              Apple
            </button>
          </div>

          <p className="text-center font-body-sm text-on-surface-variant">
            Don't have an account? <button onClick={() => navigate('/signup')} className="font-label-sm text-primary hover:underline">Sign Up</button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
