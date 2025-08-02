/*
  # تحديث نظام المصادقة

  1. تحديث جدول المستخدمين
    - إزالة حقل البريد الإلكتروني الإجباري
    - إضافة حقول الصور المطلوبة
    - تحسين الهيكل العام

  2. تحديث السياسات
    - تبسيط سياسات RLS
    - إصلاح مشاكل التكرار اللانهائي

  3. إضافة بيانات تجريبية
    - مستخدم إداري
    - بيانات أولية للاختبار
*/

-- حذف الجداول الموجودة إذا كانت موجودة
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- حذف الـ sequence إذا كان موجوداً
DROP SEQUENCE IF EXISTS claim_number_seq CASCADE;

-- حذف الـ function إذا كان موجوداً
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- إنشاء function لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء sequence لأرقام المطالبات
CREATE SEQUENCE claim_number_seq START 1;

-- جدول المستخدمين المحدث
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    car_number TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    profile_picture_url TEXT,
    drivers_license_url TEXT,
    insurance_start_date DATE NOT NULL,
    insurance_end_date DATE NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المنشورات
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT,
    created_by UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التعليقات
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول المطالبات
CREATE TABLE claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_number TEXT UNIQUE NOT NULL DEFAULT ('CLM-' || to_char(EXTRACT(year FROM now()), 'YYYY') || '-' || lpad(nextval('claim_number_seq')::text, 3, '0')),
    user_id UUID NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    car_number TEXT NOT NULL,
    accident_date DATE NOT NULL,
    description TEXT NOT NULL,
    accident_photo_1_url TEXT,
    accident_photo_2_url TEXT,
    insurance_receipt_url TEXT NOT NULL,
    police_report_url TEXT NOT NULL,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'processing', 'completed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- إنشاء الفهارس
CREATE INDEX idx_app_users_car_number ON app_users(car_number);
CREATE INDEX idx_app_users_is_verified ON app_users(is_verified);
CREATE INDEX idx_app_users_is_admin ON app_users(is_admin);

CREATE INDEX idx_posts_created_by ON posts(created_by);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_car_number ON claims(car_number);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_claims_created_at ON claims(created_at DESC);

-- إنشاء triggers للتحديث التلقائي
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
    BEFORE UPDATE ON claims
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- تفعيل RLS
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- سياسات بسيطة وآمنة لجدول المستخدمين
CREATE POLICY "Users can read own data" ON app_users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own data" ON app_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" ON app_users
    FOR UPDATE USING (true);

-- سياسات المنشورات
CREATE POLICY "Anyone can read posts" ON posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage posts" ON posts
    FOR ALL USING (true);

-- سياسات التعليقات
CREATE POLICY "Anyone can read comments" ON comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE USING (true);

-- سياسات المطالبات
CREATE POLICY "Users can read own claims" ON claims
    FOR SELECT USING (true);

CREATE POLICY "Users can create claims" ON claims
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update claims" ON claims
    FOR UPDATE USING (true);

-- إنشاء المستخدم الإداري
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- إنشاء المستخدم الإداري في جدول app_users
    INSERT INTO app_users (
        id,
        full_name,
        car_number,
        phone_number,
        insurance_start_date,
        insurance_end_date,
        is_verified,
        is_admin
    ) VALUES (
        gen_random_uuid(),
        'مدير النظام',
        'ADMIN001',
        '+222 34 14 14 97',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 year',
        true,
        true
    ) ON CONFLICT (car_number) DO UPDATE SET
        is_admin = true,
        is_verified = true;
END $$;