/*
  # إنشاء المستخدم الإداري وبيانات تجريبية

  1. إنشاء المستخدم الإداري
    - البريد الإلكتروني: myscreen999@gmail.com
    - كلمة المرور: myscreen999
    - صلاحيات إدارية كاملة

  2. إنشاء ملف شخصي للمستخدم الإداري
    - اسم كامل ومعلومات أساسية
    - تفعيل صلاحيات الإدارة والتحقق

  3. إضافة بيانات تجريبية
    - منشورات تجريبية
    - مطالبات تجريبية للاختبار
*/

-- إنشاء المستخدم الإداري (تجاهل إذا كان موجوداً)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud
) VALUES (
  'ba9a2b8c-0012-49eb-82fc-47d2e892925c',
  '00000000-0000-0000-0000-000000000000',
  'myscreen999@gmail.com',
  crypt('myscreen999', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير النظام", "car_number": "ADMIN001"}',
  false,
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- إنشاء الملف الشخصي للمستخدم الإداري (تجاهل إذا كان موجوداً)
INSERT INTO profiles (
  id,
  user_id,
  full_name,
  car_number,
  phone_number,
  insurance_start_date,
  insurance_end_date,
  is_verified,
  is_admin,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'ba9a2b8c-0012-49eb-82fc-47d2e892925c',
  'مدير النظام',
  'ADMIN001',
  '+222 34 14 14 97',
  '2024-01-01',
  '2025-12-31',
  true,
  true,
  now(),
  now()
) ON CONFLICT (car_number) DO NOTHING;

-- إضافة منشورات تجريبية (تجاهل إذا كانت موجودة)
DO $$
DECLARE
  admin_profile_id uuid;
BEGIN
  -- الحصول على معرف الملف الشخصي للمدير
  SELECT id INTO admin_profile_id 
  FROM profiles 
  WHERE car_number = 'ADMIN001' 
  LIMIT 1;

  -- إضافة منشور ترحيبي
  INSERT INTO posts (
    id,
    title,
    content,
    media_url,
    media_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'مرحباً بكم في منصة ONG A.A.S',
    'نرحب بجميع أعضاء الجمعية في المنصة الإلكترونية الجديدة. يمكنكم الآن تقديم مطالباتكم وتتبع حالتها بسهولة.',
    'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    'image',
    admin_profile_id,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- إضافة منشور إعلاني
  INSERT INTO posts (
    id,
    title,
    content,
    media_url,
    media_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'تحديثات جديدة في نظام المطالبات',
    'تم تحديث نظام معالجة المطالبات ليصبح أكثر سرعة وفعالية. يمكنكم الآن تتبع تقدم مطالباتكم بشكل مباشر.',
    'https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800',
    'image',
    admin_profile_id,
    now() - interval '1 day',
    now() - interval '1 day'
  ) ON CONFLICT (id) DO NOTHING;

  -- إضافة منشور تعليمي
  INSERT INTO posts (
    id,
    title,
    content,
    media_url,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    'كيفية تقديم مطالبة تأمين',
    'دليل شامل لتقديم مطالبة التأمين: 1) تجهيز الوثائق المطلوبة 2) تعبئة النموذج الإلكتروني 3) رفع الصور والمستندات 4) متابعة حالة المطالبة',
    admin_profile_id,
    now() - interval '2 days',
    now() - interval '2 days'
  ) ON CONFLICT (id) DO NOTHING;

END $$;