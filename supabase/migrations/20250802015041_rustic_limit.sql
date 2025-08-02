/*
  # Initial Schema for ONG A.A.S Platform

  1. New Tables
    - `profiles` - User profiles with car numbers, documents, and verification status
    - `posts` - Announcements/posts from admin
    - `claims` - Insurance claims submitted by verified users
    - `comments` - Comments on posts

  2. Storage
    - `profile-pictures` bucket for user profile photos
    - `documents` bucket for licenses and insurance docs
    - `claim-photos` bucket for accident and receipt photos
    - `post-media` bucket for post images/videos

  3. Security
    - Enable RLS on all tables
    - Policies for user access control
    - Admin-only policies for sensitive operations
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  car_number text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  profile_picture_url text,
  drivers_license_url text,
  insurance_start_date date NOT NULL,
  insurance_end_date date NOT NULL,
  is_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  car_number text NOT NULL,
  accident_date date NOT NULL,
  description text NOT NULL,
  accident_photo_1_url text,
  accident_photo_2_url text,
  insurance_receipt_url text NOT NULL,
  police_report_url text NOT NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'processing', 'completed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can read all profiles" ON profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admin can update all profiles" ON profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Posts policies
CREATE POLICY "Everyone can read posts" ON posts
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admin can create posts" ON posts
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admin can update posts" ON posts
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admin can delete posts" ON posts
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Claims policies
CREATE POLICY "Users can read own claims" ON claims
  FOR SELECT TO authenticated
  USING (user_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Verified users can create claims" ON claims
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND is_verified = true
  ));

CREATE POLICY "Admin can read all claims" ON claims
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admin can update claims" ON claims
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true
  ));

-- Comments policies
CREATE POLICY "Everyone can read comments" ON comments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Verified users can create comments" ON comments
  FOR INSERT TO authenticated
  WITH CHECK (user_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid() AND is_verified = true
  ));

-- Function to generate claim numbers
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS text AS $$
DECLARE
  claim_num text;
  counter integer;
BEGIN
  -- Get the count of existing claims + 1
  SELECT COUNT(*) + 1 INTO counter FROM claims;
  
  -- Format as CLAIM-YYYY-NNNN
  claim_num := 'CLAIM-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(counter::text, 4, '0');
  
  RETURN claim_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate claim numbers
CREATE OR REPLACE FUNCTION set_claim_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := generate_claim_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_claim_number
  BEFORE INSERT ON claims
  FOR EACH ROW
  EXECUTE FUNCTION set_claim_number();

-- Storage buckets setup (these will be created via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES 
-- ('profile-pictures', 'profile-pictures', true),
-- ('documents', 'documents', false),
-- ('claim-photos', 'claim-photos', false),
-- ('post-media', 'post-media', true);