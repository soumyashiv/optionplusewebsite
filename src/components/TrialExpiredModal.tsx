import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';

interface TrialExpiredModalProps {
  onSubscribe: (plan: 'weekly' | 'monthly') => void;
}

export function TrialExpiredModal({ onSubscribe }: TrialExpiredModalProps) {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface border border-outline-variant/30 rounded-2xl p-xl max-w-lg w-full text-center shadow-2xl"
      >
        <span className="material-symbols-outlined text-6xl text-error mb-md">
          timer_off
        </span>
        
        <h2 className="font-headline-md text-2xl text-on-surface mb-sm">
          Your free trial has ended.
        </h2>
        
        <p className="font-body-md text-on-surface-variant mb-xl">
          Subscribe to continue using OptionPluse Premium. Gain unrestricted access to PCR Analysis, Max Pain, Signals, the 7-Factor Algorithm, and more.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-lg">
          {/* Weekly Option */}
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-md flex flex-col hover:border-primary/50 transition-colors">
            <h3 className="font-headline-sm text-lg text-on-surface mb-xs">Weekly</h3>
            <div className="text-2xl font-bold text-on-surface mb-sm">$9<span className="text-sm font-normal text-on-surface-variant">/wk</span></div>
            <button 
              onClick={() => onSubscribe('weekly')}
              className="mt-auto w-full py-2 bg-secondary-container text-on-secondary-container font-label-md rounded-lg hover:opacity-90 transition-opacity"
            >
              Select Weekly
            </button>
          </div>

          {/* Monthly Option */}
          <div className="bg-surface-container-low border border-primary/50 rounded-xl p-md flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              SAVE 26%
            </div>
            <h3 className="font-headline-sm text-lg text-on-surface mb-xs">Monthly</h3>
            <div className="flex items-center justify-center gap-2 mb-sm">
              <span className="text-sm text-on-surface-variant line-through">$39</span>
              <div className="text-2xl font-bold text-primary">$29<span className="text-sm font-normal text-on-surface-variant">/mo</span></div>
            </div>
            <button 
              onClick={() => onSubscribe('monthly')}
              className="mt-auto w-full py-2 bg-primary text-on-primary font-label-md rounded-lg shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all"
            >
              Select Monthly
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="text-on-surface-variant font-label-md text-sm hover:underline"
        >
          Sign Out
        </button>
      </motion.div>
    </div>
  );
}
