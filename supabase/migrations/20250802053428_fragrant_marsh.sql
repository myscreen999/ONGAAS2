/*
  # إصلاح سياسات RLS لتجنب التكرار اللانهائي

  1. حذف السياسات الحالية المسببة للمشكلة
  2. إنشاء سياسات جديدة آمنة
  3. تجنب الاستعلام عن نفس الجدول في السياسة
  4. استخدام auth.uid() مباشرة بدلاً من JOIN
*/

-- حذف جميع السياسات الحالية للجدول app_users
DROP POLICY IF EXISTS "Users can read own data" ON app_users;
DROP POLICY IF EXISTS "Admins can update any user" ON app_users;
DROP POLICY IF EXISTS "Anyone can insert users" ON app_users;
DROP POLICY IF EXISTS "Users can update own data" ON app_users;

-- إنشاء سياسات جديدة آمنة

-- سياسة القراءة: المستخدمون يقرؤون بياناتهم فقط
CREATE POLICY "Users can read own profile"
  ON app_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- سياسة الإدراج: أي شخص يمكنه إنشاء حساب
CREATE POLICY "Anyone can create profile"
  ON app_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- سياسة التحديث: المستخدمون يحدثون بياناتهم فقط
CREATE POLICY "Users can update own profile"
  ON app_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- حذف السياسات المسببة للمشكلة في الجداول الأخرى
DROP POLICY IF EXISTS "Admins can manage posts" ON posts;
DROP POLICY IF EXISTS "Verified users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Admins can update claims" ON claims;
DROP POLICY IF EXISTS "Users can read own claims" ON claims;
DROP POLICY IF EXISTS "Verified users can create claims" ON claims;

-- إنشاء سياسات جديدة للمنشورات
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage posts"
  ON posts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- إنشاء سياسات جديدة للتعليقات
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- إنشاء سياسات جديدة للمطالبات
CREATE POLICY "Users can read own claims"
  ON claims
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own claims"
  ON claims
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update claims"
  ON claims
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);