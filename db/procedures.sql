-- First drop the existing function
DROP FUNCTION IF EXISTS match_jobs(vector(1536), vector(1536), vector(1536));

-- Then create the new function with correct return types
CREATE OR REPLACE FUNCTION match_jobs(
  input_description_embedding vector(1536),
  input_technical_skills_embedding vector(1536),
  input_soft_skills_embedding vector(1536)
) RETURNS TABLE (
  id integer,
  title varchar(255),  -- Changed from text to varchar(255) to match jobs table
  company_name varchar(255),  -- Changed from text to varchar(255) to match companies table
  location text,
  application_url text,
  job_description text,
  technical_skills text,
  soft_skills text,
  experience_level text,
  similarity_score float
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    j.id,
    j.title,
    c.name as company_name,
    j.location,
    j.application_url,
    j.job_description,
    j.technical_skills,
    j.soft_skills,
    j.experience_level,
    (
      -- Calculate weighted average of similarity scores
      (1 - (j.description_embedding <=> input_description_embedding)) * 0.4 +
      (1 - (j.technical_skills_embedding <=> input_technical_skills_embedding)) * 0.4 +
      (1 - (j.soft_skills_embedding <=> input_soft_skills_embedding)) * 0.2
    ) as similarity_score
  FROM 
    jobs j
    JOIN companies c ON j.company_id = c.id
  WHERE
    j.description_embedding IS NOT NULL
    AND j.technical_skills_embedding IS NOT NULL
    AND j.soft_skills_embedding IS NOT NULL
  ORDER BY 
    similarity_score DESC;
END;
$$;