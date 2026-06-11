import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSubscription } from '../hooks/useSubscription';
import { usePlansQuery } from '../hooks/queries';
import { useAppStore } from '../store/useAppStore';

// Add Razorpay type to window
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

export function Subscription() {
  const { summary, createOrder, verifyPayment } = useSubscription();
  const { data: plans } = usePlansQuery();
  const { addToast } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan: 'weekly' | 'monthly') => {
    if (!window.Razorpay) {
      addToast('Payment gateway not loaded. Please refresh.', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create order on backend
      const orderData = await createOrder(plan);

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OptionPluse Premium',
        description: `${orderData.display_label} Subscription`,
        order_id: orderData.order_id,
        handler: async function (response: Record<string, string>) {
          try {
            addToast('Verifying payment...', 'info');
            // 3. Verify on backend
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            addToast('Subscription activated successfully!', 'success');
          } catch (err: unknown) {
            const e = err as Error;
            addToast(e.message || 'Verification failed. Please contact support.', 'error');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#00F0FF' // OptionPluse primary
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rzp.on('payment.failed', function (response: any) {
        addToast(response.error?.description || 'Payment failed', 'error');
        setIsProcessing(false);
      });
      rzp.open();

    } catch (error: unknown) {
      const e = error as Error;
      addToast(e.message, 'error');
      setIsProcessing(false);
    }
  };

  const isCurrentPlan = (planCheck: string) => {
    return summary?.status === 'active' && summary?.plan_type === planCheck;
  };

  return (
    <div className="flex-1 overflow-y-auto p-md lg:p-gutter pb-xxl">
      <div className="max-w-4xl mx-auto space-y-xl">
        
        <div className="text-center space-y-md pt-lg">
          <h1 className="font-headline-lg text-4xl text-on-surface">Upgrade to OptionPluse Premium</h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Get unrestricted access to institutional-grade analytics, real-time PCR, Max Pain, and our proprietary 7-Factor Algorithm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg pt-md">
          {plans?.filter(p => p.id !== 'trial').map((plan) => {
            const isCurrent = isCurrentPlan(plan.id);
            const price = plan.display_price_usd;
            const details = plan.id === 'weekly' 
              ? {
                  description: "Perfect for short-term trading & analysis",
                  features: ["Full access to Max Pain & PCR", "Real-time Options Chain", "7-Factor Algo Signals", "Premium Market Summary"]
                }
              : {
                  description: "Best value for serious traders",
                  features: ["Everything in Weekly", "Priority API Access", "Advanced Trend Analysis", "Email & Priority Support"]
                };
            
            return (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -5 }}
                className={`bg-surface border rounded-2xl p-xl flex flex-col relative ${
                  isCurrent ? 'border-primary shadow-xl' : 'border-outline-variant/30'
                }`}
              >
                {plan.id === 'monthly' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                
                <h3 className="font-headline-sm text-2xl text-on-surface mb-xs">{plan.display_label}</h3>
                <p className="font-body-sm text-on-surface-variant mb-lg">{details.description}</p>
                
                <div className="mb-xl flex items-end gap-2">
                  <span className="font-headline-lg text-5xl text-on-surface">
                    {price}
                  </span>
                  <span className="font-body-md text-on-surface-variant mb-1">
                    {plan.id === 'weekly' ? '/ week' : '/ mo'}
                  </span>
                </div>

                <ul className="space-y-md mb-xl flex-1">
                  {details.features.map((feat: string, i: number) => (
                    <li key={i} className="flex items-start gap-sm text-on-surface-variant font-body-md">
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleSubscribe(plan.id as 'weekly' | 'monthly')}
                  disabled={isProcessing || isCurrent}
                  className={`w-full py-3 rounded-xl font-label-md transition-all ${
                    isCurrent 
                      ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'
                      : 'bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container shadow-md'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : isProcessing ? 'Processing...' : 'Subscribe'}
                </button>
              </motion.div>
            );
          })}
        </div>
        
        <p className="text-center text-sm text-on-surface-variant/60 font-body-sm pt-lg">
          Payments are securely processed by Razorpay. By subscribing, you agree to our Terms of Service.
        </p>

      </div>
    </div>
  );
}
