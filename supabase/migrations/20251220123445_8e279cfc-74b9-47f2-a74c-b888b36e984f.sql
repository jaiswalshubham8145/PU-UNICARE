-- Create trigger to assign default 'faculty' role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert role for new users: use provided role in raw_user_meta_data if present, otherwise default to 'faculty'.
  -- Avoid duplicate inserts if a role for this user already exists (client may also insert).
  DECLARE
    chosen_role app_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'faculty')::app_role;
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = NEW.id AND role = chosen_role
    ) THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, chosen_role);
    END IF;
  END;
  RETURN NEW;
END;
$$;

-- Create trigger (drop if exists to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Add table to publication only if not already a member (avoids error if migration re-runs)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication p
    JOIN pg_publication_rel pr ON pr.prpubid = p.oid
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'complaints'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints';
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication p
    JOIN pg_publication_rel pr ON pr.prpubid = p.oid
    JOIN pg_class c ON pr.prrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'complaint_updates'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.complaint_updates';
  END IF;
END;
$$;