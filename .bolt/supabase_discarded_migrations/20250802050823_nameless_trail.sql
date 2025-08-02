/*
  # إنشاء المستخدم الإداري

  1. إنشاء مستخدم إداري في جدول auth.users
  2. إنشاء ملف شخصي للمستخدم الإداري
  3. ضمان الربط الصحيح بين الجداول
*/

-- إنشاء مستخدم إداري في جدول المصادقة
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
  role
) VALUES (
  'ba9a2b8c-0012-49eb-82fc-47d2e892925c',
  '00000000-0000-0000-0000-000000000000',
  'myscreen999@gmail.com',
  crypt('myscreen999', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "مدير النظام"}',
  false,
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- إنشاء الملف الشخصي للمستخدم الإداري
INSERT INTO public.profiles (
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
  '2025-01-01',
  '2026-01-01',
  true,
  true,
  now(),
  now()
) ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_admin = true,
  is_verified = true,
  updated_at = now();

-- إنشاء بعض المنشورات التجريبية
INSERT INTO public.posts (
  id,
  title,
  content,
  media_url,
  media_type,
  created_by,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  'مرحباً بكم في منصة ONG A.A.S',
  'نحن سعداء لإطلاق منصتنا الجديدة لخدمة المجتمع الموريتاني في مجال التأمين. هذه المنصة ستساعدكم في تقديم المطالبات ومتابعة حالتها بكل سهولة.',
  'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
  'image',
  (SELECT id FROM public.profiles WHERE user_id = 'ba9a2b8c-0012-49eb-82fc-47d2e892925c'),
  now(),
  now()
),
(
  gen_random_uuid(),
  'نصائح مهمة للتأمين على السيارات',
  'يجب على جميع أصحاب السيارات التأكد من تجديد تأمين سياراتهم قبل انتهاء الصلاحية. كما ننصح بالاحتفاظ بجميع الوثائق المطلوبة في السيارة.',
  'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800',
  'image',
  (SELECT id FROM public.profiles WHERE user_id = 'ba9a2b8c-0012-49eb-82fc-47d2e892925c'),
  now() - interval '1 day',
  now() - interval '1 day'
),
(
  gen_random_uuid(),
  'ورشة عمل حول حقوق المؤمنين',
  'ستقام ورشة عمل مجانية حول حقوق المؤمنين وكيفية التعامل مع شركات التأمين. الورشة ستكون يوم السبت القادم في مقر الجمعية.',
  null,
  null,
  (SELECT id FROM public.profiles WHERE user_id = 'ba9a2b8c-0012-49eb-82fc-47d2e892925c'),
  now() - interval '2 days',
  now() - interval '2 days'
);