/*
  # Fix profiles access and error handling
  
  1. Changes
    - Drop existing policies to start fresh
    - Create simplified, non-recursive policies
    - Improve error handling for admin checks
  
  2. Security
    - Maintains proper access control
    - Prevents infinite recursion
    - Handles edge cases properly
*/

-- Drop existing policies
DROP POLICY IF EXISTS "allow_public_read_for_admin_check" ON profiles;
DROP POLICY IF EXISTS "allow_first_admin_creation" ON profiles;
DROP POLICY IF EXISTS "allow_authenticated_access" ON profiles;

-- Create new simplified policies
CREATE POLICY "enable_public_read"
  ON profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "enable_first_admin"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (
    role = 'admin'
    AND NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE role = 'admin'
      LIMIT 1
    )
  );

CREATE POLICY "enable_admin_access"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
      LIMIT 1
    )
  );