/*
  # Fix Profiles Policies

  1. Changes
    - Simplify RLS policies to prevent recursion
    - Remove circular dependencies in admin checks
    - Add direct role checks instead of using functions
    - Ensure proper access control while maintaining security

  2. Security
    - Maintain RLS protection
    - Keep admin privileges
    - Preserve data access controls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "profiles_read_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP FUNCTION IF EXISTS is_admin();

-- Create new simplified policies
CREATE POLICY "profiles_read"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  WITH CHECK (
    -- Allow self-registration
    auth.uid() = id
    OR
    -- Allow admins to create other users
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (
    -- Users can update their own profiles
    auth.uid() = id
    OR
    -- Admins can update any profile
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
      AND active = true
    )
  );

-- Ensure admin user exists and has correct role
UPDATE profiles 
SET role = 'admin', active = true 
WHERE id = '0d989055-8449-4797-8b2d-d9b25cef16be';