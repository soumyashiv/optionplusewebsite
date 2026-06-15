import { useWatchlistQuery, useWatchlistMutations } from '../../../hooks/queries';
import { useMarketStore } from '../../../store/useMarketStore';

export function AnalystWatchlist() {
  const { data: items = [], isLoading, error } = useWatchlistQuery();
  const { addMutation, removeMutation } = useWatchlistMutations();
  const { symbol } = useMarketStore();

  const handleRemove = async (id: string) => {
    await removeMutation.mutateAsync(id);
  };

  const handleAdd = async () => {
    const strikeStr = window.prompt(`Enter ${symbol} strike price to add:`, '22000');
    if (!strikeStr) return;
    const strike = parseInt(strikeStr, 10);
    if (isNaN(strike)) {
      alert('Invalid strike price');
      return;
    }
    const typeStr = window.prompt(`Enter option type (CE or PE):`, 'CE');
    if (!typeStr) return;
    const optionType = typeStr.toUpperCase();
    if (optionType !== 'CE' && optionType !== 'PE') {
      alert('Invalid option type. Must be CE or PE.');
      return;
    }
    
    await addMutation.mutateAsync({
      symbol,
      strike,
      option_type: optionType
    });
  };

  return (
    <section>
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm">
        
        {/* Watchlist Header */}
        <div className="bg-surface-container-low px-md py-sm flex justify-between items-center border-b border-outline-variant/30">
          <div className="flex items-center gap-md">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">My Watchlist</h3>
            <div className="bg-surface border border-outline-variant/30 rounded px-sm py-1 flex items-center gap-2 cursor-pointer hover:bg-surface-variant/50 transition-colors">
              <span className="font-body-sm text-sm text-on-surface">Default (Overall)</span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_drop_down</span>
            </div>
          </div>
          <button 
            onClick={handleAdd}
            className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Strike
          </button>
        </div>
        
        {/* Watchlist Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-lg text-center text-on-surface-variant">Loading watchlist...</div>
          ) : error ? (
            <div className="text-red-500 font-label-sm p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800/30">
              {error instanceof Error ? error.message : String(error)}
            </div>
          ) : items.length === 0 ? (
            <div className="p-lg text-center text-on-surface-variant">Your watchlist is empty.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">Instrument</th>
                  <th className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-center">Type</th>
                  <th className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-right">LTP</th>
                  <th className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-center">OI Signal</th>
                  <th className="px-md py-sm font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {items.map((item) => {
                  const changeVal = item.change || 0;
                  const isUp = changeVal >= 0;
                  const changeColor = isUp ? 'text-green-600' : 'text-red-600';
                  // A null ltp with no oi_label indicates this strike is outside ATM±5
                  const isOutOfRange = item.ltp === null && !item.oi_label;
                  
                  return (
                    <tr key={item.id} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="px-md py-sm font-body-md font-bold text-on-surface">
                        {item.symbol} {item.strike.toLocaleString()}
                      </td>
                      <td className="px-md py-sm text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${item.option_type === 'CE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.option_type}
                        </span>
                      </td>
                      {isOutOfRange ? (
                        <td colSpan={2} className="px-md py-sm">
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-1 rounded-full">
                            <span className="material-symbols-outlined text-xs">info</span>
                            Outside ATM ±5 monitoring range
                          </span>
                        </td>
                      ) : (
                        <>
                          <td className="px-md py-sm text-right font-mono">
                            <span className="font-medium">{item.ltp !== null ? item.ltp.toFixed(2) : '—'}</span>
                            {item.change !== null && (
                              <span className={`${changeColor} text-xs ml-2`}>
                                {isUp ? '+' : ''}{item.change.toFixed(1)}%
                              </span>
                            )}
                          </td>
                          <td className="px-md py-sm text-center font-body-sm">
                            <span className="text-xs text-on-surface-variant bg-surface-container rounded px-sm py-0.5">
                              {item.oi_label || 'Neutral'}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="px-md py-sm text-right flex items-center justify-end gap-sm">
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="text-on-surface-variant hover:text-error transition-colors p-1 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-md">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
