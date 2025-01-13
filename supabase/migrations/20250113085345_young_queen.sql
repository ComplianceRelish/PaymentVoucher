/*
  # Simplify RLS policies to prevent recursion

  1. Changes
    - Remove all existing policies
    - Create single, simple policy for admin check
    - Add basic insert policy for first admin
    
  2. Security
    - Maintain security while avoiding recursion
    - Allow basic admin checks without complex policies
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access" ON profiles;
DROP POLICY IF EXISTS "Allow first admin creation" ON profiles;
DROP POLICY IF EXISTS "Allow admin to manage profiles" ON profiles;

-- Create a single simple policy for checking admin existence
CREATE POLICY "profiles_policy"
  ON profiles
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM profiles WHERE role = 'admin')
        THEN role = 'admin'  -- Allow only admin creation when no admin exists
      ELSE auth.uid() IS NOT NULL  -- Otherwise require authentication
    END
  );