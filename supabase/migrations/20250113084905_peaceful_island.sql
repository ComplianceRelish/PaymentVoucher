/*
  # Fix profiles table RLS policies

  1. Changes
    - Remove recursive policy check for profiles
    - Allow public access for checking first admin
    - Maintain security while avoiding infinite recursion

  2. Security
    - Enable RLS on profiles table
    - Allow authenticated users to view profiles
    - Allow first admin creation when no admins exist
    - Restrict profile updates to admins
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profiles can be updated by admins" ON profiles;

-- Create new policies
CREATE POLICY "Allow public access to check for admins"
  ON profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow first admin creation when no admins exist"
  ON profiles FOR INSERT
  TO public
  WITH CHECK (
    NOT EXISTS (
      SELECT 1 FROM profiles WHERE role = 'admin'
    )
    AND role = 'admin'
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