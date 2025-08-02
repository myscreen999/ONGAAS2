/*
  # إنشاء جدول المستخدمين

  1. جداول جديدة
    - `app_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `car_number` (text, unique)
      - `phone_number` (text)
      - `profile_picture_url` (text, nullable)
      - `drivers_license_url` (text, nullable)
      - `insurance_start_date` (date)
      - `insurance_end_date` (date)
      - `is_verified` (boolean, default false)
      - `is_admin` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جدول `app_users`
    - إضافة سياسات للقراءة والتحديث
*/

-- إنشاء جدول المستخدمين
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

-- تفعيل Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- سياسة للمستخدمين لقراءة بياناتهم الشخصية
CREATE POLICY "Users can read own data"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- سياسة للمستخدمين لتحديث بياناتهم الشخصية
CREATE POLICY "Users can update own data"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- سياسة للإدارة لقراءة جميع البيانات
CREATE POLICY "Admin can read all users"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- سياسة للإدارة لتحديث جميع البيانات
CREATE POLICY "Admin can update all users"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE email = auth.jwt() ->> 'email' 
      AND is_admin = true
    )
  );

-- سياسة لإنشاء مستخدمين جدد
CREATE POLICY "Allow user registration"
  ON app_users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_app_users_car_number ON app_users(car_number);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_is_verified ON app_users(is_verified);
CREATE INDEX IF NOT EXISTS idx_app_users_is_admin ON app_users(is_admin);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();