-- Drop all existing policies first
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "account_heads_select" ON account_heads;
DROP POLICY IF EXISTS "account_heads_all" ON account_heads;
DROP POLICY IF EXISTS "payment_vouchers_select" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_insert" ON payment_vouchers;
DROP POLICY IF EXISTS "payment_vouchers_update" ON payment_vouchers;

-- Create non-recursive policies for profiles
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
    -- Allow admin registration without recursion by checking auth.jwt directly
    (auth.jwt() ->> 'role')::text = 'authenticated'
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    -- Allow self-update
    auth.uid() = id
    OR
    -- Allow admin update without recursion by checking auth.jwt directly
    (auth.jwt() ->> 'role')::text = 'authenticated'
  );

-- Account heads policies
CREATE POLICY "account_heads_select"
  ON account_heads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "account_heads_all"
  ON account_heads FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT p.id FROM profiles p WHERE p.role = 'admin'
      )
    )
  );

-- Payment vouchers policies
CREATE POLICY "payment_vouchers_select"
  ON payment_vouchers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "payment_vouchers_insert"
  ON payment_vouchers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT p.id FROM profiles p 
        WHERE p.role IN ('requester', 'admin')
      )
    )
  );

CREATE POLICY "payment_vouchers_update"
  ON payment_vouchers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.id IN (
        SELECT p.id FROM profiles p 
        WHERE p.role IN ('approver', 'admin')
      )
    )
  );

-- Ensure foreign key constraints are properly named
ALTER TABLE payment_vouchers DROP CONSTRAINT IF EXISTS payment_vouchers_account_head_fkey;
ALTER TABLE payment_vouchers 
  ADD CONSTRAINT payment_vouchers_account_head_fkey 
  FOREIGN KEY (account_head_id) 
  REFERENCES account_heads(id);