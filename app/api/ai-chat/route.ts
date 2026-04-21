import { NextResponse } from "next/server";
import { getAuthenticatedUserId, fetchTransactionsForUser } from "@/lib/transactions";
import { fetchBudgetsForUser } from "@/lib/budgets";
import { sendToGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const userMessage = messages[messages.length - 1]?.text;
    if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
      return NextResponse.json({ error: "Empty or invalid message" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        role: "assistant",
        text: "AI features are currently unavailable. Please check your API key configuration.",
      });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    const transactions = await fetchTransactionsForUser(userId);

    console.log("Transactions:", transactions.slice(0, 2));

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({
        role: "assistant",
        text: "No transaction data available. Please add some transactions first.",
      });
    }

    const budgets = await fetchBudgetsForUser(userId, currentMonth).catch(() => []);
    const recentTransactions = transactions.slice(0, 20); // limit to strict 20

    const userData = {
      currentMonth,
      budgets,
      recentTransactions: recentTransactions.map((t) => ({
        amount: t.amount,
        category: t.category,
        date: t.date,
        type: t.type,
        description: t.description,
      })),
    };

    const systemPrompt = `You are a financial advisor.
Give short, practical, actionable insights based on user spending data.
Avoid generic advice.

User data:
${JSON.stringify(userData)}`;

    // Build history: only include messages AFTER the initial greeting
    // Filter out any assistant messages that precede the first user message
    const history = messages.slice(0, -1);
    const firstUserIdx = history.findIndex((m: { role: string }) => m.role === "user");
    const cleanedHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...cleanedHistory.map((m: { role: string; text: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      })),
      { role: "user", content: userMessage },
    ];

    const text = await sendToGroq(groqMessages);

    return NextResponse.json({ role: "assistant", text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Unable to generate insights right now. Please try again." },
      { status: 500 },
    );
  }
}
