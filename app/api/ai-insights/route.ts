import { NextResponse } from "next/server";
import { fetchTransactionsForUser, getAuthenticatedUserId } from "@/lib/transactions";
import { calculateTotals, groupExpensesByCategory, groupExpensesByMonth } from "@/lib/analytics";
import { sendToGroq } from "@/lib/ai";

export async function GET() {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json({ error: "AI provider is not configured" }, { status: 500 });
  }

  try {
    const transactions = await fetchTransactionsForUser(userId);
    console.log("Transactions:", transactions.slice(0, 2)); // Debug top 2

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        insight: "Add transactions to get AI insights.",
      });
    }

    const promptData = JSON.stringify(transactions.slice(0, 20));

    const messages = [
      {
        role: "system",
        content: "You are a financial advisor. Give short, actionable insights.",
      },
      {
        role: "user",
        content: `Analyze this data and give insights:\n${promptData}`,
      },
    ];

    const result = await sendToGroq(messages);

    return NextResponse.json({ insight: result });
  } catch (error) {
    console.error("AI Insights Error:", error);

    return NextResponse.json({
      insight: "AI failed. Check server logs.",
    });
  }
}
