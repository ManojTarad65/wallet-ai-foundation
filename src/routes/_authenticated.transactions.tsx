import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Wallet AI" },
      { name: "description", content: "View and manage your transactions." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ArrowLeftRight className="h-6 w-6 text-primary" />
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your income and expenses.</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <div className="glass-card overflow-hidden rounded-xl">
        <div className="border-b border-border px-6 py-3">
          <div className="grid grid-cols-5 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Type</span>
            <span className="text-right">Amount</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No transactions yet. Add your first transaction to get started.
        </div>
      </div>
    </div>
  );
}
