-- Drop existing policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

-- Create simplified non-recursive policies
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN profiles p ON u.id = p.id
      WHERE u.id = auth.uid()
      AND p.role = 'admin'
      AND p.active = true
      LIMIT 1
    )
  );

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1
      FROM auth.users u
      JOIN profiles p ON u.id = p.id
      WHERE u.id = auth.uid()
      AND p.role = 'admin'
      AND p.active = true
      LIMIT 1
    )
  );