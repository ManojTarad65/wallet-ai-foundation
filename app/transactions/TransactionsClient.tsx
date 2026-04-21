"use client";

import { useMemo, useState, useEffect } from "react";
import { ArrowLeftRight, Download, Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/components/CurrencyProvider";
import { useTransactions } from "@/hooks/useTransactions";
import type { CreateTransactionInput } from "@/lib/transactions/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const defaultForm: CreateTransactionInput = {
  amount: 0,
  type: "expense",
  category: "",
  description: "",
  date: new Date().toISOString().slice(0, 10),
};

export function TransactionsClient() {
  const { data, isLoading, isMutating, error, addTransaction, deleteTransaction } =
    useTransactions();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateTransactionInput>(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { formatAmount } = useCurrency();

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (
        form.description &&
        form.description.length > 2 &&
        form.type === "expense" &&
        !form.category.trim()
      ) {
        setIsCategorizing(true);
        try {
          const res = await fetch("/api/ai-categorize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description: form.description }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.category) {
              setForm((prev) => ({ ...prev, category: data.category }));
            }
          }
        } catch (err) {
          console.error("Auto-categorization failed", err);
        } finally {
          setIsCategorizing(false);
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.description, form.type, form.category]);

  const hasTransactions = data.length > 0;

  const totalByType = useMemo(() => {
    return data.reduce(
      (acc, item) => {
        if (item.type === "income") acc.income += item.amount;
        if (item.type === "expense") acc.expense += item.amount;
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [data]);

  const handleSubmit = async () => {
    setFormError(null);

    if (!form.amount || form.amount <= 0) {
      setFormError("Amount must be greater than zero.");
      return;
    }

    if (!form.category.trim()) {
      setFormError("Category is required.");
      return;
    }

    const response = await addTransaction({
      amount: Number(form.amount),
      type: form.type,
      category: form.category.trim(),
      description: form.description?.trim() || undefined,
      date: form.date,
    });

    if (!response.success) {
      setFormError(response.error ?? "Failed to add transaction.");
      return;
    }

    setForm(defaultForm);
    setOpen(false);
  };

  const handleExport = () => {
    if (!hasTransactions) return;

    const header = ["date", "description", "category", "type", "amount"].join(",");
    const rows = data
      .map((item) =>
        [item.date, item.description ?? "", item.category, item.type, item.amount]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your income and expenses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
            disabled={!hasTransactions}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Income</p>
            <p className="mt-2 text-xl font-semibold text-success">
              {formatAmount(totalByType.income)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Expenses</p>
            <p className="mt-2 text-xl font-semibold text-destructive">
              {formatAmount(totalByType.expense)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Net</p>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {formatAmount(totalByType.income - totalByType.expense)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-xl">
        <div className="border-b border-border px-6 py-3">
          <div className="grid grid-cols-6 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Action</span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            Loading transactions...
          </div>
        ) : !hasTransactions ? (
          <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
            No transactions yet. Add your first transaction to get started.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {data.map((item) => (
              <div key={item.id} className="grid grid-cols-6 gap-4 px-6 py-4 text-sm">
                <span className="text-muted-foreground">{item.date}</span>
                <span className="truncate text-foreground">{item.description || "—"}</span>
                <span className="text-foreground">{item.category}</span>
                <span className={item.type === "income" ? "text-success" : "text-destructive"}>
                  {item.type}
                </span>
                <span className="text-right font-medium text-foreground">
                  {formatAmount(item.amount)}
                </span>
                <div className="flex justify-end">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isMutating}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteTransaction(item.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(error || formError) && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {formError ?? error}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, amount: Number(event.target.value) }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, type: value as CreateTransactionInput["type"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                Category
                {isCategorizing && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
                {!isCategorizing && form.description && form.category && (
                  <Sparkles className="h-3 w-3 text-primary" />
                )}
              </Label>
              <Input
                id="category"
                placeholder="e.g., Groceries"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Optional notes"
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isMutating}>
                {isMutating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
