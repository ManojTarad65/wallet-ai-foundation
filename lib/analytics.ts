import type { TransactionRecord } from "@/lib/transactions/schema";

export type Totals = {
  income: number;
  expense: number;
  balance: number;
};

export type MonthlyPoint = {
  month: string;
  total: number;
};

export type CategoryPoint = {
  category: string;
  total: number;
};

export type MonthlySummary = {
  monthLabel: string;
  income: number;
  expense: number;
  balance: number;
};

export function calculateTotals(transactions: TransactionRecord[]): Totals {
  const income = transactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  return { income, expense, balance: income - expense };
}

export function groupExpensesByMonth(transactions: TransactionRecord[], monthsBack = 6) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
  const map = new Map<string, number>();

  for (const item of transactions) {
    if (item.type !== "expense") continue;
    const date = new Date(item.date);
    if (Number.isNaN(date.getTime()) || date < start) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + item.amount);
  }

  const output: MonthlyPoint[] = [];
  for (let i = 0; i < monthsBack; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1) + i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", { month: "short", year: "numeric" });
    output.push({ month: label, total: map.get(key) ?? 0 });
  }

  return output;
}

export function groupExpensesByCategory(transactions: TransactionRecord[]) {
  const map = new Map<string, number>();
  for (const item of transactions) {
    if (item.type !== "expense") continue;
    map.set(item.category, (map.get(item.category) ?? 0) + item.amount);
  }

  return Array.from(map.entries()).map(([category, total]) => ({ category, total }));
}

export function filterTransactionsByMonth(transactions: TransactionRecord[], month: string) {
  return transactions.filter((item) => item.date.startsWith(month));
}

export function groupExpensesByCategoryForMonth(transactions: TransactionRecord[], month: string) {
  return groupExpensesByCategory(filterTransactionsByMonth(transactions, month));
}

export function buildMonthlySummary(transactions: TransactionRecord[], monthsBack = 3) {
  const now = new Date();
  const output: MonthlySummary[] = [];

  for (let i = 0; i < monthsBack; i += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", { month: "short", year: "numeric" });

    const monthTransactions = transactions.filter((item) => item.date.startsWith(monthKey));
    const totals = calculateTotals(monthTransactions);
    output.push({ monthLabel: label, ...totals });
  }

  return output;
}
