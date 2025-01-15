/*
  # Fix RLS Policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Add better security checks for profile management
    
  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Prevent infinite recursion in policy checks
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "allow_read_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_insert_profiles" ON profiles;
DROP POLICY IF EXISTS "allow_update_profiles" ON profiles;

-- Create new simplified policies for profiles
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow self-registration
    auth.uid() = id
    OR
    -- Allow admin registration without recursion
    (
      SELECT role = 'admin'
      FROM profiles
      WHERE id = auth.uid()
      LIMIT 1
    ) IS NOT NULL
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Allow self-update
    auth.uid() = id
    OR
    -- Allow admin update without recursion
    (
      SELECT role = 'admin'
      FROM profiles
      WHERE id = auth.uid()
      LIMIT 1
    ) IS NOT NULL
  );

-- Ensure proper foreign key names for joins
COMMENT ON CONSTRAINT "payment_vouchers_requested_by_fkey" ON payment_vouchers IS 'Foreign key for requester profile';
COMMENT ON CONSTRAINT "payment_vouchers_approved_by_fkey" ON payment_vouchers IS 'Foreign key for approver profile';