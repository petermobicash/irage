-- FIX: Add missing user_id column to group_users table
-- This addresses the "column user_id does not exist" error

BEGIN;

-- First, check if group_users table exists
\echo 'Checking if group_users table exists...'

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_users') THEN
        RAISE NOTICE 'Creating group_users table...';
        
        -- Create the group_users table with all required columns
        CREATE TABLE public.group_users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            assigned_by TEXT,
            assigned_at TIMESTAMPTZ DEFAULT NOW(),
            is_active BOOLEAN DEFAULT TRUE,
            UNIQUE(group_id, user_id)
        );
        
        -- Enable RLS
        ALTER TABLE public.group_users ENABLE ROW LEVEL SECURITY;
        
        -- Create basic policies
        CREATE POLICY "Users can view their own group memberships" ON public.group_users
            FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Authenticated users can manage group memberships" ON public.group_users
            FOR ALL USING (auth.uid() IS NOT NULL);
        
        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_group_users_group_id ON public.group_users(group_id);
        CREATE INDEX IF NOT EXISTS idx_group_users_user_id ON public.group_users(user_id);
        CREATE INDEX IF NOT EXISTS idx_group_users_is_active ON public.group_users(is_active);
        
        RAISE NOTICE '✅ Created group_users table with user_id column';
    ELSE
        RAISE NOTICE 'group_users table exists, checking columns...';
        
        -- Check if user_id column exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'group_users' 
            AND column_name = 'user_id'
        ) THEN
            \echo 'Adding user_id column to existing group_users table...';
            
            -- Add the missing user_id column
            ALTER TABLE public.group_users 
            ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
            
            -- Add unique constraint
            ALTER TABLE public.group_users 
            ADD CONSTRAINT group_users_group_id_user_id_key 
            UNIQUE(group_id, user_id);
            
            -- Create index
            CREATE INDEX IF NOT EXISTS idx_group_users_user_id ON public.group_users(user_id);
            
            RAISE NOTICE '✅ Added user_id column to existing group_users table';
        ELSE
            RAISE NOTICE '✅ group_users table already has user_id column';
        END IF;
    END IF;
END $$;

-- Now recreate the problematic policy
\echo 'Creating group_messages policy...'

DROP POLICY IF EXISTS "Users can view group messages they have access to" ON public.group_messages;
CREATE POLICY "Users can view group messages they have access to" ON public.group_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.group_users
            WHERE group_users.group_id::text = group_messages.group_id
            AND group_users.user_id = auth.uid()
        )
    );

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ GROUP_USERS USER_ID FIX COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed the "column user_id does not exist" error!';
    RAISE NOTICE '';
    RAISE NOTICE 'Actions performed:';
    RAISE NOTICE '  ✓ Ensured group_users table exists with user_id column';
    RAISE NOTICE '  ✓ Added user_id column if missing';
    RAISE NOTICE '  ✓ Created necessary indexes';
    RAISE NOTICE '  ✓ Applied RLS policies';
    RAISE NOTICE '  ✓ Recreated group_messages policy';
    RAISE NOTICE '';
    RAISE NOTICE 'The original query should now work correctly.';
    RAISE NOTICE '========================================';
END $$;

END;