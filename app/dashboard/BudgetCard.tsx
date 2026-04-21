"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/components/CurrencyProvider";
import type { BudgetRecord } from "@/lib/budgets";
import type { CategoryPoint } from "@/lib/analytics";

export function BudgetCard({
  budgets,
  expenseByCategory,
}: {
  budgets: BudgetRecord[];
  expenseByCategory: CategoryPoint[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [limitAmount, setLimitAmount] = useState<number | "">("");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { formatAmount } = useCurrency();

  const usageMap = useMemo(() => {
    const map = new Map<string, number>();
    expenseByCategory.forEach((item) => map.set(item.category, item.total));
    return map;
  }, [expenseByCategory]);

  const handleSave = async () => {
    setError(null);
    if (!category.trim()) {
      setError("Category is required");
      return;
    }
    if (!limitAmount || Number(limitAmount) <= 0) {
      setError("Limit amount must be greater than zero");
      return;
    }
    if (!month) {
      setError("Month is required");
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

    setSaving(false);
    setOpen(false);
    setCategory("");
    setLimitAmount("");
    setMonth(new Date().toISOString().slice(0, 7));
    router.refresh();
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
    router.refresh();
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Budget tracking</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Set monthly limits per category to stay on track.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Add budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        <div className="mt-6 text-sm text-muted-foreground">No budgets yet.</div>
      ) : (
        <div className="mt-6 space-y-4">
          {budgets.map((budget) => {
            const spent = usageMap.get(budget.category) ?? 0;
            const progress = Math.min((spent / budget.limit_amount) * 100, 100);
            const monthLabel = new Date(`${budget.month}-01`).toLocaleString("default", {
              month: "short",
              year: "numeric",
            });
            return (
              <div
                key={budget.id}
                className="rounded-lg border border-border/60 bg-background/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{budget.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {monthLabel} · {formatAmount(spent)} / {formatAmount(budget.limit_amount)}
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
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div
                    className={
                      progress > 100
                        ? "h-2 rounded-full bg-destructive"
                        : progress >= 70
                          ? "h-2 rounded-full bg-yellow-500"
                          : "h-2 rounded-full bg-success"
                    }
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save budget"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
