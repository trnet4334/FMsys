export type WatchlistTicker = {
  symbol: string;
  category: string;
  price: string;
  change: string;
  positive: boolean;
  sparkline: number[];
};

export const WATCHLIST_TICKERS: WatchlistTicker[] = [
  { symbol: 'S&P 500', category: 'INDEX',     price: '5,218.19', change: '+0.87%',  positive: true,  sparkline: [60, 70, 65, 80, 75, 85, 90] },
  { symbol: 'TSLA',    category: 'Stock',     price: '248.50',   change: '+5.40%',  positive: true,  sparkline: [50, 60, 55, 70, 65, 80, 90] },
  { symbol: 'AAPL',    category: 'Stock',     price: '189.30',   change: '+2.10%',  positive: true,  sparkline: [70, 65, 75, 72, 78, 80, 85] },
  { symbol: 'NVDA',    category: 'Stock',     price: '875.40',   change: '+12.30%', positive: true,  sparkline: [40, 55, 60, 70, 75, 85, 95] },
  { symbol: 'BTC',     category: 'Crypto',    price: '68,200',   change: '-4.30%',  positive: false, sparkline: [90, 85, 80, 70, 65, 55, 50] },
  { symbol: 'ETH',     category: 'Crypto',    price: '3,540',    change: '-2.10%',  positive: false, sparkline: [80, 75, 70, 60, 55, 50, 45] },
  { symbol: 'Gold',    category: 'Commodity', price: '2,310.50', change: '+0.40%',  positive: true,  sparkline: [60, 62, 65, 63, 68, 66, 70] },
];
