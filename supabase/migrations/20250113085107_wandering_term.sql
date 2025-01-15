/*
  # Fix profiles RLS and table structure
  
  1. Changes
    - Drop all existing policies
    - Create simpler policies without recursion
    - Add admin check function
    
  2. Security
    - Enable RLS
    - Allow public read access
    - Allow first admin creation
    - Allow admin management
*/

-- First, drop all existing policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Profiles can be updated by admins" ON profiles;
DROP POLICY IF EXISTS "Allow public access to check for admins" ON profiles;
DROP POLICY IF EXISTS "Allow first admin creation when no admins exist" ON profiles;
DROP POLICY IF EXISTS "Allow admin to manage profiles" ON profiles;

-- Create a function to check if a user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    JOIN public.profiles ON auth.users.id = profiles.id
    WHERE auth.users.id = auth.uid()
    AND profiles.role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if any admin exists
CREATE OR REPLACE FUNCTION public.has_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new simplified policies
CREATE POLICY "Enable read access for everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for first admin"
  ON profiles FOR INSERT
  WITH CHECK (
    role = 'admin' AND 
    NOT public.has_admin()
  );

CREATE POLICY "Enable all actions for admin users"
  ON profiles FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());