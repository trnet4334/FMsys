export class ExchangeRatesProvider {
  constructor({ providers = [] } = {}) {
    this.providers = providers;
    this.cache = new Map();
  }

  async getRates(date) {
    if (this.cache.has(date)) {
      return this.cache.get(date);
    }

    let lastError;
    for (const provider of this.providers) {
      try {
        const rates = await provider(date);
        this.cache.set(date, rates);
        return rates;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError ?? new Error('no providers configured');
  }
}
