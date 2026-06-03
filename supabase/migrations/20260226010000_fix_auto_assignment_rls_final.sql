
-- =====================================================
-- Final Fix for Auto-Assignment RLS
-- Allows all users to see maintenance staff for auto-assignment
-- =====================================================

-- 1. Allow all authenticated users to see maintenance staff roles
-- This is necessary for auto-assignment to work during complaint submission by any user.
CREATE POLICY "Anyone can view maintenance staff roles" ON user_roles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND role = 'maintenance_staff'
  );

-- 2. Allow all authenticated users to view maintenance staff profiles
-- This is needed to get names and contact info for the auto-assignment logic.
CREATE POLICY "Anyone can view maintenance staff profiles" ON profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = profiles.user_id 
      AND user_roles.role = 'maintenance_staff'
    )
  );

-- 3. Ensure staff_skills are visible to all authenticated users for candidate evaluation
-- (The previous migration might have had more restrictive policies)
DROP POLICY IF EXISTS "All can view staff skills" ON staff_skills;
CREATE POLICY "All authenticated can view all staff skills" ON staff_skills
  FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Double check staff_availability is readable by all
DROP POLICY IF EXISTS "Authenticated can read staff availability" ON staff_availability;
CREATE POLICY "All authenticated can read staff availability" ON staff_availability
  FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON POLICY "Anyone can view maintenance staff roles" ON user_roles 
  IS 'Allows the auto-assignment engine to find maintenance staff during complaint submission from any user context';
