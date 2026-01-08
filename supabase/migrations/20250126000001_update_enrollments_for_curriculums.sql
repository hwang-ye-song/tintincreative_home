-- Add curriculum_id column to enrollments table
ALTER TABLE public.enrollments
ADD COLUMN IF NOT EXISTS curriculum_id TEXT REFERENCES public.curriculums(id) ON DELETE CASCADE;

-- Make course_id nullable (since we can now enroll in curriculums)
-- Note: We keep course_id as NOT NULL for backward compatibility, but allow NULL for curriculum enrollments
-- Actually, let's keep both optional but ensure at least one is set
ALTER TABLE public.enrollments
DROP CONSTRAINT IF EXISTS enrollments_course_id_fkey;

-- Re-add foreign key constraint but make it nullable
ALTER TABLE public.enrollments
ALTER COLUMN course_id DROP NOT NULL;

-- Re-add foreign key constraint
ALTER TABLE public.enrollments
ADD CONSTRAINT enrollments_course_id_fkey 
  FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;

-- Add check constraint to ensure at least one of course_id or curriculum_id is set
ALTER TABLE public.enrollments
ADD CONSTRAINT enrollments_must_have_course_or_curriculum 
  CHECK (course_id IS NOT NULL OR curriculum_id IS NOT NULL);

-- Update unique constraint to include curriculum_id
ALTER TABLE public.enrollments
DROP CONSTRAINT IF EXISTS enrollments_user_id_course_id_key;

-- Create unique constraint for user_id and course_id (when course_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_unique 
  ON public.enrollments (user_id, course_id) 
  WHERE course_id IS NOT NULL;

-- Create unique constraint for user_id and curriculum_id (when curriculum_id is not null)
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_curriculum_unique 
  ON public.enrollments (user_id, curriculum_id) 
  WHERE curriculum_id IS NOT NULL;

-- Update RLS policies to allow curriculum enrollments
DROP POLICY IF EXISTS "Users can enroll in courses" ON public.enrollments;
CREATE POLICY "Users can enroll in courses or curriculums"
  ON public.enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

