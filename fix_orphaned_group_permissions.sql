-- Fix Orphaned Group Permissions
-- This script identifies and cleans up orphaned records in group_permissions table
-- where permission_id references non-existent permissions

BEGIN;

-- Create a temporary table to store diagnostic information
CREATE TEMP TABLE permission_diagnostics AS
SELECT 
    'Total group_permissions records' as check_type,
    COUNT(*) as record_count
FROM group_permissions

UNION ALL

SELECT 
    'Group permissions with valid permission_id' as check_type,
    COUNT(*) as record_count
FROM group_permissions gp
INNER JOIN permissions p ON gp.permission_id = p.id

UNION ALL

SELECT 
    'Orphaned group_permissions (permission_id not in permissions table)' as check_type,
    COUNT(*) as record_count
FROM group_permissions gp
LEFT JOIN permissions p ON gp.permission_id = p.id
WHERE p.id IS NULL;

-- Display diagnostic information
SELECT * FROM permission_diagnostics;

-- Identify specific orphaned records for review
SELECT 
    gp.id,
    gp.group_id,
    gp.permission_id,
    gp.created_at,
    g.name as group_name
FROM group_permissions gp
LEFT JOIN permissions p ON gp.permission_id = p.id
LEFT JOIN groups g ON gp.group_id = g.id
WHERE p.id IS NULL
ORDER BY gp.created_at DESC
LIMIT 20;

-- Count orphaned permissions by group
SELECT 
    g.name as group_name,
    g.id as group_id,
    COUNT(*) as orphaned_permission_count
FROM group_permissions gp
LEFT JOIN permissions p ON gp.permission_id = p.id
LEFT JOIN groups g ON gp.group_id = g.id
WHERE p.id IS NULL
GROUP BY g.name, g.id
ORDER BY orphaned_permission_count DESC;

-- Clean up orphaned records (optional - uncomment to actually delete)
-- DELETE FROM group_permissions 
-- WHERE permission_id NOT IN (SELECT id FROM permissions);

-- RAISE NOTICE 'Cleaned up orphaned group_permissions records';

-- Verify the cleanup
SELECT 
    'After cleanup - Total group_permissions records' as check_type,
    COUNT(*) as record_count
FROM group_permissions

UNION ALL

SELECT 
    'After cleanup - Group permissions with valid permission_id' as check_type,
    COUNT(*) as record_count
FROM group_permissions gp
INNER JOIN permissions p ON gp.permission_id = p.id;

-- Clean up temporary table
DROP TABLE permission_diagnostics;

COMMIT;