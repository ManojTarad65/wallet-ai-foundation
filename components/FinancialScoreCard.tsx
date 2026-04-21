import { useMemo } from "react";
import type { TransactionRecord } from "@/lib/transactions/schema";
import type { BudgetRecord } from "@/lib/budgets";

export function FinancialScoreCard({
  transactions,
  budgets,
}: {
  transactions: TransactionRecord[];
  budgets: BudgetRecord[];
}) {
  const score = useMemo(() => {
    let newScore = 0;

    // 1. Logging habits (max 20 points)
    if (transactions.length > 0) newScore += 10;
    if (transactions.length > 5) newScore += 10;

    // 2. Savings Ratio (max 40 points)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTx = transactions.filter((t) => new Date(t.date) >= thirtyDaysAgo);
    const income = recentTx
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = recentTx
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);

    if (income > 0) {
      const ratio = (income - expense) / income;
      if (ratio > 0.2) newScore += 40;
      else if (ratio > 0.1) newScore += 30;
      else if (ratio > 0) newScore += 15;
    } else if (expense === 0) {
      newScore += 20; // Default when no activity
    }

    // 3. Budget tracking (max 40 points)
    if (budgets.length > 0) {
      newScore += 15; // Point for having a budget

      const currentMonth = new Date().toISOString().slice(0, 7);
      const activeBudgets = budgets.filter((b) => b.month === currentMonth);
      let exceededCount = 0;

      const expenseByCategory = recentTx
        .filter((t) => t.type === "expense")
        .reduce(
          (acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          },
          {} as Record<string, number>,
        );

      activeBudgets.forEach((budget) => {
        const spent = expenseByCategory[budget.category] || 0;
        if (spent > budget.limit_amount) {
          exceededCount++;
        }
      });

      if (exceededCount === 0) newScore += 25;
      else if (exceededCount === 1) newScore += 10;
    }

    return Math.min(Math.max(newScore, 0), 100);
  }, [transactions, budgets]);

  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Poor";

  const colorConfig = {
    Excellent: "text-success",
    Good: "text-primary",
    Average: "text-yellow-500",
    Poor: "text-destructive",
  };

  return (
    <div className="glass-card rounded-xl p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Financial Health</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on savings and budget discipline.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
          <span className="text-4xl font-bold text-foreground">{score}</span>
          <svg
            className="absolute left-0 top-0 h-full w-full -rotate-90 transform"
            width="100%"
            height="100%"
          >
            <circle
              cx="50%"
              cy="50%"
              r="43%"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray="270"
              strokeDashoffset={270 - (270 * score) / 100}
              className={colorConfig[label as keyof typeof colorConfig]}
            />
          </svg>
        </div>
        <p
          className={`mt-4 text-lg font-semibold ${colorConfig[label as keyof typeof colorConfig]}`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
