export function aggregateAccountBalances({ holdings, transfers }) {
  const accounts = {};

  for (const holding of holdings) {
    const accountId = holding.accountId ?? 'unassigned';
    accounts[accountId] = (accounts[accountId] ?? 0) + Number(holding.marketValueBase ?? 0);
  }

  for (const transfer of transfers) {
    const amount = Number(transfer.amountBase ?? 0);
    accounts[transfer.fromAccountId] = (accounts[transfer.fromAccountId] ?? 0) - amount;
    accounts[transfer.toAccountId] = (accounts[transfer.toAccountId] ?? 0) + amount;
  }

  const netWorth = Object.values(accounts).reduce((sum, value) => sum + value, 0);

  return { accounts, netWorth };
}
