-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding columns
ALTER TABLE public.jobs
ADD COLUMN embedding vector(768);

ALTER TABLE public.freelancer_profiles
ADD COLUMN embedding vector(768);

-- 3. Create indexes for vector columns (optional but recommended for performance)
-- Using IVFFlat index for a balance between build time, index size, and query speed.
-- The lists parameter should be chosen based on the number of rows. A good starting point is sqrt(N) for N <= 1M.
-- Let's assume we'll have up to 100k freelancers/jobs for now. sqrt(100000) ~= 316.
CREATE INDEX ON public.jobs USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 316);

CREATE INDEX ON public.freelancer_profiles USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 316);

-- 4. Create function to search for similar freelancers
CREATE OR REPLACE FUNCTION match_freelancers (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  profile_id uuid,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    fp.user_id,
    1 - (fp.embedding <=> query_embedding) -- Cosine distance is 1 - cosine similarity
  FROM
    public.freelancer_profiles AS fp
  WHERE 1 - (fp.embedding <=> query_embedding) > match_threshold
  ORDER BY
    fp.embedding <=> query_embedding
  LIMIT match_count;
$$;
