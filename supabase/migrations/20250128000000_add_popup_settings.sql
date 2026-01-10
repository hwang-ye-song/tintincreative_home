-- Create popup_settings table to manage popup advertisements
CREATE TABLE IF NOT EXISTS public.popup_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  is_enabled BOOLEAN DEFAULT false,
  title TEXT,
  content TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT DEFAULT '자세히 보기',
  show_once_per_session BOOLEAN DEFAULT true,
  max_width TEXT DEFAULT '100px',
  max_height TEXT DEFAULT '100px',
  position TEXT DEFAULT 'center',
  priority INTEGER DEFAULT 1000,
  top_offset TEXT DEFAULT '50%',
  left_offset TEXT DEFAULT '50%',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on popup_settings
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can insert popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can update popup_settings" ON public.popup_settings;
DROP POLICY IF EXISTS "Only admins can delete popup_settings" ON public.popup_settings;

-- RLS policies for popup_settings
CREATE POLICY "Anyone can view popup_settings"
ON public.popup_settings
FOR SELECT
USING (true);

CREATE POLICY "Only admins can insert popup_settings"
ON public.popup_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can update popup_settings"
ON public.popup_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Only admins can delete popup_settings"
ON public.popup_settings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS update_popup_settings_updated_at ON public.popup_settings;

CREATE TRIGGER update_popup_settings_updated_at
BEFORE UPDATE ON public.popup_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Insert default popup setting (disabled)
INSERT INTO public.popup_settings (id, is_enabled, title, content, max_width, max_height, position, top_offset, left_offset)
VALUES ('main', false, '환영합니다!', '새로운 소식을 확인해보세요.', '100px', '100px', 'center', '50%', '50%')
ON CONFLICT (id) DO NOTHING;

