-- Create curriculum_settings table to manage curriculum visibility
CREATE TABLE IF NOT EXISTS public.curriculum_settings (
  id TEXT PRIMARY KEY,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on curriculum_settings
ALTER TABLE public.curriculum_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can insert curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can update curriculum_settings" ON public.curriculum_settings;
DROP POLICY IF EXISTS "Only admins can delete curriculum_settings" ON public.curriculum_settings;

-- RLS policies for curriculum_settings
CREATE POLICY "Anyone can view curriculum_settings"
ON public.curriculum_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert curriculum_settings"
ON public.curriculum_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update curriculum_settings"
ON public.curriculum_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete curriculum_settings"
ON public.curriculum_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_curriculum_settings_updated_at
BEFORE UPDATE ON public.curriculum_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

