import { openai } from "@ai-sdk/openai";
import PDFParser from "pdf-parse";
import { NextResponse } from "next/server";
import { streamText } from "ai";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const { prompt, files } = await req.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Process files and extract text
    const fileContents = await Promise.all(
      files.map(async (file) => {
        try {
          // For PDF files
          if (file.type === "application/pdf") {
            const buffer = Buffer.from(file.content, "base64");
            const pdfData = await PDFParser(buffer);
            return pdfData.text;
            //return "PDF file";
          }
          // For text files
          else if (file.type.includes("text")) {
            // Base64 decode and convert to text
            const text = Buffer.from(file.content, "base64").toString("utf-8");
            return text;
          }
          // For other file types
          else {
            console.warn(`Unsupported file type: ${file.type}`);
            return `Could not process file ${file.name} of type ${file.type}`;
          }
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return `Error processing ${file.name}`;
        }
      })
    );

    const systemPrompt = `You are an AI assistant specialized in analyzing resumes and professional documents. Your task is to:
    1. Extract and categorize the following information:
       - Skills (technical and soft skills)
       - Education (degrees, institutions, dates)
       - Work Experience (companies, positions, dates, key achievements)
       - Projects (names, technologies used, outcomes)
       - Certifications
    2. Organize the information in a clear, structured format
    3. Provide insights and suggestions based on the extracted information
    
    Please maintain a professional tone and be thorough in your analysis.`;

    // Stream text using OpenAI
    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
            Context from uploaded files:
            ${fileContents.join("\n\n")}
            
            User prompt:
            ${prompt || "Please analyze this resume and provide insights."}
          `,
        },
      ],

      //prompt: enhancedPrompt,
    });

    return result.toDataStreamResponse({
      headers: { "Content-Type": "text/event-stream" },
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
