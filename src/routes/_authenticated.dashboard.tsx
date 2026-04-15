import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Wallet AI" },
      { name: "description", content: "Your financial overview at a glance." },
    ],
  }),
  component: DashboardPage,
});

const stats = [
  { label: "Total Balance", value: "$0.00", icon: DollarSign, trend: "neutral" },
  { label: "Income", value: "$0.00", icon: TrendingUp, trend: "up" },
  { label: "Expenses", value: "$0.00", icon: TrendingDown, trend: "down" },
];

function DashboardPage() {
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
              <stat.icon className={`h-4 w-4 ${
                stat.trend === "up" ? "text-success" :
                stat.trend === "down" ? "text-destructive" : "text-muted-foreground"
              }`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-xl p-8 text-center">
        <p className="text-muted-foreground">AI insights and charts will appear here once you add transactions.</p>
      </div>
    </div>
  );
}
