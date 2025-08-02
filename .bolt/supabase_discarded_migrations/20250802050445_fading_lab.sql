/*
  # Create Admin User

  1. Create admin user in auth.users
  2. Create admin profile in profiles table
  3. Set admin permissions

  This migration creates the default admin user for the system.
*/

-- Insert admin user into auth.users (this would normally be done through Supabase Auth)
-- For demo purposes, we'll create the profile directly

-- Create admin profile
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
  gen_random_uuid(), -- This should match the actual auth user ID
  'مدير النظام',
  'ADMIN001',
  '+222 34 14 14 97',
  '2025-01-01',
  '2025-12-31',
  true,
  true,
  now(),
  now()
) ON CONFLICT (car_number) DO NOTHING;

-- Create some sample posts
INSERT INTO posts (
  title,
  content,
  media_url,
  media_type,
  created_by
) VALUES 
(
  'إطلاق النظام الإلكتروني المتطور لمعالجة المطالبات',
  'يسعدنا أن نعلن عن إطلاق النظام الإلكتروني الجديد والمتطور لمعالجة المطالبات التأمينية. هذا النظام يوفر تتبعاً مباشراً لحالة المطالبة، إشعارات فورية، ومعالجة أسرع وأكثر شفافية.',
  'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=800',
  'image',
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
),
(
  'ورشة توعوية شاملة حول حقوق المؤمنين',
  'ندعوكم لحضور ورشة توعوية مجانية وشاملة حول حقوق المؤمنين، كيفية التعامل مع شركات التأمين، وأهمية التأمين الإجباري للمركبات.',
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
  'image',
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1)
)
ON CONFLICT DO NOTHING;