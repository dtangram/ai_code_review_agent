CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  pull_number INTEGER NOT NULL,
  pr_title TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  comments JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Safe to run against a database created before pr_title existed.
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS pr_title TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_repo ON reviews (repo_owner, repo_name, pull_number);
