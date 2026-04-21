"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/components/CurrencyProvider";

const currentMonth = new Date().toISOString().slice(0, 7);

type BudgetItem = {
  id: string;
  category: string;
  limit_amount: number;
  month: string;
  created_at: string;
};

function formatMonthLabel(month: string) {
  return new Date(`${month}-01`).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

export function BudgetClient() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState<number | "">("");
  const [month, setMonth] = useState(currentMonth);
  const { formatAmount } = useCurrency();

  const loadBudgets = async (monthFilter: string) => {
    setIsLoading(true);
    setError(null);
    const query = monthFilter ? `?month=${monthFilter}` : "";
    const response = await fetch(`/api/budgets${query}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error ?? "Failed to fetch budgets");
      setIsLoading(false);
      return;
    }

    setBudgets(payload.data ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadBudgets(selectedMonth);
  }, [selectedMonth]);

  const groupedBudgets = useMemo(() => {
    const map = new Map<string, BudgetItem[]>();
    budgets.forEach((budget) => {
      const list = map.get(budget.month) ?? [];
      list.push(budget);
      map.set(budget.month, list);
    });

    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [budgets]);

  const handleSubmit = async () => {
    setError(null);
    if (!category.trim()) {
      setError("Category is required.");
      return;
    }
    if (!limitAmount || Number(limitAmount) <= 0) {
      setError("Limit amount must be greater than zero.");
      return;
    }
    if (!month) {
      setError("Month is required.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: category.trim(),
        limit_amount: Number(limitAmount),
        month,
      }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error ?? "Failed to save budget");
      setSaving(false);
      return;
    }

    setCategory("");
    setLimitAmount("");
    setMonth(currentMonth);
    setSaving(false);
    loadBudgets(selectedMonth);
  };

  const handleDelete = async (budgetId: string) => {
    setSaving(true);
    const response = await fetch(`/api/budgets?id=${budgetId}`, { method: "DELETE" });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload?.error ?? "Failed to delete budget");
      setSaving(false);
      return;
    }

    setSaving(false);
    loadBudgets(selectedMonth);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Plan monthly category budgets and stay aligned with your goals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="w-[160px]"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMonth("")}
            disabled={!selectedMonth}
          >
            Show all months
          </Button>
          <Button size="sm" onClick={() => setSelectedMonth(currentMonth)}>
            Current month
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground">Budget overview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track budgets by month and update limits anytime.
          </p>

          {isLoading ? (
            <div className="mt-6 text-sm text-muted-foreground">Loading budgets...</div>
          ) : groupedBudgets.length === 0 ? (
            <div className="mt-6 text-sm text-muted-foreground">No budgets yet.</div>
          ) : (
            <div className="mt-6 space-y-5">
              {groupedBudgets.map(([budgetMonth, items]) => (
                <div key={budgetMonth} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {formatMonthLabel(budgetMonth)}
                  </p>
                  <div className="space-y-3">
                    {items.map((budget) => (
                      <div
                        key={budget.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{budget.category}</p>
                          <p className="text-xs text-muted-foreground">
                            Limit {formatAmount(budget.limit_amount)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          disabled={saving}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card rounded-xl p-6">
          <h2 className="text-lg font-semibold text-foreground">Create a budget</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set a monthly limit for any category.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget-category">Category</Label>
              <Input
                id="budget-category"
                placeholder="e.g., Dining"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-month">Month</Label>
              <Input
                id="budget-month"
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget-limit">Limit amount</Label>
              <Input
                id="budget-limit"
                type="number"
                min="0"
                step="0.01"
                value={limitAmount}
                onChange={(event) =>
                  setLimitAmount(event.target.value === "" ? "" : Number(event.target.value))
                }
              />
            </div>
            <Button className="w-full" onClick={handleSubmit} disabled={saving}>
              {saving ? "Saving..." : "Save budget"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
