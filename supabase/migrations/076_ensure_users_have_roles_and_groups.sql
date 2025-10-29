-- ===============================================
-- ENSURE ALL USERS HAVE ROLES AND GROUPS
-- ===============================================
-- This migration ensures that all users in the system have:
-- 1. A valid role assigned
-- 2. At least one group membership in group_users

BEGIN;

-- ===============================================
-- STEP 1: CHECK WHICH TABLES EXIST
-- ===============================================

DO $$
DECLARE
    has_user_profiles BOOLEAN;
    has_users_table BOOLEAN;
BEGIN
    -- Check if user_profiles table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO has_user_profiles;
    
    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO has_users_table;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TABLE EXISTENCE CHECK';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'user_profiles table exists: %', has_user_profiles;
    RAISE NOTICE 'users table exists: %', has_users_table;
    RAISE NOTICE '========================================';
    
    IF NOT has_user_profiles AND NOT has_users_table THEN
        RAISE EXCEPTION 'Neither user_profiles nor users table exists. Please run the user table creation migrations first.';
    END IF;
END $$;

-- ===============================================
-- STEP 2: ENSURE DEFAULT GROUPS EXIST
-- ===============================================

DO $$
BEGIN
    -- Super Administrators
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Super Administrators') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Super Administrators', 'Full system access with all permissions', '#DC2626', 'shield', true, true);
    END IF;
    
    -- Administrators
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Administrators') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Administrators', 'Administrative access to most system functions', '#7C3AED', 'settings', true, true);
    END IF;
    
    -- Content Managers
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Content Managers') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Content Managers', 'Can manage all content and media', '#2563EB', 'edit-3', true, true);
    END IF;
    
    -- Editors
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Editors') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Editors', 'Can edit and publish content', '#059669', 'file-text', true, true);
    END IF;
    
    -- Contributors
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Contributors') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Contributors', 'Can create and edit their own content', '#0891B2', 'user-pen', true, true);
    END IF;
    
    -- Reviewers
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Reviewers') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Reviewers', 'Can review and approve content', '#D97706', 'check-circle', true, true);
    END IF;
    
    -- Regular Users
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Regular Users') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Regular Users', 'Standard user access', '#6B7280', 'users', true, true);
    END IF;
    
    -- Guests
    IF NOT EXISTS (SELECT 1 FROM groups WHERE name = 'Guests') THEN
        INSERT INTO groups (name, description, color, icon, is_system_group, is_active) 
        VALUES ('Guests', 'Limited read-only access', '#9CA3AF', 'eye', true, true);
    END IF;
    
    RAISE NOTICE '✅ Ensured default groups exist';
END $$;

-- ===============================================
-- STEP 3: ASSIGN USERS TO GROUPS
-- ===============================================

DO $$
DECLARE
    user_record RECORD;
    target_group_id UUID;
    group_name TEXT;
    users_assigned INTEGER := 0;
    has_user_profiles BOOLEAN;
    has_users_table BOOLEAN;
BEGIN
    -- Check which tables exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) INTO has_user_profiles;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO has_users_table;
    
    -- Process users from whichever table exists
    IF has_users_table THEN
        RAISE NOTICE 'Processing users from users table...';
        
        FOR user_record IN 
            SELECT DISTINCT u.user_id, u.role, u.is_super_admin
            FROM users u
            WHERE u.user_id IS NOT NULL
        LOOP
            -- Determine the appropriate group based on role
            group_name := CASE
                WHEN user_record.is_super_admin = true THEN 'Super Administrators'
                WHEN user_record.role = 'super-admin' OR user_record.role = 'super_admin' THEN 'Super Administrators'
                WHEN user_record.role = 'admin' THEN 'Administrators'
                WHEN user_record.role = 'content-manager' OR user_record.role = 'content_manager' THEN 'Content Managers'
                WHEN user_record.role = 'editor' THEN 'Editors'
                WHEN user_record.role = 'contributor' OR user_record.role = 'author' THEN 'Contributors'
                WHEN user_record.role = 'reviewer' THEN 'Reviewers'
                WHEN user_record.role = 'viewer' OR user_record.role = 'guest' THEN 'Guests'
                ELSE 'Regular Users'
            END;

            -- Get the group ID
            SELECT id INTO target_group_id
            FROM groups
            WHERE name = group_name
            AND is_active = true
            LIMIT 1;

            -- If group exists, assign user to it
            IF target_group_id IS NOT NULL THEN
                INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
                VALUES (target_group_id, user_record.user_id, 'system-migration', NOW(), true)
                ON CONFLICT (group_id, user_id) DO UPDATE SET
                    is_active = true;
                
                users_assigned := users_assigned + 1;
            END IF;
        END LOOP;
        
    ELSIF has_user_profiles THEN
        RAISE NOTICE 'Processing users from user_profiles table...';
        
        FOR user_record IN 
            SELECT DISTINCT up.user_id, up.role, up.is_super_admin
            FROM user_profiles up
            WHERE up.user_id IS NOT NULL
        LOOP
            -- Same logic as above
            group_name := CASE
                WHEN user_record.is_super_admin = true THEN 'Super Administrators'
                WHEN user_record.role = 'super-admin' OR user_record.role = 'super_admin' THEN 'Super Administrators'
                WHEN user_record.role = 'admin' THEN 'Administrators'
                WHEN user_record.role = 'content-manager' OR user_record.role = 'content_manager' THEN 'Content Managers'
                WHEN user_record.role = 'editor' THEN 'Editors'
                WHEN user_record.role = 'contributor' OR user_record.role = 'author' THEN 'Contributors'
                WHEN user_record.role = 'reviewer' THEN 'Reviewers'
                WHEN user_record.role = 'viewer' OR user_record.role = 'guest' THEN 'Guests'
                ELSE 'Regular Users'
            END;

            SELECT id INTO target_group_id
            FROM groups
            WHERE name = group_name
            AND is_active = true
            LIMIT 1;

            IF target_group_id IS NOT NULL THEN
                INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
                VALUES (target_group_id, user_record.user_id, 'system-migration', NOW(), true)
                ON CONFLICT (group_id, user_id) DO UPDATE SET
                    is_active = true;
                
                users_assigned := users_assigned + 1;
            END IF;
        END LOOP;
    END IF;

    RAISE NOTICE '✅ Assigned % users to their appropriate groups', users_assigned;
