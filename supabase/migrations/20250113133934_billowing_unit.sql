/*
  # Final Database Fixes

  1. Changes
    - Drop and recreate tables with proper constraints
    - Ensure foreign key constraints are properly named
    - Update policies to avoid recursion
    - Add proper indexes
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payment_vouchers CASCADE;
DROP TABLE IF EXISTS account_heads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'requester',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'requester', 'approver'))
);

-- Create account_heads table
CREATE TABLE account_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment_vouchers table with explicit constraint names
CREATE TABLE payment_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  payee text NOT NULL,
  account_head_id uuid NOT NULL,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  status voucher_status NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL,
  requested_date timestamptz NOT NULL DEFAULT now(),
  approved_by uuid,
  approved_date timestamptz,
  rejected_by uuid,
  rejected_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT payment_vouchers_account_head_fkey FOREIGN KEY (account_head_id) REFERENCES account_heads(id),
  CONSTRAINT payment_vouchers_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES profiles(id),
  CONSTRAINT payment_vouchers_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id),
  CONSTRAINT payment_vouchers_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES profiles(id),
  CONSTRAINT payment_vouchers_status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(active);
CREATE INDEX idx_account_heads_active ON account_heads(active);
CREATE INDEX idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX idx_payment_vouchers_account_head ON payment_vouchers(account_head_id);
CREATE INDEX idx_payment_vouchers_requested_by ON payment_vouchers(requested_by);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "account_heads_select"
  ON account_heads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "account_heads_all"
  ON account_heads FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) = 'admin'
  );

CREATE POLICY "payment_vouchers_select"
  ON payment_vouchers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "payment_vouchers_insert"
  ON payment_vouchers FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('requester', 'admin')
  );

CREATE POLICY "payment_vouchers_update"
  ON payment_vouchers FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1) IN ('approver', 'admin')
  );

-- Insert default admin if not exists
INSERT INTO profiles (id, name, email, role, active)
VALUES (
  '0d989055-8449-4797-8b2d-d9b25cef16be',
  'Motty Philip',
  'motty.philip@gmail.com',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  active = true;