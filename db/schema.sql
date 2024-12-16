CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_image TEXT,
    website_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id),
    title VARCHAR(255) NOT NULL,
    location TEXT,
    application_url TEXT,
    date_posted DATE,
    
    -- New columns from the enriched data
    job_description TEXT,
    soft_skills TEXT,
    technical_skills TEXT,
    experience_level TEXT,
    
    -- Vector embeddings using pgvector 
    -- (dimension 1536 for text-embedding-3-small)
    description_embedding vector(1536),
    soft_skills_embedding vector(1536),
    technical_skills_embedding vector(1536),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);