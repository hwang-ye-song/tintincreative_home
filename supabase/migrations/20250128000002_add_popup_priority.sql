-- Add priority (z-index) column to popup_settings table
ALTER TABLE public.popup_settings
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS top_offset TEXT DEFAULT '50%',
ADD COLUMN IF NOT EXISTS left_offset TEXT DEFAULT '50%';

-- Update existing records with default values
UPDATE public.popup_settings
SET 
  priority = COALESCE(priority, 1000),
  top_offset = COALESCE(top_offset, '50%'),
  left_offset = COALESCE(left_offset, '50%')
WHERE priority IS NULL OR top_offset IS NULL OR left_offset IS NULL;


