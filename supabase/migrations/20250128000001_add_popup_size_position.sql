-- Add size and position columns to popup_settings table
ALTER TABLE public.popup_settings
ADD COLUMN IF NOT EXISTS max_width TEXT DEFAULT '500px',
ADD COLUMN IF NOT EXISTS max_height TEXT DEFAULT 'auto',
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'center';

-- Update existing records with default values
UPDATE public.popup_settings
SET 
  max_width = COALESCE(max_width, '500px'),
  max_height = COALESCE(max_height, 'auto'),
  position = COALESCE(position, 'center')
WHERE max_width IS NULL OR max_height IS NULL OR position IS NULL;


