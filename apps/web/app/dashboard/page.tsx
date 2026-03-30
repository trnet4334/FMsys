import { cookies } from 'next/headers';

import { AlertsPanel }          from '../../src/components/dashboard/alerts-panel';
import { NetWorthHero }         from '../../src/components/dashboard/net-worth-hero';
import { PortfolioReturnPanel } from '../../src/components/dashboard/portfolio-return-panel';
import { QuickActionsPanel }    from '../../src/components/dashboard/quick-actions-panel';
import { RecentActivityPanel }  from '../../src/components/dashboard/recent-activity-panel';
import { TrendPanel }           from '../../src/components/dashboard/trend-panel';
import { GoalsPanel }           from '../../src/components/dashboard/goals-panel';
import { UpcomingEventsPanel }  from '../../src/components/dashboard/upcoming-events-panel';
import { WatchlistPanel }       from '../../src/components/dashboard/watchlist-panel';
import { AppShell }             from '../../src/components/layout/app-shell';
import { fetchDashboardData }   from '../../src/lib/dashboard-api';
import { adaptDashboardData }   from '../../src/lib/mock-data/adapters';
import { seedDashboardData }    from '../../src/lib/mock-data/seed';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('fm_session_id')?.value ?? null;
  let data;

  try {
    data = await fetchDashboardData({ sessionId });
  } catch {
    data = adaptDashboardData(seedDashboardData());
  }

  return (
    <AppShell>
      {/* Row 1: Net worth hero */}
      <NetWorthHero snapshot={data.snapshot} />

      {/* Row 2: Portfolio P&L return cards */}
      <PortfolioReturnPanel />

      {/* Row 3: Trend chart */}
      <TrendPanel points={data.trend} />

      {/* Row 4: Watchlist + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <WatchlistPanel />
        </div>
        <AlertsPanel alerts={data.alerts} />
      </div>

      {/* Row 5: Recent activity + Goals + Upcoming events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <RecentActivityPanel />
        </div>
        <div className="flex flex-col gap-6">
          <GoalsPanel />
          <UpcomingEventsPanel />
        </div>
      </div>

      {/* Row 6: Quick actions */}
      <QuickActionsPanel />
    </AppShell>
  );
}
