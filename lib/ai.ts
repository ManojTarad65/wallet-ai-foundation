// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendToGroq(messages: any[], useFallback = false): Promise<string> {
  console.log("Messages:", messages);

  if (!messages || messages.length === 0) {
    throw new Error("Invalid messages format");
  }

  const model = useFallback ? "llama-3.1-70b-versatile" : "llama-3.1-8b-instant";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    console.error(`Groq error (${model}):`, text);

    if (!useFallback) {
      console.log("Retrying with fallback model llama-3.1-70b-versatile...");
      return sendToGroq(messages, true);
    }

    throw new Error(`Groq Error: ${text}`);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Failed to parse AI response as JSON");
  }

  return data.choices?.[0]?.message?.content || "No response generated";
}
