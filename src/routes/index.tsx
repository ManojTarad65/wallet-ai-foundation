import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, ArrowRight, Shield, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wallet AI — Smart Finance Management" },
      {
        name: "description",
        content:
          "AI-powered personal finance management. Track expenses, analyze spending patterns, and get smart insights.",
      },
      { property: "og:title", content: "Wallet AI — Smart Finance Management" },
      { property: "og:description", content: "AI-powered personal finance management." },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Smart categorization and spending analysis powered by artificial intelligence.",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "Row-level security ensures your financial data is always protected.",
  },
  {
    icon: Zap,
    title: "Real-Time Tracking",
    description: "Instant transaction logging with live dashboard updates.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-dark)" }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Wallet className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">Wallet AI</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center md:pt-32">
        <div className="animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Finance
          </div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Your Money, <span className="text-gradient">Smarter</span>
          </h1>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in-delay">
          Track expenses, analyze spending patterns, and get AI-driven insights — all in one
          beautifully designed dashboard.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in-delay-2">
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-card rounded-xl p-6 animate-fade-in"
              style={{
                animationDelay: `${0.2 + i * 0.15}s`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 Wallet AI. All rights reserved.
      </footer>
    </div>
  );
}
