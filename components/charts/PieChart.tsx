"use client";

import { Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useCurrency } from "@/components/CurrencyProvider";

export type CategoryChartPoint = {
  category: string;
  total: number;
};

const COLORS = ["#34d399", "#60a5fa", "#f472b6", "#f59e0b", "#a78bfa", "#f87171", "#38bdf8"];

export function PieChart({ data }: { data: CategoryChartPoint[] }) {
  const { formatAmount } = useCurrency();
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie data={data} dataKey="total" nameKey="category" outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatAmount(value)} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}
