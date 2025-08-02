/*
  # إنشاء مستخدمين تجريبيين

  1. مستخدمين جدد
    - إنشاء 5 مستخدمين تجريبيين مع بيانات متنوعة
    - أرقام سيارات مختلفة
    - فترات تأمين متنوعة
    - بعضهم محقق وبعضهم غير محقق

  2. مطالبات تجريبية
    - إضافة مطالبات متنوعة للمستخدمين
    - حالات مختلفة (مقدمة، قيد المراجعة، مكتملة)
    - تقدم متنوع في المعالجة

  3. تعليقات تجريبية
    - تعليقات من المستخدمين على المنشورات الموجودة
*/

DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user3_id uuid;
    user4_id uuid;
    user5_id uuid;
    profile1_id uuid;
    profile2_id uuid;
    profile3_id uuid;
    profile4_id uuid;
    profile5_id uuid;
    post_id uuid;
BEGIN
    -- إنشاء المستخدم الأول
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
        '1234abc@ongaas.mr',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "أحمد محمد الأمين", "car_number": "1234ABC"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user1_id;

    -- إنشاء الملف الشخصي للمستخدم الأول
    IF user1_id IS NOT NULL THEN
        INSERT INTO profiles (
            user_id,
            full_name,
            car_number,
            phone_number,
            insurance_start_date,
            insurance_end_date,
            is_verified,
            is_admin
        ) VALUES (
            user1_id,
            'أحمد محمد الأمين',
            '1234ABC',
            '+222 12 34 56 78',
            '2024-01-01',
            '2025-01-01',
            true,
            false
        ) ON CONFLICT (car_number) DO NOTHING
        RETURNING id INTO profile1_id;
    END IF;

    -- إنشاء المستخدم الثاني
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
        '5678def@ongaas.mr',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "فاطمة بنت محمد", "car_number": "5678DEF"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user2_id;

    -- إنشاء الملف الشخصي للمستخدم الثاني
    IF user2_id IS NOT NULL THEN
        INSERT INTO profiles (
            user_id,
            full_name,
            car_number,
            phone_number,
            insurance_start_date,
            insurance_end_date,
            is_verified,
            is_admin
        ) VALUES (
            user2_id,
            'فاطمة بنت محمد',
            '5678DEF',
            '+222 23 45 67 89',
            '2024-03-15',
            '2025-03-15',
            true,
            false
        ) ON CONFLICT (car_number) DO NOTHING
        RETURNING id INTO profile2_id;
    END IF;

    -- إنشاء المستخدم الثالث
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
        '9999xyz@ongaas.mr',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "عبد الله ولد أحمد", "car_number": "9999XYZ"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user3_id;

    -- إنشاء الملف الشخصي للمستخدم الثالث (غير محقق)
    IF user3_id IS NOT NULL THEN
        INSERT INTO profiles (
            user_id,
            full_name,
            car_number,
            phone_number,
            insurance_start_date,
            insurance_end_date,
            is_verified,
            is_admin
        ) VALUES (
            user3_id,
            'عبد الله ولد أحمد',
            '9999XYZ',
            '+222 34 56 78 90',
            '2024-06-01',
            '2025-06-01',
            false,
            false
        ) ON CONFLICT (car_number) DO NOTHING
        RETURNING id INTO profile3_id;
    END IF;

    -- إنشاء المستخدم الرابع
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
        '7777mno@ongaas.mr',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "مريم بنت عبد الرحمن", "car_number": "7777MNO"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user4_id;

    -- إنشاء الملف الشخصي للمستخدم الرابع
    IF user4_id IS NOT NULL THEN
        INSERT INTO profiles (
            user_id,
            full_name,
            car_number,
            phone_number,
            insurance_start_date,
            insurance_end_date,
            is_verified,
            is_admin
        ) VALUES (
            user4_id,
            'مريم بنت عبد الرحمن',
            '7777MNO',
            '+222 45 67 89 01',
            '2024-02-10',
            '2025-02-10',
            true,
            false
        ) ON CONFLICT (car_number) DO NOTHING
        RETURNING id INTO profile4_id;
    END IF;

    -- إنشاء المستخدم الخامس
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
        '3333pqr@ongaas.mr',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"full_name": "محمد ولد عبد الله", "car_number": "3333PQR"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO NOTHING
    RETURNING id INTO user5_id;

    -- إنشاء الملف الشخصي للمستخدم الخامس (غير محقق)
    IF user5_id IS NOT NULL THEN
        INSERT INTO profiles (
            user_id,
            full_name,
            car_number,
            phone_number,
            insurance_start_date,
            insurance_end_date,
            is_verified,
            is_admin
        ) VALUES (
            user5_id,
            'محمد ولد عبد الله',
            '3333PQR',
            '+222 56 78 90 12',
            '2024-08-20',
            '2025-08-20',
            false,
            false
        ) ON CONFLICT (car_number) DO NOTHING
        RETURNING id INTO profile5_id;
    END IF;

    -- إنشاء مطالبات تجريبية للمستخدمين المحققين
    IF profile1_id IS NOT NULL THEN
        INSERT INTO claims (
            user_id,
            car_number,
            accident_date,
            description,
            accident_photo_1_url,
            insurance_receipt_url,
            police_report_url,
            progress,
            status
        ) VALUES (
            profile1_id,
            '1234ABC',
            '2024-12-15',
            'حادث تصادم بسيط في شارع الاستقلال، أضرار في المصد الأمامي والمصباح الأيمن',
            'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
            75,
            'processing'
        ) ON CONFLICT (claim_number) DO NOTHING;
    END IF;

    IF profile2_id IS NOT NULL THEN
        INSERT INTO claims (
            user_id,
            car_number,
            accident_date,
            description,
            accident_photo_1_url,
            accident_photo_2_url,
            insurance_receipt_url,
            police_report_url,
            progress,
            status
        ) VALUES (
            profile2_id,
            '5678DEF',
            '2024-11-28',
            'حادث انزلاق على الطريق المبلل، خدوش في الجانب الأيسر للسيارة',
            'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
            100,
            'completed'
        ) ON CONFLICT (claim_number) DO NOTHING;
    END IF;

    IF profile4_id IS NOT NULL THEN
        INSERT INTO claims (
            user_id,
            car_number,
            accident_date,
            description,
            insurance_receipt_url,
            police_report_url,
            progress,
            status
        ) VALUES (
            profile4_id,
            '7777MNO',
            '2025-01-10',
            'كسر في الزجاج الأمامي بسبب حجر صغير أثناء القيادة على الطريق السريع',
            'https://images.pexels.com/photos/6863183/pexels-photo-6863183.jpeg?auto=compress&cs=tinysrgb&w=400',
            'https://images.pexels.com/photos/8112199/pexels-photo-8112199.jpeg?auto=compress&cs=tinysrgb&w=400',
            25,
            'under_review'
        ) ON CONFLICT (claim_number) DO NOTHING;
    END IF;

    -- إضافة تعليقات تجريبية على المنشورات الموجودة
    SELECT id INTO post_id FROM posts LIMIT 1;
    
    IF post_id IS NOT NULL AND profile1_id IS NOT NULL THEN
        INSERT INTO comments (
            post_id,
            user_id,
            content
        ) VALUES (
            post_id,
            profile1_id,
            'شكراً لكم على هذه المبادرة الرائعة، نحن بحاجة لمثل هذه الخدمات'
        );
    END IF;

    IF post_id IS NOT NULL AND profile2_id IS NOT NULL THEN
        INSERT INTO comments (
            post_id,
            user_id,
            content
        ) VALUES (
            post_id,
            profile2_id,
            'تجربتي مع الجمعية كانت ممتازة، تم حل مشكلتي بسرعة ومهنية عالية'
        );
    END IF;

    IF post_id IS NOT NULL AND profile4_id IS NOT NULL THEN
        INSERT INTO comments (
            post_id,
            user_id,
            content
        ) VALUES (
            post_id,
            profile4_id,
            'أنصح جميع أصحاب السيارات بالانضمام لهذه الجمعية المفيدة'
        );
    END IF;

END $$;