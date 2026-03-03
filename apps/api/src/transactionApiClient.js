function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(path, baseUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class TransactionApiClient {
  constructor({ baseUrl, apiKey, fetchImpl = fetch }) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
  }

  async getPositionsSummary(userId) {
    return this.#request('/api/positions/summary', { userId });
  }

  async getRealizedPnl({ userId, from, to }) {
    return this.#request('/api/pnl/realized', { userId, from, to });
  }

  async getCashflowSummary({ userId, month }) {
    return this.#request('/api/cashflow/summary', { userId, month });
  }

  async #request(path, query) {
    const url = buildUrl(this.baseUrl, path, query);
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`transaction api request failed: ${path}`);
    }

    return response.json();
  }
}
