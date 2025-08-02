/*
  # إنشاء جميع الجداول من جديد

  1. الجداول الجديدة
    - `app_users` - جدول المستخدمين
    - `posts` - جدول المنشورات
    - `comments` - جدول التعليقات  
    - `claims` - جدول المطالبات

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات الأمان المناسبة

  3. الفهارس والقيود
    - فهارس محسنة للأداء
    - قيود فريدة وأجنبية
*/

-- إنشاء extension للـ UUID إذا لم يكن موجود
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
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

-- إنشاء جدول المنشورات
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text,
  created_by uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول التعليقات
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء sequence لأرقام المطالبات
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

-- إنشاء جدول المطالبات
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number text UNIQUE NOT NULL DEFAULT 'CLM-' || TO_CHAR(EXTRACT(YEAR FROM NOW()), 'YYYY') || '-' || LPAD(nextval('claim_number_seq')::text, 3, '0'),
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
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

-- إنشاء function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON app_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_app_users_car_number ON app_users(car_number);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_is_verified ON app_users(is_verified);
CREATE INDEX IF NOT EXISTS idx_app_users_is_admin ON app_users(is_admin);

CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_car_number ON claims(car_number);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

-- تفعيل Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان لجدول المستخدمين
DROP POLICY IF EXISTS "Users can read own data" ON app_users;
CREATE POLICY "Users can read own data"
  ON app_users
  FOR SELECT
  USING (
    auth.uid()::text = id::text OR 
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can update own data" ON app_users;
CREATE POLICY "Users can update own data"
  ON app_users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admins can update any user" ON app_users;
CREATE POLICY "Admins can update any user"
  ON app_users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Anyone can insert users" ON app_users;
CREATE POLICY "Anyone can insert users"
  ON app_users
  FOR INSERT
  WITH CHECK (true);

-- سياسات الأمان لجدول المنشورات
DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage posts" ON posts;
CREATE POLICY "Admins can manage posts"
  ON posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

-- سياسات الأمان لجدول التعليقات
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Verified users can create comments" ON comments;
CREATE POLICY "Verified users can create comments"
  ON comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_verified = true
    )
  );

DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

-- سياسات الأمان لجدول المطالبات
DROP POLICY IF EXISTS "Users can read own claims" ON claims;
CREATE POLICY "Users can read own claims"
  ON claims
  FOR SELECT
  USING (
    auth.uid()::text = user_id::text OR
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Verified users can create claims" ON claims;
CREATE POLICY "Verified users can create claims"
  ON claims
  FOR INSERT
  WITH CHECK (
    auth.uid()::text = user_id::text AND
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_verified = true
    )
  );

DROP POLICY IF EXISTS "Admins can update claims" ON claims;
CREATE POLICY "Admins can update claims"
  ON claims
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE id::text = auth.uid()::text AND is_admin = true
    )
  );

-- إنشاء المستخدم الإداري
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- البحث عن المستخدم الإداري الموجود
  SELECT id INTO admin_user_id 
  FROM auth.users 
  WHERE email = 'myscreen999@gmail.com';
  
  -- إذا لم يكن موجود، إنشاؤه
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uuid_generate_v4(),
      'authenticated',
      'authenticated',
      'myscreen999@gmail.com',
      crypt('myscreen999', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"مدير النظام"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO admin_user_id;
  END IF;
  
  -- إنشاء الملف الشخصي للمدير
  INSERT INTO app_users (
    id,
    email,
    full_name,
    car_number,
    phone_number,
    insurance_start_date,
    insurance_end_date,
    is_verified,
    is_admin
  ) VALUES (
    admin_user_id,
    'myscreen999@gmail.com',
    'مدير النظام',
    'ADMIN001',
    '+222 34 14 14 97',
    '2025-01-01',
    '2025-12-31',
    true,
    true
  ) ON CONFLICT (id) DO NOTHING;
  
END $$;