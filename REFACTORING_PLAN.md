# Project Refactoring Plan

## Analysis Summary

### Issues Identified:
1. **70+ SQL files scattered in root directory** - should be in `supabase/migrations/` or organized folders
2. **Multiple duplicate/redundant scripts** for user creation, admin setup, and RLS fixes
3. **JavaScript utility scripts in root** - should be in `scripts/` directory
4. **Markdown documentation files in root** - some should be in `docs/`
5. **Binary files in root** (mailpit, supabase.tar.gz) - should be in appropriate locations or removed
6. **Duplicate seed.sql files** - one in root, one in supabase/

### Root Directory Cleanup Required:

#### SQL Files to Migrate (70+ files):
**User Management SQL:**
- add_missing_user_profile_columns.sql
- add_permission_columns.sql
- assign_users_to_groups.sql
- check_admin_user.sql
- check_and_recreate_table.sql
- check_user_profiles_structure.sql
- comprehensive_user_group_setup.sql
- create_admin_user.sql
- create_auth_users_and_assignments.sql
- create_auth_users_simple.sql
- create_benirage_users_minimal.sql
- create_benirage_users_simple.sql
- create_benirage_users.sql
- create_user_management_group.sql
- create_user_profiles_and_users_fixed.sql
- create_user_profiles_and_users_simple.sql
- create_user_profiles_and_users.sql
- create_user_profiles_table.sql
- create-admin-user-simple.sql
- final_profile_test.sql
- fix_admin_access.sql
- fix_admin_password.sql
- fix_development_policies.sql
- fix_group_permissions_auth.sql
- fix_user_creation_rls.sql
- fix_user_passwords.sql
- fix_user_profile_issue.sql
- fix_user_profiles_error.sql
- fix-admin-permissions.sql
- insert_auth_users.sql
- setup_auth_users_simple.sql
- setup_auth_users.sql
- simple_profile_test.sql
- simple_rls_fix.sql
- test_api_access.sql
- test_profile_creation.sql
- update_admin_password.sql
- update_function.sql

**Publishing/Permissions SQL:**
- fix_publishing_permissions_simple.sql
- fix_publishing_permissions.sql
- fix_rls_permissive.sql
- fix_rls_policies_corrected.sql
- fix_rls_policies.sql
- emergency_rls_reset.sql

**Application Tables SQL:**
- create_donations_table.sql
- create_missing_app_tables.sql
- create_missing_tables.sql
- create_volunteer_applications_table.sql

#### JavaScript/Node Scripts to Migrate (15+ files):
- create-admin-direct.js
- create-admin-user-via-api.js
- create-admin-user.js
- create-test-users.js
- create-user-curl.sh
- create-users-workaround.js
- debug-reload-issue.js
- fix-admin-publishing-permissions.js
- generate-service-key.js
- get-current-users.js
- initialize-super-admin.js
- setup-admin-user.js
- simple-user-creation.js
- simple-user-curl.sh
- test-admin-creation.cjs
- test-auth-login.js
- test-comments.js
- test-db-connection.js
- test-granular-permissions.js
- test-multiple-pages.js
- test-publishing-permissions-fix.js
- test-supabase-connection.js
- test-user-creation.cjs
- update-admin-permissions.js

#### Documentation Files to Organize:
- ADMIN_USER_SETUP.md
- APPLY_USER_FIX_INSTRUCTIONS.md
- AUTH_SETUP_GUIDE.md
- CHAT_FEATURES_ROADMAP.md
- FORCE_LOGOUT_AND_LOGIN.md
- PERMISSIONS_TEST_README.md
- QUICK_FIX_AUTH.md
- SUPER_ADMIN_README.md
- USER_CREATION_README.md
- USER_ROLES_AND_GROUPS_FIX.md

#### Files to Remove/Archive:
- mailpit (binary)
- mailpit-linux-amd64.tar.gz
- supabase.tar.gz
- seed.sql (duplicate - keep in supabase/)

## Proposed New Structure:

```
/
├── docs/                          # All documentation
│   ├── setup/                     # Setup guides
│   │   ├── admin-setup.md
│   │   ├── auth-setup.md
│   │   └── user-creation.md
│   ├── troubleshooting/           # Troubleshooting guides
│   │   ├── permissions-fixes.md
│   │   └── user-fixes.md
│   └── roadmaps/                  # Feature roadmaps
│       └── chat-features.md
├── scripts/                       # Utility scripts
│   ├── admin/                     # Admin management scripts
│   │   ├── create-admin-user.js
│   │   ├── setup-admin-user.js
│   │   └── update-admin-permissions.js
│   ├── users/                     # User management scripts
│   │   ├── create-test-users.js
│   │   └── create-users-workaround.js
│   ├── testing/                   # Test scripts
│   │   ├── test-auth-login.js
│   │   ├── test-db-connection.js
│   │   └── test-granular-permissions.js
│   └── utils/                     # Utility scripts
│       ├── generate-service-key.js
│       └── debug-reload-issue.js
├── supabase/
│   ├── migrations/                # Versioned migrations (keep existing)
│   ├── scripts/                   # SQL utility scripts
│   │   ├── archived/              # Old/redundant scripts
│   │   ├── setup/                 # Initial setup scripts
│   │   ├── fixes/                 # One-time fix scripts
│   │   └── tests/                 # Test SQL scripts
│   └── seed.sql                   # Main seed file
├── src/                           # Application source (no changes)
└── [config files]                 # Keep in root
```

## Migration Strategy:

### Phase 1: Create New Directory Structure
- Create `scripts/` with subdirectories
- Create `supabase/scripts/` with subdirectories
- Create `docs/setup/`, `docs/troubleshooting/`, `docs/roadmaps/`

### Phase 2: Categorize and Move SQL Files
- Move production-ready migrations to `supabase/migrations/` with proper numbering
- Move utility/setup SQL to `supabase/scripts/setup/`
- Move fix scripts to `supabase/scripts/fixes/`
- Move test scripts to `supabase/scripts/tests/`
- Archive redundant scripts to `supabase/scripts/archived/`

### Phase 3: Move JavaScript Scripts
- Move admin scripts to `scripts/admin/`
- Move user scripts to `scripts/users/`
- Move test scripts to `scripts/testing/`
- Move utility scripts to `scripts/utils/`

### Phase 4: Organize Documentation
- Move setup guides to `docs/setup/`
- Move troubleshooting to `docs/troubleshooting/`
- Move roadmaps to `docs/roadmaps/`
- Consolidate duplicate documentation

### Phase 5: Update References
- Update package.json scripts
- Update documentation links
- Update any hardcoded paths in code

### Phase 6: Create Migration Scripts
- Create consolidated migration script for test environment
- Create consolidated migration script for production environment
- Document migration process

### Phase 7: Testing & Verification
- Test all npm scripts still work
- Verify database migrations run correctly
- Test application features
- Update CI/CD if applicable

## Files to Delete (Redundant/Obsolete):
- Multiple duplicate user creation scripts (keep only the working one)
- Multiple duplicate RLS fix scripts (consolidate into one)
- Binary files (mailpit, tar.gz files)
- Duplicate seed.sql in root

## Benefits:
1. **Clean root directory** - only config files and essential docs
2. **Organized scripts** - easy to find and maintain
3. **Clear migration path** - proper versioning and organization
4. **Better documentation** - categorized and easy to navigate
5. **Reduced confusion** - no duplicate or redundant files
6. **Easier onboarding** - clear structure for new developers
7. **Production ready** - proper separation of dev/test/prod scripts