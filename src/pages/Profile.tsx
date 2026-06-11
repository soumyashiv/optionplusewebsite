import { useEffect, useState } from 'react';
import { useAuthStore } from '../auth/authStore';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Profile() {
  const { user, signOut, updateProfile } = useAuthStore();
  const { summary, refetch, isLoading } = useSubscription();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSaveName = async () => {
    if (!newName.trim() || newName.trim() === user?.user_metadata?.full_name) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    await updateProfile(newName.trim());
    setIsSavingName(false);
    setIsEditingName(false);
  };

  const startEditing = () => {
    setNewName(user?.user_metadata?.full_name || '');
    setIsEditingName(true);
  };

  const planLabels: Record<string, string> = {
    'trial': 'Free Trial',
    'weekly': 'Weekly Premium',
    'monthly': 'Monthly Premium',
    'dev': 'Developer Access'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-primary';
      case 'expired': return 'text-error';
      case 'cancelled': return 'text-on-surface-variant';
      default: return 'text-on-surface-variant';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-md lg:p-gutter">
      <div className="max-w-3xl mx-auto space-y-lg">
        <h1 className="font-headline-lg text-3xl text-on-surface">Account Profile</h1>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-outline-variant/30 rounded-2xl p-lg"
        >
          <div className="flex items-center gap-md mb-lg">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-2xl uppercase shrink-0">
              {user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-sm">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    disabled={isSavingName}
                    autoFocus
                    className="bg-surface-container border border-outline/30 rounded px-2 py-1 text-on-surface font-headline-sm focus:outline-none focus:border-primary"
                  />
                  <button onClick={handleSaveName} disabled={isSavingName} className="text-primary hover:text-primary-container">
                    <span className="material-symbols-outlined text-[1.2rem]">check</span>
                  </button>
                  <button onClick={() => setIsEditingName(false)} disabled={isSavingName} className="text-error hover:text-error/80">
                    <span className="material-symbols-outlined text-[1.2rem]">close</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-sm group">
                  <h2 className="font-headline-sm text-xl text-on-surface">{user?.user_metadata?.full_name || 'Trader'}</h2>
                  <button onClick={startEditing} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-[1rem]">edit</span>
                  </button>
                </div>
              )}
              <p className="font-body-sm text-on-surface-variant">{user?.email}</p>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-lg">
            <h3 className="font-headline-sm text-lg text-on-surface mb-md flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">workspace_premium</span>
              Subscription Status
            </h3>

            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-2">
                <div className="h-6 bg-surface-container-high rounded w-1/3"></div>
                <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
              </div>
            ) : summary ? (
              <div className="space-y-sm">
                <div className="flex justify-between items-center bg-surface-container p-md rounded-xl">
                  <div>
                    <div className="text-sm text-on-surface-variant">Current Plan</div>
                    <div className="font-headline-sm text-lg text-on-surface">
                      {summary.plan_type ? planLabels[summary.plan_type] || summary.plan_type : 'No Plan'}
                    </div>
                  </div>
                  <div className={`font-label-md uppercase tracking-wider ${getStatusColor(summary.status)}`}>
                    {summary.status}
                  </div>
                </div>

                {summary.status === 'active' && summary.plan_type === 'trial' && (
                  <div className="text-sm text-on-surface-variant bg-amber-500/10 border border-amber-500/20 p-md rounded-xl text-amber-400">
                    Your free trial ends on {new Date(summary.trial_end_date!).toLocaleDateString()}. You have {summary.days_remaining} days remaining.
                  </div>
                )}

                {summary.status === 'active' && summary.plan_type !== 'trial' && summary.plan_type !== 'dev' && (
                  <div className="text-sm text-on-surface-variant p-md bg-surface-container rounded-xl">
                    Next billing cycle starts on {new Date(summary.subscription_end_date!).toLocaleDateString()}.
                  </div>
                )}

                <div className="pt-md flex gap-sm">
                  {(!summary.plan_type || summary.plan_type === 'trial' || summary.status === 'expired') && (
                    <button
                      onClick={() => navigate('/dashboard/subscription')}
                      className="bg-primary text-on-primary px-md py-2 rounded-lg font-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Upgrade Plan
                    </button>
                  )}
                  {(summary.plan_type === 'weekly' || summary.plan_type === 'monthly') && (
                    <button
                      onClick={() => window.open('mailto:support@optionpluse.com', '_blank')}
                      className="bg-surface-container-high text-on-surface px-md py-2 rounded-lg font-label-md hover:bg-surface-container-highest transition-colors"
                    >
                      Contact Support to Cancel
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-on-surface-variant text-sm">Could not load subscription details.</p>
            )}
          </div>
        </motion.div>

        <div className="flex justify-end pt-md">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-error hover:bg-error-container/10 px-md py-2 rounded-lg transition-colors font-label-md"
          >
            <span className="material-symbols-outlined text-[1.2rem]">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
