/*
  # التحقق من وإصلاح جميع الجداول

  1. جدول المستخدمين (app_users)
    - معرف فريد، بريد إلكتروني، اسم كامل
    - رقم السيارة، رقم الهاتف
    - بيانات التأمين وحالة التحقق
    
  2. جدول المنشورات (posts)
    - عنوان، محتوى، وسائط
    - مؤلف ومعلومات الإنشاء
    
  3. جدول التعليقات (comments)
    - محتوى التعليق
    - ربط بالمنشور والمستخدم
    
  4. جدول المطالبات (claims)
    - رقم المطالبة، تفاصيل الحادث
    - المرفقات والحالة والتقدم
    
  5. الأمان والصلاحيات
    - RLS مفعل على جميع الجداول
    - سياسات محددة لكل جدول
*/

-- إنشاء جدول المستخدمين إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- إنشاء جدول المنشورات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video')),
  created_by uuid REFERENCES app_users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول التعليقات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول المطالبات إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text UNIQUE NOT NULL DEFAULT 'CLM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('claims_sequence')::text, 3, '0'),
  user_id uuid REFERENCES app_users(id) ON DELETE CASCADE,
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

-- إنشاء sequence لأرقام المطالبات
CREATE SEQUENCE IF NOT EXISTS claims_sequence START 1;

-- إنشاء function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers لتحديث updated_at
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

-- تفعيل RLS على جميع الجداول
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
DROP POLICY IF EXISTS "Users can read own data" ON app_users;
CREATE POLICY "Users can read own data"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own data" ON app_users;
CREATE POLICY "Users can update own data"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Admin can read all users" ON app_users;
CREATE POLICY "Admin can read all users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin can update all users" ON app_users;
CREATE POLICY "Admin can update all users"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

-- سياسات جدول المنشورات
DROP POLICY IF EXISTS "Everyone can read posts" ON posts;
CREATE POLICY "Everyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can create posts" ON posts;
CREATE POLICY "Admin can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin can update posts" ON posts;
CREATE POLICY "Admin can update posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin can delete posts" ON posts;
CREATE POLICY "Admin can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

-- سياسات جدول التعليقات
DROP POLICY IF EXISTS "Everyone can read comments" ON comments;
CREATE POLICY "Everyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Verified users can create comments" ON comments;
CREATE POLICY "Verified users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_verified = true
    )
  );

-- سياسات جدول المطالبات
DROP POLICY IF EXISTS "Users can read own claims" ON claims;
CREATE POLICY "Users can read own claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM app_users
      WHERE auth.uid()::text = id::text
    )
  );

DROP POLICY IF EXISTS "Admin can read all claims" ON claims;
CREATE POLICY "Admin can read all claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

DROP POLICY IF EXISTS "Verified users can create claims" ON claims;
CREATE POLICY "Verified users can create claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM app_users
      WHERE auth.uid()::text = id::text AND is_verified = true
    )
  );

DROP POLICY IF EXISTS "Admin can update claims" ON claims;
CREATE POLICY "Admin can update claims"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth.uid()::text = id::text AND is_admin = true
    )
  );

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_car_number ON app_users(car_number);
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);