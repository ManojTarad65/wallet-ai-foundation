import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/transactions";
import { sendToGroq } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description } = await req.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Invalid description" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      // Graceful fallback if AI is not configured
      return NextResponse.json({ category: "" });
    }

    const prompt = `Classify this transaction into one category:
Food, Travel, Shopping, Bills, Health, Other.

Transaction: ${description}

Return only category name.`;

    const categoryText = await sendToGroq([{ role: "user", content: prompt }]);

    // Extract the category if there are quotes or extra spaces
    const category = categoryText.replace(/['"]/g, "").trim();

    return NextResponse.json({ category });
  } catch (error) {
    console.error("AI Categorization Error:", error);
    return NextResponse.json({ error: "Failed to categorize", category: "" }, { status: 500 });
  }
}
