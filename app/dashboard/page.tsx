import { DollarSign, LayoutDashboard, TrendingDown, TrendingUp } from "lucide-react";
import type { Metadata } from "next";
import { ChartsSection } from "@/app/dashboard/ChartsSection";
import { AiChat } from "@/components/AiChat";
import { InsightsCard } from "@/app/dashboard/InsightsCard";
import { BudgetCard } from "@/app/dashboard/BudgetCard";
import { FinancialScoreCard } from "@/components/FinancialScoreCard";
import {
  buildMonthlySummary,
  calculateTotals,
  groupExpensesByCategory,
  groupExpensesByCategoryForMonth,
  groupExpensesByMonth,
} from "@/lib/analytics";
import { fetchBudgetsForUser } from "@/lib/budgets";
import { fetchTransactionsForUser, getAuthenticatedUserId } from "@/lib/transactions";

export const metadata: Metadata = {
  title: "Dashboard — Wallet AI",
  description: "Your financial overview at a glance.",
};

import { FormattedAmount } from "@/components/FormattedAmount";

export default async function DashboardPage() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Please sign in to view your dashboard.
      </div>
    );
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const [transactions, budgets] = await Promise.all([
    fetchTransactionsForUser(userId),
    fetchBudgetsForUser(userId, currentMonth).catch(() => []),
  ]);

  const totals = calculateTotals(transactions);
  const monthlyData = groupExpensesByMonth(transactions, 6);
  const categoryData = groupExpensesByCategory(transactions);
  const currentMonthCategoryData = groupExpensesByCategoryForMonth(transactions, currentMonth);
  const monthlySummary = buildMonthlySummary(transactions, 3);
  const stats = [
    {
      label: "Total Balance",
      value: totals.balance,
      icon: DollarSign,
      trend: "neutral",
    },
    { label: "Income", value: totals.income, icon: TrendingUp, trend: "up" },
    { label: "Expenses", value: totals.expense, icon: TrendingDown, trend: "down" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your financial overview at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon
                className={`h-4 w-4 ${
                  stat.trend === "up"
                    ? "text-success"
                    : stat.trend === "down"
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              <FormattedAmount amount={stat.value} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {monthlySummary.map((summary) => (
          <div key={summary.monthLabel} className="glass-card rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {summary.monthLabel}
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="text-success">
                Income: <FormattedAmount amount={summary.income} />
              </p>
              <p className="text-destructive">
                Expenses: <FormattedAmount amount={summary.expense} />
              </p>
              <p className="text-foreground">
                Net: <FormattedAmount amount={summary.balance} />
              </p>
            </div>
          </div>
        ))}
      </div>

      <ChartsSection monthlyData={monthlyData} categoryData={categoryData} />

      <div className="grid gap-6 lg:grid-cols-2">
        <FinancialScoreCard transactions={transactions} budgets={budgets} />
        <AiChat />
        <InsightsCard />
        <BudgetCard budgets={budgets} expenseByCategory={currentMonthCategoryData} />
      </div>
    </div>
  );
}
