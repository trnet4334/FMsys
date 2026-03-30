import { TrendingUp, TrendingDown } from 'lucide-react'

import { WATCHLIST_TICKERS } from '../../lib/mock-data/watchlist'

export function WatchlistPanel() {
  return (
    <section className="rounded-2xl bg-card border border-line shadow-soft overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-line flex items-center justify-between bg-bg-1/40">
        <div className="flex items-center gap-2.5">
          <span
            className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] animate-pulse"
            aria-hidden="true"
          />
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-disabled">
            Watchlist
          </h2>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          LIVE
        </span>
      </div>

      {/* Rows */}
      <ul className="divide-y divide-line">
        {WATCHLIST_TICKERS.map((ticker) => {
          const maxH = Math.max(...ticker.sparkline)
          return (
            <li
              key={ticker.symbol}
              className="px-6 py-3.5 flex items-center justify-between hover:bg-bg-1/50 transition-colors"
            >
              {/* Left: symbol + category badge */}
              <div className="flex items-center">
                <span className="text-sm font-black text-ink-0 font-mono">
                  {ticker.symbol}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-bg-0 text-ink-disabled border border-line ml-2">
                  {ticker.category}
                </span>
              </div>

              {/* Middle: mini bar sparkline */}
              <div className="flex items-end gap-0.5 mx-4 opacity-40" aria-hidden="true">
                {ticker.sparkline.map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-sm ${ticker.positive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ height: `${Math.round((h / maxH) * 20)}px` }}
                  />
                ))}
              </div>

              {/* Right: price + change badge */}
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-bold text-ink-0 tabular-nums">
                  {ticker.price}
                </span>
                <span
                  className={[
                    'inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    ticker.positive
                      ? 'text-emerald-500 bg-emerald-500/10'
                      : 'text-rose-500 bg-rose-500/10',
                  ].join(' ')}
                >
                  {ticker.positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {ticker.change}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
