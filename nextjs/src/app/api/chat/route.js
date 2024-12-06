import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const dynamic = "force-dynamic"; // Ensure the route is dynamic for streaming

export async function POST(req) {
  try {
    const { prompt, files } = await req.json();

    // Convert uploaded files to HTML content (example logic)
    const htmlContents = await Promise.all(
      files.map(async (file) => `<p>File uploaded: ${file.name}</p>`)
    );

    console.log(htmlContents);
    console.log("prompt", prompt);
    // Stream text using OpenAI
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      prompt,
    });

    // Use the AI SDK's helper to return a streaming response
    return result.toDataStreamResponse({
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
