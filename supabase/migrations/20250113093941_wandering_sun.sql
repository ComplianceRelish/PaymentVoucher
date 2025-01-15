/*
  # Fix database schema and relationships

  1. Changes
    - Drop and recreate tables with proper relationships
    - Fix foreign key constraints
    - Update RLS policies
    - Add indexes for better performance

  2. Security
    - Maintain RLS policies
    - Ensure proper access control
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
  email text NOT NULL UNIQUE,
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

-- Create payment_vouchers table with proper foreign key references
CREATE TABLE payment_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  payee text NOT NULL,
  account_head_id uuid NOT NULL REFERENCES account_heads(id) ON DELETE RESTRICT,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  status voucher_status NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  requested_date timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  approved_date timestamptz,
  rejected_by uuid REFERENCES profiles(id) ON DELETE RESTRICT,
  rejected_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_account_heads_active ON account_heads(active);
CREATE INDEX idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX idx_payment_vouchers_account_head ON payment_vouchers(account_head_id);
CREATE INDEX idx_payment_vouchers_requested_by ON payment_vouchers(requested_by);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_policy" 
  ON profiles FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "profiles_insert_policy" 
  ON profiles FOR INSERT 
  TO authenticated 
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "profiles_update_policy" 
  ON profiles FOR UPDATE 
  TO authenticated 
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Account heads policies
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

-- Payment vouchers policies
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
      AND (profiles.role = 'requester' OR profiles.role = 'admin')
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

-- Insert default admin user profile if it doesn't exist
INSERT INTO profiles (id, name, email, role, active)
VALUES (
  '0d989055-8449-4797-8b2d-d9b25cef16be',
  'Motty Philip',
  'motty.philip@gmail.com',
  'admin',
  true
)
ON CONFLICT (id) DO NOTHING;