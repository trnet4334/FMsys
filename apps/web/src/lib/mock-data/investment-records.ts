export type InvestmentRecord = {
  id: string;
  date: string;       // ISO date string e.g. "2025-03-18"
  name: string;       // Ticker / instrument e.g. "NVDA", "BTC", "USD/JPY"
  subName?: string;   // Optional description e.g. "NVIDIA Corp."
  type: 'Stock' | 'Crypto' | 'Forex' | 'Options';
  return?: number;    // Absolute P&L (TWD) — omit when status is 'ongoing'
  returnPct?: number; // e.g. 0.082 = 8.2% — omit when status is 'ongoing'
  status: 'closed' | 'ongoing';
};

export function seedInvestmentRecords(): InvestmentRecord[] {
  return [
    // ── March 2025 ────────────────────────────────────────────────
    { id: 'inv-1', date: '2025-03-25', name: 'AAPL 200C', subName: 'Call Option · Mar expiry', type: 'Options', return: 320,  returnPct:  0.125, status: 'closed'  },
    { id: 'inv-2', date: '2025-03-10', name: 'TSLA',      subName: 'Tesla Inc.',                type: 'Stock',   return: 680,  returnPct:  0.057, status: 'closed'  },
    { id: 'inv-3', date: '2025-03-03', name: 'USD/JPY',   subName: 'Forex',                     type: 'Forex',   return: -95,  returnPct: -0.011, status: 'closed'  },
    { id: 'inv-4', date: '2025-03-18', name: 'NVDA',      subName: 'NVIDIA Corp.',              type: 'Stock',                                    status: 'ongoing' },
    { id: 'inv-5', date: '2025-03-12', name: 'BTC',       subName: 'Bitcoin',                   type: 'Crypto',                                   status: 'ongoing' },
    // ── February 2025 ─────────────────────────────────────────────
    { id: 'inv-6', date: '2025-02-22', name: 'ETH',       subName: 'Ethereum',                  type: 'Crypto',  return: -156, returnPct: -0.032, status: 'closed'  },
    { id: 'inv-7', date: '2025-02-14', name: 'MSFT',      subName: 'Microsoft Corp.',           type: 'Stock',   return: 910,  returnPct:  0.063, status: 'closed'  },
    { id: 'inv-8', date: '2025-02-05', name: 'EUR/USD',   subName: 'Forex',                     type: 'Forex',                                    status: 'ongoing' },
  ];
}
