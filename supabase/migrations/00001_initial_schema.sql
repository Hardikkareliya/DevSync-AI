-- DevSync Database Schema
-- Idempotent - safe to run multiple times

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raw_input TEXT NOT NULL,
  generated_output TEXT NOT NULL,
  output_format TEXT NOT NULL DEFAULT 'markdown',
  provider TEXT NOT NULL DEFAULT 'gemini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Commits table
CREATE TABLE IF NOT EXISTS commits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raw_input TEXT NOT NULL,
  generated_output TEXT NOT NULL,
  commit_type TEXT NOT NULL DEFAULT 'chore',
  output_format TEXT NOT NULL DEFAULT 'plain',
  provider TEXT NOT NULL DEFAULT 'gemini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- PR Descriptions table
CREATE TABLE IF NOT EXISTS pr_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  raw_input TEXT NOT NULL,
  generated_output TEXT NOT NULL,
  output_format TEXT NOT NULL DEFAULT 'markdown',
  provider TEXT NOT NULL DEFAULT 'gemini',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (safe to run multiple times)
DO $$ BEGIN
  ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE commits ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE pr_descriptions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "Users can view their own projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view their own reports" ON reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON reports;
DROP POLICY IF EXISTS "Users can view their own commits" ON commits;
DROP POLICY IF EXISTS "Users can create their own commits" ON commits;
DROP POLICY IF EXISTS "Users can delete their own commits" ON commits;
DROP POLICY IF EXISTS "Users can view their own pr_descriptions" ON pr_descriptions;
DROP POLICY IF EXISTS "Users can create their own pr_descriptions" ON pr_descriptions;
DROP POLICY IF EXISTS "Users can delete their own pr_descriptions" ON pr_descriptions;

-- Projects RLS policies
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Reports RLS policies
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Commits RLS policies
CREATE POLICY "Users can view their own commits"
  ON commits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own commits"
  ON commits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own commits"
  ON commits FOR DELETE
  USING (auth.uid() = user_id);

-- PR Descriptions RLS policies
CREATE POLICY "Users can view their own pr_descriptions"
  ON pr_descriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pr_descriptions"
  ON pr_descriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pr_descriptions"
  ON pr_descriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_project_id ON reports(project_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commits_user_id ON commits(user_id);
CREATE INDEX IF NOT EXISTS idx_commits_project_id ON commits(project_id);
CREATE INDEX IF NOT EXISTS idx_commits_created_at ON commits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pr_descriptions_user_id ON pr_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_pr_descriptions_project_id ON pr_descriptions(project_id);
CREATE INDEX IF NOT EXISTS idx_pr_descriptions_created_at ON pr_descriptions(created_at DESC);
