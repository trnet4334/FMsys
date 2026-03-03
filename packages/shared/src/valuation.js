function toBaseRateKey(currency, baseCurrency) {
  return `${currency}_${baseCurrency}`;
}

export function valuateHoldings({ holdings, rates, baseCurrency = 'TWD' }) {
  return holdings.map((holding) => {
    const quantity = Number(holding.quantity ?? 0);
    const currentPrice = Number(holding.currentPrice ?? 0);
    const marketValueLocal = quantity * currentPrice;

    let marketValueBase = marketValueLocal;
    if (holding.currency !== baseCurrency) {
      const rate = Number(rates[toBaseRateKey(holding.currency, baseCurrency)] ?? 1);
      marketValueBase = marketValueLocal * rate;
    }

    return {
      ...holding,
      marketValueLocal,
      marketValueBase,
    };
  });
}
