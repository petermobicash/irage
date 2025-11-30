-- Test script to validate RLS performance fixes
-- This script checks if the policies have been properly optimized

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('chat_messages', 'direct_messages', 'group_messages', 'message_read_receipts', 'content', 'content_comments')
AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
ORDER BY tablename, policyname;

-- Expected result: This should return 0 rows after the fix
-- If it returns rows, those policies still need to be optimized
