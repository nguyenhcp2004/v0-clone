import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    system:
      "Always respond in full capital letters. If you are asked to generate UI code, prefer to return code in ReactJS or Next.js (using JSX/TSX), and use Tailwind CSS for styling when possible, as these are the most popular frontend tech stacks right now."
  });

  return result.toDataStreamResponse();
}
