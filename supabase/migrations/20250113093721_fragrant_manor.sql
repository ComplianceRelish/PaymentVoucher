/*
  # Database Setup and Default Admin

  1. Changes
    - Drop and recreate all tables with proper relationships
    - Add default admin user
    - Simplify RLS policies

  2. Security
    - Enable RLS on all tables
    - Add simplified policies for each table
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payment_vouchers CASCADE;
DROP TABLE IF EXISTS account_heads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS voucher_status CASCADE;

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'requester', 'approver');
CREATE TYPE voucher_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  role user_role NOT NULL DEFAULT 'requester',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create account_heads table
CREATE TABLE account_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_vouchers table
CREATE TABLE payment_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  payee text NOT NULL,
  account_head_id uuid NOT NULL REFERENCES account_heads(id),
  description text NOT NULL,
  amount decimal(12,2) NOT NULL,
  status voucher_status NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL REFERENCES profiles(id),
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

-- Simple RLS policies
CREATE POLICY "profiles_select_policy" 
  ON profiles FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "profiles_insert_policy" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "account_heads_select_policy" 
  ON account_heads FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "account_heads_all_policy" 
  ON account_heads FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "payment_vouchers_select_policy" 
  ON payment_vouchers FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "payment_vouchers_insert_policy" 
  ON payment_vouchers FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'requester'
    )
  );

CREATE POLICY "payment_vouchers_update_policy" 
  ON payment_vouchers FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND (profiles.role = 'approver' OR profiles.role = 'admin')
    )
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

-- Insert default admin user profile
INSERT INTO profiles (id, name, email, role, active)
VALUES (
  '42bf2c3e-d46a-4d69-9414-ac742a3e3500',
  'Motty Philip',
  'motty.philip@gmail.com',
  'admin',
  true
);