/*
  # Fix RLS Policy Infinite Recursion

  1. Drop existing problematic policies
  2. Create new non-recursive policies
  3. Security
    - Users can only read/update their own profile
    - Simple policies without recursion
*/

-- Drop all existing policies for profiles table
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Drop problematic policies for other tables
DROP POLICY IF EXISTS "Admin can read all claims" ON claims;
DROP POLICY IF EXISTS "Admin can update claims" ON claims;
DROP POLICY IF EXISTS "Admin can create posts" ON posts;
DROP POLICY IF EXISTS "Admin can update posts" ON posts;
DROP POLICY IF EXISTS "Admin can delete posts" ON posts;

-- Create simple policies for posts (allow all authenticated users to read)
CREATE POLICY "Everyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

-- Create simple policies for claims
CREATE POLICY "Users can read own claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  ));

CREATE POLICY "Verified users can create claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND is_verified = true
  ));

-- Create simple policies for comments
CREATE POLICY "Everyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Verified users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND is_verified = true
  ));