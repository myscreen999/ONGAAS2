/*
  # إنشاء قاعدة البيانات الكاملة لنظام ONG A.A.S

  ## الجداول المُنشأة:
  1. app_users - جدول المستخدمين
  2. posts - جدول المنشورات
  3. comments - جدول التعليقات  
  4. claims - جدول المطالبات

  ## الميزات:
  - Row Level Security (RLS) مفعل على جميع الجداول
  - سياسات أمان محسنة
  - فهارس للأداء العالي
  - تحديث تلقائي للتواريخ
  - أرقام مطالبات تلقائية
  - مستخدم إداري جاهز
*/

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- إنشاء sequence لأرقام المطالبات
CREATE SEQUENCE IF NOT EXISTS claim_number_seq START 1;

-- إنشاء function لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===================================
-- جدول المستخدمين (app_users)
-- ===================================

CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    car_number TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    profile_picture_url TEXT,
    drivers_license_url TEXT,
    insurance_start_date DATE NOT NULL,
    insurance_end_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_car_number ON app_users(car_number);
CREATE INDEX IF NOT EXISTS idx_app_users_is_verified ON app_users(is_verified);
CREATE INDEX IF NOT EXISTS idx_app_users_is_admin ON app_users(is_admin);

-- تفعيل RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
DROP POLICY IF EXISTS "Users can read own data" ON app_users;
DROP POLICY IF EXISTS "Users can update own data" ON app_users;
DROP POLICY IF EXISTS "Anyone can insert users" ON app_users;

CREATE POLICY "Users can read own data" ON app_users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON app_users
    FOR UPDATE USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Anyone can insert users" ON app_users
    FOR INSERT WITH CHECK (true);

-- trigger للتحديث التلقائي
DROP TRIGGER IF EXISTS update_app_users_updated_at ON app_users;
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- جدول المنشورات (posts)
-- ===================================

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    created_by UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_posts_created_by ON posts(created_by);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

-- تفعيل RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
DROP POLICY IF EXISTS "Anyone can read posts" ON posts;
DROP POLICY IF EXISTS "Authenticated users can manage posts" ON posts;

CREATE POLICY "Anyone can read posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage posts" ON posts
    FOR ALL USING (auth.uid() IS NOT NULL);

-- trigger للتحديث التلقائي
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- جدول التعليقات (comments)
-- ===================================

CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- تفعيل RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
DROP POLICY IF EXISTS "Anyone can read comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;

CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- ===================================
-- جدول المطالبات (claims)
-- ===================================

CREATE TABLE IF NOT EXISTS claims (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    claim_number TEXT UNIQUE NOT NULL DEFAULT (
        'CLM-' || 
        EXTRACT(YEAR FROM NOW())::TEXT || 
        '-' || 
        LPAD(nextval('claim_number_seq')::TEXT, 3, '0')
    ),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    car_number TEXT NOT NULL,
    accident_date DATE NOT NULL,
    description TEXT NOT NULL,
    accident_photo_1_url TEXT,
    accident_photo_2_url TEXT,
    insurance_receipt_url TEXT NOT NULL,
    police_report_url TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'submitted' CHECK (
        status IN ('submitted', 'under_review', 'processing', 'completed', 'rejected')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);
CREATE INDEX IF NOT EXISTS idx_claims_car_number ON claims(car_number);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

-- تفعيل RLS
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
DROP POLICY IF EXISTS "Users can read own claims" ON claims;
DROP POLICY IF EXISTS "Users can create claims" ON claims;
DROP POLICY IF EXISTS "Authenticated users can update claims" ON claims;

CREATE POLICY "Users can read own claims" ON claims
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create claims" ON claims
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Authenticated users can update claims" ON claims
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- trigger للتحديث التلقائي
DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- إنشاء المستخدم الإداري
-- ===================================

-- التحقق من وجود المستخدم الإداري وإنشاؤه
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- البحث عن المستخدم الإداري
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'myscreen999@gmail.com';
    
    -- إذا لم يوجد، إنشاؤه
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
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "مدير النظام"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- إنشاء أو تحديث ملف المدير في app_users
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
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        true,
        true
    ) ON CONFLICT (id) DO UPDATE SET
        is_admin = true,
        is_verified = true,
        updated_at = NOW();
        
END $$;

-- ===================================
-- منح الصلاحيات النهائية
-- ===================================

-- منح صلاحيات كاملة للمدير على جميع الجداول
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- تأكيد إعدادات RLS
ALTER TABLE app_users FORCE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;
ALTER TABLE comments FORCE ROW LEVEL SECURITY;
ALTER TABLE claims FORCE ROW LEVEL SECURITY;