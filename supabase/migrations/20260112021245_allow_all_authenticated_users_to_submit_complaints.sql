-- Allow all authenticated users to submit complaints
DROP POLICY IF EXISTS "Faculty and CR can submit complaints" ON public.complaints;

CREATE POLICY "Authenticated users can submit complaints" ON public.complaints
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);