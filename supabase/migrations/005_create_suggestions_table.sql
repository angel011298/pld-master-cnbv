-- Create suggestions table
CREATE TABLE IF NOT EXISTS public.suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only insert their own suggestions
CREATE POLICY "Users can insert their own suggestions"
  ON public.suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can read their own suggestions (optional for future admin panel)
CREATE POLICY "Users can read their own suggestions"
  ON public.suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON public.suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON public.suggestions(created_at DESC);
