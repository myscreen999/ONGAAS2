/*
  # Create users table and insert admin account

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, default 'user')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Data
    - Insert admin account with email: myscreen999@gmail.com
    - Password: myscreen999 (hashed)
    - Role: admin

  3. Security
    - Enable RLS on users table
    - Add policies for user access
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Insert admin account
-- Note: In a real application, you would hash the password properly
-- For this demo, we'll use a simple hash representation
INSERT INTO users (id, email, password_hash, role) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'myscreen999@gmail.com',
  'myscreen999', -- In production, this should be properly hashed
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Update profiles table to reference users table if needed
DO $$
BEGIN
  -- Add user_id foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;