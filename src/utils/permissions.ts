// Import statements for user management
import { supabase } from '../lib/supabase';

// Get user profile from Supabase
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Check if user has specific permission
export const checkUserPermission = async (userId: string, permission: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    // Super admin has all permissions
    if (profile.is_super_admin) return true;

    // Check custom permissions
    if (profile.custom_permissions?.includes(permission) || profile.custom_permissions?.includes('*')) {
      return true;
    }

    // Check role permissions (roles table might not exist yet)
    try {
      const { data: roleData } = await supabase
        .from('roles')
        .select('permissions')
        .eq('id', profile.role)
        .single();

      if (roleData?.permissions?.includes(permission) || roleData?.permissions?.includes('*')) {
        return true;
      }
    } catch (roleError) {
      // Fallback to basic role checking if roles table doesn't exist
      if (profile.role === 'super-admin' || profile.role === 'content-manager') {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};

// Permission checking utilities for role-based access control
export interface UserPermissions {
  canCreateContent: boolean;
  canEditContent: boolean;
  canDeleteContent: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewAnalytics: boolean;
  canManageMedia: boolean;
  canManageForms: boolean;
  canExportData: boolean;
  canManageRoles: boolean;
  canManagePermissions: boolean;
  canCreateUsers: boolean;
  canCreateGroups: boolean;
  canAssignPermissions: boolean;
}

export const getUserPermissions = (user: any): UserPermissions => {
   if (!user) {
     return {
       canCreateContent: false,
       canEditContent: false,
       canDeleteContent: false,
       canPublishContent: false,
       canManageUsers: false,
       canManageSettings: false,
       canViewAnalytics: false,
       canManageMedia: false,
       canManageForms: false,
       canExportData: false,
       canManageRoles: false,
       canManagePermissions: false,
       canCreateUsers: false,
       canCreateGroups: false,
       canAssignPermissions: false
     };
   }

   // Get user profile data for enhanced permissions
   const profile = user.profile || user;

   // Super admin has all permissions
   if (user.email === 'admin@benirage.org' || profile.role === 'super-admin' || profile.is_super_admin) {
    return {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: true,
      canPublishContent: true,
      canManageUsers: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageMedia: true,
      canManageForms: true,
      canExportData: true,
      canManageRoles: true,
      canManagePermissions: true,
      canCreateUsers: true,
      canCreateGroups: true,
      canAssignPermissions: true
    };
  }

  // Check form access permissions from profile
  const formPermissions = profile.form_access_permissions || [];
  const contentPermissions = profile.content_access_permissions || [];
  const adminPermissions = profile.admin_access_permissions || [];
  
  // Helper function to check if user has specific permission
  const hasFormPermission = (permission: string) => 
    formPermissions.includes(permission) || formPermissions.includes('all_forms');
  
  const hasContentPermission = (permission: string) => 
    contentPermissions.includes(permission) || contentPermissions.includes('*');
  
  const hasAdminPermission = (permission: string) => 
    adminPermissions.includes(permission) || adminPermissions.includes('*');
  // Content Initiator permissions
  if (user.email === 'initiator@benirage.org' || profile.role === 'content-initiator') {
    return {
      canCreateContent: hasContentPermission('create'),
      canEditContent: hasContentPermission('edit'),
      canDeleteContent: false,
      canPublishContent: false,
      canManageUsers: hasAdminPermission('users'),
      canManageSettings: false,
      canViewAnalytics: false,
      canManageMedia: hasContentPermission('media') || hasContentPermission('create'),
      canManageForms: hasFormPermission('contact'),
      canExportData: false,
      canManageRoles: false,
      canManagePermissions: false,
      canCreateUsers: false,
      canCreateGroups: false,
      canAssignPermissions: false
    };
  }

  // Content Reviewer permissions
  if (user.email === 'reviewer@benirage.org' || profile.role === 'content-reviewer') {
    return {
      canCreateContent: false,
      canEditContent: hasContentPermission('review'),
      canDeleteContent: false,
      canPublishContent: false,
      canManageUsers: false,
      canManageSettings: false,
      canViewAnalytics: hasAdminPermission('analytics'),
      canManageMedia: false,
      canManageForms: hasFormPermission('contact'),
      canExportData: false,
      canManageRoles: false,
      canManagePermissions: false,
      canCreateUsers: false,
      canCreateGroups: false,
      canAssignPermissions: false
    };
  }

  // Content Publisher permissions
  if (user.email === 'publisher@benirage.org' || profile.role === 'content-publisher') {
    return {
      canCreateContent: false,
      canEditContent: false,
      canDeleteContent: false,
      canPublishContent: hasContentPermission('publish'),
      canManageUsers: false,
      canManageSettings: false,
      canViewAnalytics: hasAdminPermission('analytics'),
      canManageMedia: false,
      canManageForms: hasFormPermission('contact'),
      canExportData: false,
      canManageRoles: false,
      canManagePermissions: false,
      canCreateUsers: false,
      canCreateGroups: false,
      canAssignPermissions: false
    };
  }

  // Membership Manager permissions
  if (user.email === 'membership@benirage.org' || profile.role === 'membership-manager') {
    return {
      canCreateContent: false,
      canEditContent: false,
      canDeleteContent: false,
      canPublishContent: false,
      canManageUsers: hasAdminPermission('users'),
      canManageSettings: false,
      canViewAnalytics: hasAdminPermission('analytics'),
      canManageMedia: false,
      canManageForms: hasFormPermission('membership') || hasFormPermission('volunteer'),
      canExportData: hasAdminPermission('reports'),
      canManageRoles: false,
      canManagePermissions: false,
      canCreateUsers: hasAdminPermission('users'),
      canCreateGroups: false,
      canAssignPermissions: false
    };
  }

  // Content Manager permissions
  if (user.email === 'content@benirage.org' || profile.role === 'content-manager') {
    return {
      canCreateContent: hasContentPermission('create'),
      canEditContent: hasContentPermission('edit'),
      canDeleteContent: hasContentPermission('delete'),
      canPublishContent: hasContentPermission('publish'),
      canManageUsers: false,
      canManageSettings: hasAdminPermission('settings'),
      canViewAnalytics: hasAdminPermission('analytics'),
      canManageMedia: hasContentPermission('media') || hasAdminPermission('media'),
      canManageForms: hasFormPermission('membership') || hasFormPermission('volunteer') || hasFormPermission('partnership') || hasFormPermission('contact'),
      canExportData: hasAdminPermission('reports'),
      canManageRoles: false,
      canManagePermissions: false,
      canCreateUsers: false,
      canCreateGroups: false,
      canAssignPermissions: false
    };
  }

  // Default permissions for other users
  const defaultPermissions = {
    canCreateContent: hasContentPermission('create'),
    canEditContent: hasContentPermission('edit'),
    canDeleteContent: false,
    canPublishContent: false,
    canManageUsers: hasAdminPermission('users'),
    canManageSettings: false,
    canViewAnalytics: hasAdminPermission('analytics'),
    canManageMedia: false,
    canManageForms: hasFormPermission('contact'),
    canExportData: false,
    canManageRoles: false,
    canManagePermissions: false,
    canCreateUsers: false,
    canCreateGroups: false,
    canAssignPermissions: false
  };

  // For development purposes, give permissions to any authenticated user
  // This makes the system more usable during development
  if (user && user.email) {
    // Check if it's an admin email
    if (user.email === 'admin@benirage.org' || user.email.includes('admin')) {
      return {
        canCreateContent: true,
        canEditContent: true,
        canDeleteContent: true,
        canPublishContent: true,
        canManageUsers: true,
        canManageSettings: true,
        canViewAnalytics: true,
        canManageMedia: true,
        canManageForms: true,
        canExportData: true,
        canManageRoles: true,
        canManagePermissions: true,
        canCreateUsers: true,
        canCreateGroups: true,
        canAssignPermissions: true
      };
    }

    // Give full permissions to any authenticated user for development
    return {
      canCreateContent: true,
      canEditContent: true,
      canDeleteContent: false,
      canPublishContent: true,
      canManageUsers: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageMedia: true,
      canManageForms: true,
      canExportData: true,
      canManageRoles: true,
      canManagePermissions: true,
      canCreateUsers: true,
      canCreateGroups: true,
      canAssignPermissions: true
    };
  }

  return defaultPermissions;
};

export const hasPermission = (user: any, permission: keyof UserPermissions): boolean => {
  const permissions = getUserPermissions(user);
  return permissions[permission];
};

export const getUserRole = (user: any): string => {
  if (!user) return 'guest';
  
  // Check email-based roles first
  if (user.email === 'admin@benirage.org') return 'Super Administrator';
  if (user.email === 'membership@benirage.org') return 'Membership Manager';
  if (user.email === 'content@benirage.org') return 'Content Manager';
  if (user.email === 'initiator@benirage.org') return 'Content Initiator';
  if (user.email === 'reviewer@benirage.org') return 'Content Reviewer';
  if (user.email === 'publisher@benirage.org') return 'Content Publisher';
  
  // Check database role if available
  if (user.role) {
    switch (user.role) {
      case 'super-admin': return 'Super Administrator';
      case 'membership-manager': return 'Membership Manager';
      case 'content-manager': return 'Content Manager';
      case 'content-initiator': return 'Content Initiator';
      case 'content-reviewer': return 'Content Reviewer';
      case 'content-publisher': return 'Content Publisher';
      case 'editor': return 'Editor';
      case 'contributor': return 'Contributor';
      case 'viewer': return 'Viewer';
      default: return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  }
  
  return 'Member';
};

export const getAvailablePages = (user: any): string[] => {
  const permissions = getUserPermissions(user);
  const pages: string[] = ['dashboard'];

  if (permissions.canCreateContent || permissions.canEditContent || permissions.canPublishContent) {
    pages.push('content-list');
  }

  if (permissions.canManageForms) {
    pages.push('form-submissions');
  }

  if (permissions.canManageMedia) {
    pages.push('media-library');
  }

  if (permissions.canManageUsers) {
    pages.push('users', 'user-groups');
  }

  if (permissions.canManageRoles) {
    pages.push('roles');
  }

  if (permissions.canManagePermissions) {
    pages.push('permissions');
  }

  if (permissions.canManageSettings) {
    pages.push('settings', 'page-content', 'form-fields', 'categories');
  }

  if (permissions.canViewAnalytics) {
    pages.push('analytics');
  }

  return pages;
};