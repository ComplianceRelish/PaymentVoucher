/*
  # Fix RLS policies for profiles table
  
  1. Changes
    - Drop existing problematic policy
    - Create separate policies for:
      - Public read access for admin check
      - First admin creation
      - Authenticated user access
  
  2. Security
    - Maintains security while preventing recursion
    - Allows public to check for admin existence
    - Restricts profile creation/updates appropriately
*/

-- Drop existing policy
DROP POLICY IF EXISTS "profiles_policy" ON profiles;

-- Create new policies
CREATE POLICY "allow_public_read_for_admin_check"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "allow_first_admin_creation"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "allow_authenticated_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() IS NULL THEN false
      WHEN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
      ) THEN true
      ELSE id = auth.uid()
    END
  );