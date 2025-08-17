-- Sync public.users data to auth.users
-- WARNING: This is for development only, NOT for production

-- First, create a function to safely insert users into auth.users
CREATE OR REPLACE FUNCTION sync_users_to_auth()
RETURNS void AS $$
DECLARE
    user_record RECORD;
    auth_user_id UUID;
BEGIN
    -- Loop through all users in public.users that don't exist in auth.users
    FOR user_record IN 
        SELECT u.id, u.email, u.name 
        FROM public.users u 
        LEFT JOIN auth.users au ON u.id = au.id 
        WHERE au.id IS NULL
    LOOP
        -- Insert user into auth.users with minimal required fields
        INSERT INTO auth.users (
            id,
            instance_id,
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
            user_record.id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            user_record.email,
            crypt('temporary_password', gen_salt('bf')), -- Encrypted temporary password
            NOW(),
            null,
            null,
            '{"provider": "email", "providers": ["email"]}',
            jsonb_build_object('name', user_record.name, 'email', user_record.email),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Created auth user for: %', user_record.email;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the sync function
SELECT sync_users_to_auth();

-- Drop the function after use
DROP FUNCTION sync_users_to_auth();

-- Verify the sync
SELECT 
    COUNT(*) as auth_users_count 
FROM auth.users;

SELECT 
    COUNT(*) as public_users_count 
FROM public.users;
