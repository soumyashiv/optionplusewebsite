
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PublicNav } from '../components/PublicNav';
import { PublicFooter } from '../components/PublicFooter';
import { useAuthStore } from '../auth/authStore';

export function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background selection:bg-primary selection:text-on-primary">
      {/* Landing Navigation */}
      <PublicNav />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-xxl pb-xxl lg:pt-32 lg:pb-32 px-gutter">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-secondary-container/20 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center gap-xxl relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex-1 text-center lg:text-left space-y-lg"
            >
              <div className="inline-flex items-center gap-xs px-sm py-1 bg-surface-container-low border border-outline-variant/30 rounded-full font-label-sm text-primary mb-md">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed"></span>
                v2.4 Institutional Engine Live
              </div>
              <h1 className="font-headline-lg text-5xl lg:text-7xl tracking-tight text-on-surface">
                Trade with <span className="text-primary italic">institutional</span> precision.
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto lg:mx-0">
                OptionPluse delivers raw market data, multi-factor algorithmic signals, and sub-millisecond execution directly to your browser. Say goodbye to retail lag.
              </p>
              <div className="flex flex-col sm:flex-row gap-md justify-center lg:justify-start pt-md">
                <button 
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
                  className="bg-primary text-on-primary font-label-md text-lg px-8 py-4 rounded-full hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-sm group"
                >
                  Open Dashboard 
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button className="bg-surface border border-outline-variant/50 text-on-surface font-label-md text-lg px-8 py-4 rounded-full hover:bg-surface-container-low transition-colors">
                  View Data Specs
                </button>
              </div>
              <div className="pt-lg flex items-center justify-center lg:justify-start gap-md text-on-surface-variant font-label-sm">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-surface-variant border-2 border-background flex items-center justify-center text-[10px]">👤</div>
                  ))}
                </div>
                <span>Trusted by 10,000+ proprietary traders</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="flex-1 w-full max-w-2xl relative"
            >
              {/* Abstract Dashboard Visual */}
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-md shadow-2xl overflow-hidden aspect-[4/3] relative flex flex-col gap-sm">
                <div className="flex gap-2 items-center mb-sm px-xs">
                  <div className="w-3 h-3 rounded-full bg-error/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-primary/50"></div>
                </div>
                <div className="flex gap-sm flex-1">
                  <div className="w-1/3 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-sm flex flex-col gap-sm">
                    <div className="h-6 w-24 bg-surface-variant rounded"></div>
                    <div className="h-4 w-16 bg-surface-variant/50 rounded mb-md"></div>
                    <div className="h-12 w-full bg-primary/10 rounded border border-primary/20"></div>
                    <div className="h-12 w-full bg-error/5 rounded border border-error/10"></div>
                    <div className="h-12 w-full bg-primary/10 rounded border border-primary/20"></div>
                  </div>
                  <div className="flex-1 bg-surface-container-lowest border border-outline-variant/20 rounded-lg p-md relative overflow-hidden flex flex-col">
                     <div className="h-6 w-48 bg-surface-variant rounded mb-lg"></div>
                     <div className="flex-1 flex items-end justify-between gap-1 opacity-50 px-md">
                        {[40, 65, 45, 80, 55, 90, 70, 100].map((h, i) => (
                           <div key={i} className="w-full bg-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
                        ))}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest to-transparent"></div>
                  </div>
                </div>
                {/* Floating element */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-12 right-12 bg-secondary-container text-on-secondary-container border border-secondary p-sm rounded-lg shadow-lg font-label-md flex items-center gap-sm"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Order Executed 0.4ms
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="bg-surface-container-low py-xxl px-gutter">
          <div className="max-w-screen-xl mx-auto space-y-xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-headline-md text-3xl lg:text-4xl text-on-surface mb-md">Engineered for alpha generation</h2>
              <p className="font-body-md text-on-surface-variant">
                We've abstracted the complexity of institutional data infrastructure so you can focus strictly on your trading strategy.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-lg flex flex-col gap-md hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">data_exploration</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface">Tick-Level Options Chain</h3>
                <p className="font-body-md text-on-surface-variant">
                  Stream Greek values, IV crush metrics, and multi-leg strategies with zero-latency WebSocket feeds.
                </p>
              </div>
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-lg flex flex-col gap-md hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">memory</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface">7-Factor Algorithms</h3>
                <p className="font-body-md text-on-surface-variant">
                  Our proprietary scoring engine analyzes PCR, OI walls, and Max Pain concurrently to generate actionable entry signals.
                </p>
              </div>
              <div className="bg-surface border border-outline-variant/30 rounded-2xl p-lg flex flex-col gap-md hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">dashboard_customize</span>
                </div>
                <h3 className="font-headline-sm text-xl text-on-surface">Dynamic Workspaces</h3>
                <p className="font-body-md text-on-surface-variant">
                  Arrange your multi-monitor setups with our fully modular, state-preserved widget architecture.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
