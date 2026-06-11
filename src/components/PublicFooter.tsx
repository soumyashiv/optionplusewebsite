import { Link } from 'react-router-dom';

export function PublicFooter() {
  return (
    <footer className="bg-surface border-t border-outline-variant/20 pt-xl pb-lg px-gutter mt-auto">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-lg border-b border-outline-variant/10 pb-lg mb-lg">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">candlestick_chart</span>
          <span className="font-headline-sm text-lg font-bold text-on-surface">OptionPluse</span>
        </div>
        <div className="flex gap-lg font-label-sm text-on-surface-variant flex-wrap">
          <Link to="/pricing" className="hover:text-primary">Pricing</Link>
          <a href="#" className="hover:text-primary">Twitter / X</a>
          <a href="#" className="hover:text-primary">LinkedIn</a>
          <a href="#" className="hover:text-primary">Documentation</a>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md font-body-sm text-xs text-outline">
        <p>© {new Date().getFullYear()} OptionPluse Institutional Systems. All Rights Reserved.</p>
        <div className="flex gap-md">
          <a href="#" className="hover:text-on-surface">Privacy</a>
          <a href="#" className="hover:text-on-surface">Terms</a>
          <a href="#" className="hover:text-on-surface">Disclosures</a>
        </div>
      </div>
    </footer>
  );
}
