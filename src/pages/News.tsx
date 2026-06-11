import { useState } from 'react';
import { useNewsQuery } from '../hooks/queries';
import { formatNewsTime } from '../services/newsService';

function sentimentBadge(sentiment?: string) {
  if (sentiment === 'positive') return 'bg-green-600';
  if (sentiment === 'negative') return 'bg-red-600';
  return 'bg-surface-container-high text-on-surface-variant';
}

export function News() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const { data, isLoading, error, refetch } = useNewsQuery(filter === 'all' ? undefined : filter);
  const news = data?.items || [];

  const filters = [
    { key: 'all', label: 'All News' },
    { key: 'positive', label: 'Bullish' },
    { key: 'negative', label: 'Bearish' },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-md lg:p-gutter bg-background">
      <div className="max-w-screen-2xl mx-auto space-y-gutter">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md border-b border-outline-variant/20 pb-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mb-unit">
              Market News & Analysis
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Real-time updates, economic events, and institutional commentary.
            </p>
          </div>
          <div className="flex gap-sm">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key as 'all' | 'positive' | 'negative')}
                className={filter === f.key
                  ? 'bg-secondary-container text-on-secondary-container font-label-md text-label-md px-md py-xs rounded-full'
                  : 'border border-outline bg-surface text-on-surface font-label-md text-label-md px-md py-xs rounded-full hover:bg-surface-container-low transition-colors'
                }
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-lg flex items-center justify-between">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined">error</span>
              <span className="font-body-md">{(error as Error).message}</span>
            </div>
            <button onClick={() => refetch()} className="bg-error text-on-error font-label-md px-md py-xs rounded-full">Retry</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 space-y-md">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-surface border border-outline-variant/30 rounded-xl p-lg animate-pulse">
                  <div className="h-3 w-20 bg-outline-variant/20 rounded mb-sm"></div>
                  <div className="h-5 w-3/4 bg-outline-variant/20 rounded mb-sm"></div>
                  <div className="h-3 w-full bg-outline-variant/20 rounded mb-xs"></div>
                  <div className="h-3 w-2/3 bg-outline-variant/20 rounded"></div>
                </div>
              ))
            ) : news.length > 0 ? (
              news.map((item, i) => (
                <article key={i} className="bg-surface border border-outline-variant/30 rounded-xl p-md lg:p-lg flex flex-col md:flex-row gap-md hover:border-outline-variant/60 transition-colors group cursor-pointer">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center gap-sm mb-sm">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${sentimentBadge(item.sentiment)}`}>
                        {item.category || item.sentiment || 'News'}
                      </span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[14px]">schedule</span>
                        {formatNewsTime(item.published_at)}
                      </span>
                      {item.source && (
                        <>
                          <span className="text-outline-variant text-xs">•</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{item.source}</span>
                        </>
                      )}
                    </div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-sm">
                      {item.title}
                    </h2>
                    {item.summary && (
                      <p className="font-body-md text-body-md text-on-surface-variant flex-1">{item.summary}</p>
                    )}
                  </div>
                  {item.image && (
                    <div className="md:w-48 h-32 md:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                </article>
              ))
            ) : (
              <div className="bg-surface border border-outline-variant/30 rounded-xl p-lg text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-sm block">article</span>
                <p className="font-body-md">No news articles available right now.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-gutter">
            {/* NOTE: Economic Calendar is static display content by design. No backend API counterpart exists. */}
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-lg">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Economic Calendar</h3>
              <div className="space-y-md">
                {[
                  { time: '14:30', event: 'US Non-Farm Payrolls', impact: 'High', color: 'bg-error text-error' },
                  { time: '14:30', event: 'US Unemployment Rate', impact: 'High', color: 'bg-error text-error' },
                  { time: '19:30', event: 'Fed Member Speech', impact: 'Med', color: 'bg-amber-500 text-amber-500' },
                ].map((ev, i) => (
                  <div key={i} className="flex gap-md items-start">
                    <div className="font-label-sm text-label-sm text-on-surface-variant w-12 pt-0.5">{ev.time}</div>
                    <div className="flex-1">
                      <div className="font-label-md text-label-md text-on-surface">{ev.event}</div>
                      <div className="flex items-center gap-xs mt-1">
                        <div className="flex gap-0.5">
                           <div className={`w-1.5 h-1.5 rounded-full ${ev.color.split(' ')[0]}`}></div>
                           <div className={`w-1.5 h-1.5 rounded-full ${ev.impact === 'High' || ev.impact === 'Med' ? ev.color.split(' ')[0] : 'bg-outline-variant'}`}></div>
                           <div className={`w-1.5 h-1.5 rounded-full ${ev.impact === 'High' ? ev.color.split(' ')[0] : 'bg-outline-variant'}`}></div>
                        </div>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${ev.color.split(' ')[1]}`}>{ev.impact} Impact</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* NOTE: Trending Topics is static display content by design. No backend API counterpart exists. */}
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-lg">
               <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Trending Topics</h3>
               <div className="flex flex-wrap gap-sm">
                 {['#Inflation', '#AI', '#Semiconductors', '#OPEC', '#EarningsSeason', '#Nifty500'].map(tag => (
                   <span key={tag} className="px-sm py-1 bg-surface-container-low border border-outline-variant/30 rounded text-xs text-on-surface-variant hover:text-primary hover:border-primary cursor-pointer transition-colors">
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
