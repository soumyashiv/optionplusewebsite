
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSubscription } from '../hooks/useSubscription';

export function TrialBanner() {
  const { summary } = useSubscription();

  // Polling logic for frontend could be added if you want to real-time update hours/days,
  // but for simplicity we rely on the hook's computed days_remaining and hours_remaining.

  if (!summary || summary.status !== 'active' || summary.plan_type !== 'trial') {
    return null;
  }

  const { days_remaining, hours_remaining } = summary;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-amber-500/20 border-b border-amber-500/30 text-amber-500 px-md py-sm flex items-center justify-center gap-md font-label-md"
    >
      <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
      <span>
        <strong>Free Trial Active:</strong> {days_remaining} days, {hours_remaining} hours remaining.
      </span>
      <Link
        to="/dashboard/subscription"
        className="ml-md bg-amber-500 text-black px-md py-1 rounded-full text-xs font-bold hover:bg-amber-400 transition-colors"
      >
        Upgrade Now
      </Link>
    </motion.div>
  );
}
