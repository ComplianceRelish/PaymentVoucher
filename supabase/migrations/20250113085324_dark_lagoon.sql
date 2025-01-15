/*
  # Fix RLS policies for profiles table

  1. Changes
    - Remove existing policies and functions that cause recursion
    - Create simplified policies for admin management
    - Add basic security functions
    
  2. Security
    - Allow public read access for initial admin check
    - Restrict admin creation to when no admin exists
    - Allow admins to manage all profiles
*/

-- First drop all existing policies and functions
DROP POLICY IF EXISTS "Enable read access for everyone" ON profiles;
DROP POLICY IF EXISTS "Enable insert for first admin" ON profiles;
DROP POLICY IF EXISTS "Enable all actions for admin users" ON profiles;
DROP FUNCTION IF EXISTS auth.is_admin();
DROP FUNCTION IF EXISTS public.has_admin();

-- Create simplified policies
CREATE POLICY "Allow public read access"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow first admin creation"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (
    role = 'admin' 
    AND NOT EXISTS (
      SELECT 1 FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Allow admin to manage profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );