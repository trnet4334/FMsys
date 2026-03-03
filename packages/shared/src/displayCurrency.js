function getRate(exchangeRates, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;

  const direct = exchangeRates[`${fromCurrency}_${toCurrency}`];
  if (direct) return Number(direct);

  const inverse = exchangeRates[`${toCurrency}_${fromCurrency}`];
  if (inverse) return 1 / Number(inverse);

  throw new Error(`missing exchange rate ${fromCurrency}_${toCurrency}`);
}

export function toDisplayCurrency(snapshot, targetCurrency) {
  const sourceCurrency = snapshot.currency ?? 'TWD';
  const rate = getRate(snapshot.exchangeRates ?? {}, sourceCurrency, targetCurrency);

  return {
    ...snapshot,
    currency: targetCurrency,
    totalAssets: Number(snapshot.totalAssets) * rate,
    totalLiabilities: Number(snapshot.totalLiabilities ?? 0) * rate,
    netWorth: Number(snapshot.netWorth) * rate,
  };
}
