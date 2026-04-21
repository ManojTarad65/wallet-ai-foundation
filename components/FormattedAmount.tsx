"use client";

import { useCurrency } from "@/components/CurrencyProvider";

export function FormattedAmount({
  amount,
  className = "",
}: {
  amount: number;
  className?: string;
}) {
  const { formatAmount } = useCurrency();
  return <span className={className}>{formatAmount(amount)}</span>;
}
