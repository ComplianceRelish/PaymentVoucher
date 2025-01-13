/*
  # Initial Schema Setup for Payment Approval System

  1. New Tables
    - `profiles`
      - Extends auth.users with additional user information
      - Links to Supabase Auth
    - `account_heads`
      - Stores payment categories/accounts
    - `payment_vouchers`
      - Stores payment requests and their status
  
  2. Security
    - Enable RLS on all tables
    - Add policies for each user role
    - Secure access based on user roles
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'requester', 'approver');
CREATE TYPE voucher_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'requester',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_heads table
CREATE TABLE IF NOT EXISTS account_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_vouchers table
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  payee text NOT NULL,
  account_head_id uuid REFERENCES account_heads(id),
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  status voucher_status NOT NULL DEFAULT 'pending',
  requested_by uuid REFERENCES profiles(id),
  requested_date timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES profiles(id),
  approved_date timestamptz,
  rejected_by uuid REFERENCES profiles(id),
  rejected_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Profiles can be updated by admins"
  ON profiles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ));

-- Account heads policies
CREATE POLICY "Account heads are viewable by authenticated users"
  ON account_heads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Account heads can be managed by admins"
  ON account_heads FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ));

-- Payment vouchers policies
CREATE POLICY "Vouchers are viewable by authenticated users"
  ON payment_vouchers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Vouchers can be created by requesters"
  ON payment_vouchers FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'requester'
  ));

CREATE POLICY "Vouchers can be approved/rejected by approvers"
  ON payment_vouchers FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'approver'
  ))
  WITH CHECK (
    status IN ('approved', 'rejected')
  );

-- Functions
CREATE OR REPLACE FUNCTION generate_voucher_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.voucher_number := 'VCH' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(CAST((
    SELECT COALESCE(MAX(CAST(SUBSTRING(voucher_number FROM 12) AS INTEGER)), 0) + 1
    FROM payment_vouchers
    WHERE SUBSTRING(voucher_number FROM 4 FOR 8) = TO_CHAR(NOW(), 'YYYYMMDD')
  ) AS TEXT), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_voucher_number
  BEFORE INSERT ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION generate_voucher_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_heads_updated_at
  BEFORE UPDATE ON account_heads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_vouchers_updated_at
  BEFORE UPDATE ON payment_vouchers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();