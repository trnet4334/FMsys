'use client';

import { useState } from 'react';

type TrendPoint = { date: string; netWorth: number };

type Period = '1M' | '6M' | '1Y' | 'ALL';

type TrendPanelProps = {
  points: TrendPoint[];
};

const W = 1000;
const H = 200;
const PAD_TOP = 16;
const PAD_BOTTOM = 8;

function toCoords(points: TrendPoint[]): [number, number][] {
  const vals = points.map((p) => p.netWorth);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  return points.map((p, i) => [
    (i / Math.max(points.length - 1, 1)) * W,
    PAD_TOP + chartH - ((p.netWorth - min) / span) * chartH,
  ]);
}

/** Cardinal spline → cubic bezier for smooth curves through all data points */
function buildLinePath(coords: [number, number][], tension = 0.35): string {
  if (coords.length < 2) return '';
  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];
    const cp1x = (p1[0] + (p2[0] - p0[0]) * tension).toFixed(1);
    const cp1y = (p1[1] + (p2[1] - p0[1]) * tension).toFixed(1);
    const cp2x = (p2[0] - (p3[0] - p1[0]) * tension).toFixed(1);
    const cp2y = (p2[1] - (p3[1] - p1[1]) * tension).toFixed(1);
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function buildAreaPath(coords: [number, number][], linePath: string): string {
  if (!linePath) return '';
  return `${linePath} L ${coords[coords.length - 1][0]} ${H} L 0 ${H} Z`;
}

function toMonthLabel(date: string): string {
  const month = parseInt(date.split('-')[1], 10);
  return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][month - 1] ?? '';
}

const PERIODS: Period[] = ['1M', '6M', '1Y', 'ALL'];

export function TrendPanel({ points }: TrendPanelProps) {
  const [period, setPeriod] = useState<Period>('6M');

  const coords = toCoords(points);
  const linePath = buildLinePath(coords);
  const areaPath = buildAreaPath(coords, linePath);
  const last = coords[coords.length - 1];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-card border border-line shadow-soft mb-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-brand/[0.06] blur-3xl rounded-full" />

      {/* Header */}
      <div className="relative px-8 pt-7 pb-0 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="size-1.5 rounded-full bg-brand shadow-[0_0_6px_rgba(0,102,255,0.6)]" />
            <span className="text-base font-bold text-ink-0">Net Worth Trend</span>
          </div>
          <p className="text-2xl font-black text-ink-0 tabular-nums mt-1">TWD 244,902</p>
        </div>

        {/* Period pill selector */}
        <div className="flex bg-bg-0 rounded-xl p-1 border border-line gap-0.5">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                p === period
                  ? 'bg-brand text-white shadow-soft'
                  : 'text-ink-disabled hover:text-ink-1'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-8 pt-6 pb-5 relative">
        <div className="h-64 w-full">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
              </linearGradient>
              <filter id="lineGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={ratio}
                x1="0" y1={H * ratio}
                x2={W} y2={H * ratio}
                stroke="var(--line)"
                strokeOpacity="0.5"
                strokeWidth="1"
              />
            ))}

            {/* Gradient fill area */}
            <path d={areaPath} fill="url(#trendGradient)" />

            {/* Line — glow layer */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />

            {/* Line — clean layer */}
            <path
              d={linePath}
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pulse dot at latest value */}
            {last && (
              <>
                <circle cx={last[0]} cy={last[1]} r="20" fill="var(--brand)" fillOpacity="0.08" />
                <circle cx={last[0]} cy={last[1]} r="12" fill="var(--brand)" fillOpacity="0.2" />
                <circle cx={last[0]} cy={last[1]} r="5" fill="var(--brand)" />
              </>
            )}
          </svg>
        </div>

        {/* X-axis month labels */}
        <div className="flex justify-between mt-4 px-1">
          {points.map((p) => (
            <span
              key={p.date}
              className="text-[10px] font-bold text-ink-disabled uppercase tracking-wider"
            >
              {toMonthLabel(p.date)}
            </span>
          ))}
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent" />
      </div>
    </section>
  );
}
