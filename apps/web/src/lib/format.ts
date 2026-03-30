/** Number formatter — no decimal places (for asset values, cashflow totals). */
export const fmt = new Intl.NumberFormat('en-US');

/** Currency formatter — always 2 decimal places (for transaction amounts). */
export const fmtCurrency = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 });

/** Format ISO date string to "Mar 25, 2025" style. */
export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Format date to "March 2025" style. */
export function fmtMonthYear(year: number, month: number): string {
  return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
