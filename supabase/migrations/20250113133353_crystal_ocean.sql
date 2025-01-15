/*
  # Create Database Tables

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `role` (user_role enum)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `account_heads`
      - `id` (uuid, primary key)
      - `name` (text)
      - `code` (text, unique)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `payment_vouchers`
      - `id` (uuid, primary key)
      - `voucher_number` (text, unique)
      - `date` (timestamptz)
      - `payee` (text)
      - `account_head_id` (uuid, foreign key)
      - `description` (text)
      - `amount` (decimal)
      - `status` (voucher_status enum)
      - `requested_by` (uuid, foreign key)
      - `requested_date` (timestamptz)
      - `approved_by` (uuid, foreign key)
      - `approved_date` (timestamptz)
      - `rejected_by` (uuid, foreign key)
      - `rejected_date` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Create custom types if they don't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'requester', 'approver');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE voucher_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'requester',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create account_heads table if it doesn't exist
CREATE TABLE IF NOT EXISTS account_heads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create payment_vouchers table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number text NOT NULL UNIQUE,
  date timestamptz NOT NULL DEFAULT now(),
  payee text NOT NULL,
  account_head_id uuid NOT NULL REFERENCES account_heads(id),
  description text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  status voucher_status NOT NULL DEFAULT 'pending',
  requested_by uuid NOT NULL REFERENCES profiles(id),
  requested_date timestamptz NOT NULL DEFAULT now(),
  approved_by uuid REFERENCES profiles(id),
  approved_date timestamptz,
  rejected_by uuid REFERENCES profiles(id),
  rejected_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(active);
CREATE INDEX IF NOT EXISTS idx_account_heads_active ON account_heads(active);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_account_head ON payment_vouchers(account_head_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_vouchers ENABLE ROW LEVEL SECURITY;

-- Create or replace policies
DO $$ BEGIN
  -- Profiles policies
  DROP POLICY IF EXISTS "profiles_select" ON profiles;
  DROP POLICY IF EXISTS "profiles_insert" ON profiles;
  DROP POLICY IF EXISTS "profiles_update" ON profiles;

  CREATE POLICY "profiles_select"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "profiles_insert"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = id OR
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
      auth.uid() = id OR
      (
        SELECT role = 'admin'
        FROM profiles
        WHERE id = auth.uid()
        LIMIT 1
      ) IS NOT NULL
    );

  -- Account heads policies
  DROP POLICY IF EXISTS "account_heads_select" ON account_heads;
  DROP POLICY IF EXISTS "account_heads_all" ON account_heads;

  CREATE POLICY "account_heads_select"
    ON account_heads FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "account_heads_all"
    ON account_heads FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'admin'
        LIMIT 1
      )
    );

  -- Payment vouchers policies
  DROP POLICY IF EXISTS "payment_vouchers_select" ON payment_vouchers;
  DROP POLICY IF EXISTS "payment_vouchers_insert" ON payment_vouchers;
  DROP POLICY IF EXISTS "payment_vouchers_update" ON payment_vouchers;

  CREATE POLICY "payment_vouchers_select"
    ON payment_vouchers FOR SELECT
    TO authenticated
    USING (true);

  CREATE POLICY "payment_vouchers_insert"
    ON payment_vouchers FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'requester' OR role = 'admin')
        LIMIT 1
      )
    );

  CREATE POLICY "payment_vouchers_update"
    ON payment_vouchers FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND (role = 'approver' OR role = 'admin')
        LIMIT 1
      )
    );
END $$;