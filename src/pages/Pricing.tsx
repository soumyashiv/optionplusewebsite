import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';
import { usePlansQuery } from '../hooks/queries';

export function Pricing() {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(true);
  const { data: plansData, isLoading } = usePlansQuery();


  const faqs = [
    {
      q: 'Can I switch plans later?',
      a: 'Absolutely. You can upgrade or downgrade your plan at any time. Prorated charges or credits will be applied automatically.'
    },
    {
      q: 'Do you offer refunds?',
      a: 'We offer a 14-day money-back guarantee for all new subscriptions. If you\'re not satisfied, just contact support.'
    },
    {
      q: 'What is included in the AI signals?',
      a: 'Our AI engine analyzes order flow, Greeks (PCR, Max Pain), and historical patterns to generate probability-weighted entry and exit signals in real-time.'
    },
    {
      q: 'Is API access available on lower tiers?',
      a: 'Currently, full REST and WebSocket API access is reserved for Enterprise clients due to the infrastructure requirements of tick-level data.'
    }
  ];

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background selection:bg-primary selection:text-on-primary">
      <PublicNav />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-xxl pb-xl px-gutter text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto relative z-10 space-y-lg">
            <h1 className="font-headline-lg text-5xl lg:text-6xl text-on-surface tracking-tight">
              Pricing that scales with your <span className="text-primary italic">alpha</span>.
            </h1>
            <p className="font-body-lg text-on-surface-variant text-lg lg:text-xl">
              Choose the tier that fits your trading volume. From retail to institutional API pipelines, we have you covered.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-md pt-lg">
              <span className={`font-label-md transition-colors ${!isYearly ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                Monthly
              </span>
              <button 
                onClick={() => setIsYearly(!isYearly)}
                className="w-16 h-8 bg-surface-container-high rounded-full p-1 relative flex items-center shadow-inner cursor-pointer"
              >
                <motion.div 
                  className="w-6 h-6 bg-primary rounded-full shadow-md"
                  animate={{ x: isYearly ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-sm">
                <span className={`font-label-md transition-colors ${isYearly ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                  Yearly
                </span>
                <span className="inline-block bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-xl px-gutter relative z-10">
          <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-lg items-end">
            {isLoading ? (
              <div className="col-span-1 md:col-span-2 xl:col-span-4 flex justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              (plansData || []).map((plan: any) => {
                const highlighted = plan.tier_name === 'Pro' || plan.tier_name === 'Elite Trader';
                const monthlyPrice = plan.monthlyPrice ?? plan.monthly_price;
                const yearlyPrice = plan.yearlyPrice ?? plan.yearly_price;
                
                return (
                  <div 
                    key={plan.tier_name} 
                    className={`relative flex flex-col h-full bg-surface rounded-2xl transition-all duration-300 ${
                      highlighted 
                        ? 'border-2 border-primary shadow-xl scale-100 xl:scale-105 z-10' 
                        : 'border border-outline-variant/30 hover:border-outline-variant/80'
                    }`}
                  >
                    {highlighted && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary font-label-sm text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="p-xl flex-1 flex flex-col">
                      <h3 className="font-headline-sm text-2xl text-on-surface mb-2">{plan.tier_name}</h3>
                      <p className="font-body-sm text-on-surface-variant min-h-[48px]">{plan.description}</p>
                      
                      <div className="my-lg">
                        {monthlyPrice === 0 && yearlyPrice === 0 && plan.tier_name !== 'Free' ? (
                          <div className="font-headline-lg text-4xl text-on-surface h-[56px] flex items-center">
                            Custom
                          </div>
                        ) : (
                          <div className="flex items-end gap-1 h-[56px]">
                            <span className="font-headline-lg text-5xl text-on-surface tracking-tight">
                              ${isYearly ? yearlyPrice : monthlyPrice}
                            </span>
                            <span className="font-body-sm text-on-surface-variant mb-2">
                              {plan.tier_name.toLowerCase() === 'weekly' ? '/wk' : '/mo'}
                            </span>
                          </div>
                        )}
                        
                        <div className="h-4 mt-1">
                          <AnimatePresence>
                            {isYearly && monthlyPrice !== 0 && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="font-label-sm text-primary text-xs"
                              >
                                Billed ${Number(yearlyPrice) * 12} yearly
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <ul className="space-y-md flex-1 mb-xl">
                        {(plan.features || []).map((feat: string, j: number) => (
                          <li key={j} className="flex items-start gap-sm font-body-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <button 
                        onClick={() => navigate('/signup')}
                        className={`w-full py-3 px-4 rounded-xl font-label-md transition-all ${
                          highlighted 
                            ? 'bg-primary text-on-primary shadow-md hover:bg-primary-container hover:text-on-primary-container' 
                            : 'bg-transparent border border-outline text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        {plan.monthlyPrice === 0 ? 'Get Started' : 'Start Free Trial'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Logos / Trust */}
        <section className="py-xxl px-gutter border-y border-outline-variant/10 bg-surface-container-lowest mt-xl">
          <div className="max-w-screen-xl mx-auto text-center space-y-lg">
            <h3 className="font-label-md text-on-surface-variant uppercase tracking-widest text-sm">
              Trusted by quantitative desks at
            </h3>
            <div className="flex flex-wrap justify-center items-center gap-xl md:gap-xxl opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Mock logos using typography */}
              <div className="font-headline-sm text-2xl font-bold tracking-tighter">VANGUARD</div>
              <div className="font-headline-sm text-2xl font-black italic">CITADEL</div>
              <div className="font-headline-sm text-2xl font-serif">Bridgewater</div>
              <div className="font-headline-sm text-2xl tracking-widest">TWO SIGMA</div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-xxl px-gutter">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline-md text-3xl lg:text-4xl text-center text-on-surface mb-xl">
              Frequently Asked Questions
            </h2>
            <div className="space-y-md">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-surface border border-outline-variant/30 rounded-xl p-lg">
                  <h3 className="font-headline-sm text-xl text-on-surface mb-sm">{faq.q}</h3>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
