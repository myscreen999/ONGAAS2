/*
  # إصلاح صلاحيات المدير

  1. التحقق من وجود المستخدم الإداري
  2. تحديث صلاحياته إذا كان موجوداً
  3. إنشاؤه إذا لم يكن موجوداً
  4. ربطه بجدول app_users بشكل صحيح
*/

-- إنشاء أو تحديث المستخدم الإداري في auth.users
DO $$
DECLARE
    admin_user_id uuid;
BEGIN
    -- البحث عن المستخدم الإداري
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'myscreen999@gmail.com';
    
    -- إذا لم يكن موجوداً، إنشاؤه
    IF admin_user_id IS NULL THEN
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
            gen_random_uuid(),
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
        )
        RETURNING id INTO admin_user_id;
    END IF;
    
    -- إنشاء أو تحديث الملف الشخصي في app_users
    INSERT INTO app_users (
        id,
        email,
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
        admin_user_id,
        'myscreen999@gmail.com',
        'مدير النظام',
        'ADMIN001',
        '+222 34 14 14 97',
        '2024-01-01',
        '2025-12-31',
        true,
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        is_admin = true,
        is_verified = true,
        updated_at = now();
        
    -- التأكد من أن المستخدم له صلاحيات إدارية
    UPDATE app_users 
    SET is_admin = true, is_verified = true, updated_at = now()
    WHERE email = 'myscreen999@gmail.com';
    
END $$;