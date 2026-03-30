export interface DashboardData {
  snapshot: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
    deltaPct?: number;
    currency?: string;
  };
  trend: Array<{ date: string; netWorth: number }>;
  allocation: Array<{ category: string; pct: number; amount: number }>;
  alerts: Array<{ id: string; message: string; level: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fetchDashboardData(opts: { sessionId?: string | null }): Promise<DashboardData>;
