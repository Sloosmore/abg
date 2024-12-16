import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const { description, technical_skills, soft_skills } = await req.json();

    // Create embeddings for resume data with error handling
    let embeddings;
    try {
      embeddings = await Promise.all([
        openai.embeddings.create({
          model: "text-embedding-3-small",
          input: description || "",
        }),
        openai.embeddings.create({
          model: "text-embedding-3-small",
          input: technical_skills || "",
        }),
        openai.embeddings.create({
          model: "text-embedding-3-small",
          input: soft_skills || "",
        }),
      ]);
    } catch (error) {
      console.error("Error creating embeddings:", error);
      return NextResponse.json(
        { error: "Failed to create embeddings" },
        { status: 500 }
      );
    }

    // Verify embeddings exist and have the expected structure
    if (!embeddings || !embeddings.every((emb) => emb?.data?.[0]?.embedding)) {
      console.error("Invalid embedding structure:", embeddings);
      return NextResponse.json(
        { error: "Invalid embedding response" },
        { status: 500 }
      );
    }

    const [
      descriptionEmbedding,
      technicalSkillsEmbedding,
      softSkillsEmbedding,
    ] = embeddings.map((emb) => emb.data[0].embedding);

    // Fetch all jobs with their embeddings
    const { data: jobs, error } = await supabase.rpc("match_jobs", {
      input_description_embedding: descriptionEmbedding,
      input_technical_skills_embedding: technicalSkillsEmbedding,
      input_soft_skills_embedding: softSkillsEmbedding,
    });

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    // Sort jobs by similarity score
    const sortedJobs = jobs
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .map((job) => ({
        id: job.id,
        title: job.title,
        company_name: job.company_name,
        location: job.location,
        application_url: job.application_url,
        job_description: job.job_description,
        technical_skills: job.technical_skills,
        soft_skills: job.soft_skills,
        experience_level: job.experience_level,
        date_posted: job.date_posted,
        similarity_score: job.similarity_score,
      }));

    return NextResponse.json({ jobs: sortedJobs });
  } catch (error) {
    console.error("Error in job matching:", error);
    return NextResponse.json(
      { error: "Failed to process job matching" },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { data: companies, error } = await supabase
      .from("companies")
      .select("id, name")
      .order("name");

    if (error) throw error;

    return NextResponse.json({ companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}
