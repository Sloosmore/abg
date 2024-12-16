import OpenAI from "openai";
import PDFParser from "pdf-parse";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in your .env.local file
});

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

    const systemPrompt = `You are an AI assistant specialized in analyzing resumes and professional documents. Your task is to analyze the provided documents and return a JSON response in the following exact format:
    {
      "description": "A comprehensive summary of the candidate's background and overall profile (1-2 paragraphs)",
      "soft_skills": "Comma-separated list of soft skills",
      "technical_skills": "Comma-separated list of technical skills",
      "experience_level": "One of: beginner, intermediate, expert",
      "education": [{
        "degree": "Degree name",
        "institution": "Institution name",
        "dates": "Date range or completion date"
      }],
      "work_experience": [{
        "company": "Company name",
        "position": "Position title",
        "dates": "Date range",
        "achievements": ["Achievement 1", "Achievement 2"]
      }],
      "certifications": [{
        "name": "Certification name",
        "issuer": "Issuing organization",
        "date": "Date obtained"
      }]
    }

    Analyze the provided resume and ensure all output strictly follows this JSON format. Be thorough but concise in your analysis. For experience_level, consider:
    - beginner: 0-2 years relevant experience
    - intermediate: 3-5 years relevant experience
    - expert: 6+ years relevant experience`;

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the OpenAI stream
    const openaiStream = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `
            Please analyze these documents and provide a structured JSON response according to the specified format:
    
            ${fileContents.join("\n\n")}
            
            Additional context from user:
            ${prompt || "Please analyze this resume and provide insights."}
          `,
        },
      ],
      response_format: { type: "json_object" }, // This ensures JSON output
      stream: true,
    });
    // Process the stream
    (async () => {
      try {
        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            await writer.write(encoder.encode(`data: ${content}\n\n`));
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