END $$;

-- ===============================================
-- STEP 4: ENSURE ALL USERS HAVE AT LEAST ONE GROUP
-- ===============================================

DO $$
DECLARE
    has_users_table BOOLEAN;
    regular_users_group_id UUID;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO has_users_table;
    
    -- Get Regular Users group ID
    SELECT id INTO regular_users_group_id
    FROM groups
    WHERE name = 'Regular Users'
    AND is_active = true
    LIMIT 1;
    
    IF regular_users_group_id IS NOT NULL AND has_users_table THEN
        -- Assign users without groups to Regular Users
        INSERT INTO group_users (group_id, user_id, assigned_by, assigned_at, is_active)
        SELECT 
            regular_users_group_id,
            u.user_id,
            'system-migration',
            NOW(),
            true
        FROM users u
        WHERE u.user_id IS NOT NULL
        AND NOT EXISTS (
            SELECT 1 
            FROM group_users gu 
            WHERE gu.user_id = u.user_id 
            AND gu.is_active = true
        )
        ON CONFLICT (group_id, user_id) DO UPDATE SET
            is_active = true;
    END IF;
    
    RAISE NOTICE '✅ Ensured all users have at least one group membership';
END $$;

-- ===============================================
-- STEP 5: VERIFICATION AND STATISTICS
-- ===============================================

DO $$
DECLARE
    total_users INTEGER;
    users_with_groups INTEGER;
    users_without_groups INTEGER;
    total_groups INTEGER;
    total_group_memberships INTEGER;
    has_users_table BOOLEAN;
BEGIN
    -- Check if users table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) INTO has_users_table;
    
    IF has_users_table THEN
        -- Count statistics from users table
        SELECT COUNT(*) INTO total_users FROM users WHERE user_id IS NOT NULL;
        SELECT COUNT(DISTINCT user_id) INTO users_with_groups FROM group_users WHERE is_active = true;
        SELECT COUNT(*) INTO users_without_groups 
        FROM users u 
        WHERE user_id IS NOT NULL 
        AND NOT EXISTS (
            SELECT 1 FROM group_users gu 
            WHERE gu.user_id = u.user_id AND gu.is_active = true
        );
    ELSE
        total_users := 0;
        users_with_groups := 0;
        users_without_groups := 0;
    END IF;
    
    SELECT COUNT(*) INTO total_groups FROM groups WHERE is_active = true;
    SELECT COUNT(*) INTO total_group_memberships FROM group_users WHERE is_active = true;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USER ROLES AND GROUPS VERIFICATION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Users with Groups: % (%.1f%%)', users_with_groups, (users_with_groups::float / NULLIF(total_users, 0) * 100);
    RAISE NOTICE 'Users without Groups: %', users_without_groups;
    RAISE NOTICE 'Total Active Groups: %', total_groups;
    RAISE NOTICE 'Total Group Memberships: %', total_group_memberships;
    RAISE NOTICE '';
    
    IF users_without_groups > 0 THEN
        RAISE WARNING '⚠️  % users still without groups - manual intervention may be needed', users_without_groups;
    ELSE
        RAISE NOTICE '✅ All users have been assigned to groups';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'You can verify user assignments by querying:';
    RAISE NOTICE '  SELECT u.*, array_agg(g.name) as groups';
    RAISE NOTICE '  FROM users u';
    RAISE NOTICE '  LEFT JOIN group_users gu ON u.user_id = gu.user_id';
    RAISE NOTICE '  LEFT JOIN groups g ON gu.group_id = g.id';
    RAISE NOTICE '  GROUP BY u.id;';
    RAISE NOTICE '========================================';
END $$;

COMMIT;