import { useState, useMemo } from 'react';
import { useCurrentSessionQuery, useSessionRecordsQuery } from '../../hooks/queries';
import { useMarketStore } from '../../store/useMarketStore';
import { supabase } from '../../auth/supabaseClient';
import { AnalystWatchlist } from './components/DataWatchlist';

type SortKey = 'fetched_at' | 'strike' | 'call_oi' | 'call_coi' | 'put_oi' | 'put_coi' | 'call_iv' | 'put_iv' | 'call_ltp' | 'put_ltp';
type SortDir = 'asc' | 'desc';

export function DataPage() {
  const { symbol } = useMarketStore();
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(50);
  const [interval, setIntervalVal] = useState('realtime');
  const [search, setSearch]       = useState('');
  const [sortKey, setSortKey]     = useState<SortKey>('fetched_at');
  const [sortDir, setSortDir]     = useState<SortDir>('desc');

  const { data: session, isLoading: sessionLoading, error: sessionError } =
    useCurrentSessionQuery(symbol);

  const { data: recordsData, isLoading: recordsLoading, isFetching } =
    useSessionRecordsQuery(session?.id, interval, page, pageSize);

  const records      = recordsData?.data  || [];
  const totalRecords = recordsData?.total || 0;
  const totalPages   = recordsData?.total_pages || 1;

  // Client-side search + sort on the current page
  const displayed = useMemo(() => {
    let rows = [...records] as any[];
    if (search.trim()) {
      const q = search.trim();
      rows = rows.filter((r) =>
        String(r.strike ?? '').includes(q) || String(r.fetched_at ?? '').includes(q)
      );
    }
    rows.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [records, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return <span className="material-symbols-outlined text-xs opacity-30">unfold_more</span>;
    return (
      <span className="material-symbols-outlined text-xs text-primary">
        {sortDir === 'asc' ? 'expand_less' : 'expand_more'}
      </span>
    );
  };

  const handleExport = async (format: 'csv' | 'json') => {
    if (!session?.id) return;
    const { data: { session: authSession } } = await supabase.auth.getSession();
    const token = authSession?.access_token || '';
    
    try {
      const response = await fetch(`/api/v1/sessions/${session.id}/export?format=${format}&interval=${interval}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `session_${session.id.substring(0,8)}_${interval}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to export data');
    }
  };

  const isLoading = sessionLoading || recordsLoading;
  const error     = sessionError ? (sessionError as Error).message : null;

  const TH = ({ label, k }: { label: string; k: SortKey }) => (
    <th
      onClick={() => handleSort(k)}
      className="p-4 border-b border-outline-variant font-medium text-right cursor-pointer hover:text-primary select-none"
    >
      <span className="inline-flex items-center gap-1 justify-end">{label} {sortIcon(k)}</span>
    </th>
  );

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <header className="px-gutter py-md lg:px-margin-desktop lg:py-lg border-b border-outline-variant/20 bg-surface/50 backdrop-blur-sm z-10 sticky top-0 flex justify-between items-center">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-xs flex items-center gap-3">
            Session Data Inspector
            <select
              className="bg-surface-variant border border-outline-variant rounded px-2 py-1 text-sm font-label-md"
              value={symbol}
              onChange={(e) => useMarketStore.getState().setSymbol(e.target.value)}
            >
              <option value="NIFTY">NIFTY</option>
              <option value="BANKNIFTY">BANKNIFTY</option>
              <option value="FINNIFTY">FINNIFTY</option>
            </select>
          </h2>
          <p className="font-body-md text-on-surface-variant">
            View raw market data stored in Supabase during the current trading session.
          </p>
        </div>
        {session && (
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('json')}
              className="bg-surface-variant text-on-surface px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-surface-variant/80 transition-colors border border-outline-variant"
            >
              <span className="material-symbols-outlined text-sm">code</span>
              JSON
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              CSV
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-gutter lg:px-margin-desktop py-lg space-y-xl">

        {/* Session Meta */}
        <section className="bg-surface border border-outline-variant rounded-2xl p-6">
          <h3 className="font-title-lg text-title-lg text-on-surface mb-4">Current Session Metadata</h3>
          {sessionLoading && !session ? (
            <div className="animate-pulse flex gap-4">
              <div className="h-6 bg-surface-variant rounded w-32"></div>
              <div className="h-6 bg-surface-variant rounded w-48"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 font-body-md">{error}</div>
          ) : session ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="block text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Status</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {session.status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="block text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Symbol</span>
                <span className="font-body-lg text-on-surface font-semibold">{session.symbol}</span>
              </div>
              <div>
                <span className="block text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Started At</span>
                <span className="font-body-md text-on-surface">{new Date(session.start_time).toLocaleTimeString()}</span>
              </div>
              <div>
                <span className="block text-on-surface-variant font-label-sm uppercase tracking-wider mb-1">Total Records</span>
                <span className="font-body-lg text-on-surface font-semibold">{totalRecords.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div className="text-on-surface-variant font-body-md">No active session found for {symbol} today.</div>
          )}
        </section>

        {/* Watchlist */}
        <section className="mt-8 mb-8">
          <AnalystWatchlist />
        </section>

        {/* Data Table */}
        <section className="bg-surface border border-outline-variant rounded-2xl overflow-hidden flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-surface-container-low">
            <h3 className="font-title-lg text-title-lg text-on-surface flex items-center gap-2">
              Time-Series Records
              {isFetching && <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block"></span>}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
                <input
                  type="text"
                  placeholder="Search strike / time..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-surface border border-outline-variant rounded pl-7 pr-3 py-1 text-sm outline-none w-44"
                />
              </div>
              {/* Interval */}
              <select
                value={interval}
                onChange={(e) => { setIntervalVal(e.target.value); setPage(1); }}
                className="bg-surface border border-outline-variant rounded px-2 py-1 text-sm outline-none"
              >
                <option value="realtime">Realtime</option>
                <option value="5m">5 Minute</option>
                <option value="15m">15 Minute</option>
                <option value="30m">30 Minute</option>
                <option value="1h">1 Hour</option>
              </select>
              {/* Page size */}
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-surface border border-outline-variant rounded px-2 py-1 text-sm outline-none"
              >
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-variant/30 text-on-surface-variant font-label-md">
                  <th
                    onClick={() => handleSort('fetched_at')}
                    className="p-4 border-b border-outline-variant font-medium cursor-pointer hover:text-primary select-none"
                  >
                    <span className="inline-flex items-center gap-1">Timestamp {sortIcon('fetched_at')}</span>
                  </th>
                  <TH label="Strike"   k="strike"   />
                  <TH label="Call OI"  k="call_oi"  />
                  <TH label="Call COI" k="call_coi" />
                  <TH label="Put OI"   k="put_oi"   />
                  <TH label="Put COI"  k="put_coi"  />
                  <TH label="Call IV"  k="call_iv"  />
                  <TH label="Put IV"   k="put_iv"   />
                  <TH label="Call LTP" k="call_ltp" />
                  <TH label="Put LTP"  k="put_ltp"  />
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface divide-y divide-outline-variant/30">
                {displayed.length > 0 ? (
                  displayed.map((record: any, i: number) => (
                    <tr key={record.id || i} className="hover:bg-surface-variant/20 transition-colors">
                      <td className="p-4 text-on-surface-variant text-xs">
                        {new Date(record.fetched_at || record.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-4 text-right font-mono font-bold">{record.strike ?? '—'}</td>
                      <td className="p-4 text-right font-mono text-red-600 dark:text-red-400">
                        {record.call_oi != null ? Number(record.call_oi).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {record.call_coi != null ? Number(record.call_coi).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-right font-mono text-green-600 dark:text-green-400">
                        {record.put_oi != null ? Number(record.put_oi).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {record.put_coi != null ? Number(record.put_coi).toLocaleString() : '—'}
                      </td>
                      <td className="p-4 text-right font-mono text-amber-600 dark:text-amber-400">
                        {record.call_iv != null ? Number(record.call_iv).toFixed(2) : '—'}
                      </td>
                      <td className="p-4 text-right font-mono text-amber-600 dark:text-amber-400">
                        {record.put_iv != null ? Number(record.put_iv).toFixed(2) : '—'}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {record.call_ltp != null ? Number(record.call_ltp).toFixed(2) : '—'}
                      </td>
                      <td className="p-4 text-right font-mono">
                        {record.put_ltp != null ? Number(record.put_ltp).toFixed(2) : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-on-surface-variant">
                      {isLoading ? 'Loading records...' : 'No records collected yet in this session.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <div className="text-sm text-on-surface-variant">
                Page <span className="font-bold text-on-surface">{page}</span> of{' '}
                <span className="font-bold text-on-surface">{totalPages}</span>
                {' '}({totalRecords.toLocaleString()} records)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-outline-variant disabled:opacity-50 hover:bg-surface-variant/50 transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-outline-variant disabled:opacity-50 hover:bg-surface-variant/50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="h-16"></div>
      </div>
    </main>
  );
}
