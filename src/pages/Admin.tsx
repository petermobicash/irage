import React, { useState, useEffect } from 'react';
import { supabase, signInWithEmail, signOut, getCurrentUser } from '../lib/supabase';
import SuperAdminDashboard from '../components/admin/SuperAdminDashboard';
import { getCurrentUserProfile } from '../utils/rbac';

const Admin = () => {
  
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  const [dashboardData, setDashboardData] = useState<{
    memberships: any[];
    volunteers: any[];
    contacts: any[];
    donations: any[];
  } | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user is super admin
        const profile = await getCurrentUserProfile();
        setCurrentProfile(profile);
        setIsSuperAdmin(profile?.isSuperAdmin || false);
        
        // If not super admin, redirect to CMS
        if (!profile?.isSuperAdmin) {
          window.location.href = '/cms';
          return;
        }
        // If super admin, show super admin dashboard
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load membership applications
      const { data: memberships } = await supabase
        .from('membership_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load volunteer applications
      const { data: volunteers } = await supabase
        .from('volunteer_applications')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load contact submissions
      const { data: contacts } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('submission_date', { ascending: false });

      // Load donations
      const { data: donations } = await supabase
        .from('donations')
        .select('*')
        .order('donation_date', { ascending: false });

      setDashboardData({
        memberships: memberships || [],
        volunteers: volunteers || [],
        contacts: contacts || [],
        donations: donations || []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const result = await signInWithEmail(loginData.email, loginData.password);
      if (result.success) {
        // Redirect to CMS page instead of showing dashboard
        window.location.href = '/cms';
      } else {
        alert(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setDashboardData(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] flex items-center justify-center px-4 lg:pt-16">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="relative">
                <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-16 h-16 mx-auto mb-4 drop-shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              </div>
              <h1 className="content-section-header text-gray-900 mb-2">Admin Login</h1>
              <p className="text-gray-600">Access the BENIRAGE content management system</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={loginData.email}
                  onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A3D5C] focus:border-transparent transition-all duration-300"
                  placeholder="admin@benirage.org"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A3D5C] focus:border-transparent transition-all duration-300"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#0A3D5C] text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If user is super admin, show the comprehensive super admin dashboard
  if (isSuperAdmin && currentProfile) {
    return <SuperAdminDashboard />;
  }

  // For regular admin users, show the standard admin dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] lg:pt-16">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-[#0A3D5C] to-[#05294b] border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img src="/LOGO_CLEAR_stars.png" alt="BENIRAGE" className="w-12 h-12 drop-shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              </div>
              <div>
                <h1 className="content-section-header text-yellow-400">BENIRAGE Admin</h1>
                <p className="text-yellow-400/80 text-sm font-semibold">Content Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-yellow-400/90 text-sm font-medium">Welcome, {user.email}</span>
              <button 
                onClick={handleLogout}
                className="bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="content-section-header text-yellow-400 mb-2">Dashboard Overview</h2>
            <p className="text-white/90">Manage your BENIRAGE website content and applications</p>
          </div>
          <button 
            onClick={loadDashboardData}
            className="bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Statistics Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-blue-400 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 text-center cursor-pointer" onClick={() => window.location.href = '/admin?section=memberships'}>
              <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.memberships.length}</div>
              <p className="text-gray-700 font-medium">Membership Applications</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-green-400 hover:border-green-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 text-center cursor-pointer" onClick={() => window.location.href = '/admin?section=volunteers'}>
              <div className="text-3xl font-bold text-green-600 mb-2">{dashboardData.volunteers.length}</div>
              <p className="text-gray-700 font-medium">Volunteer Applications</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-purple-400 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 text-center cursor-pointer" onClick={() => window.location.href = '/admin?section=contacts'}>
              <div className="text-3xl font-bold text-purple-600 mb-2">{dashboardData.contacts.length}</div>
              <p className="text-gray-700 font-medium">Contact Submissions</p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 text-center cursor-pointer" onClick={() => window.location.href = '/admin?section=donations'}>
              <div className="text-3xl font-bold text-yellow-600 mb-2">{dashboardData.donations.length}</div>
              <p className="text-gray-700 font-medium">Donations</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">📝 Content Management</h3>
            <p className="text-gray-700 mb-4">Create and manage website content</p>
            <button 
              onClick={() => window.location.href = '/cms'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              Manage Content
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">👥 Membership Applications</h3>
            <p className="text-gray-700 mb-4">Review and process membership applications</p>
            <button 
              onClick={() => window.location.href = '/admin?section=memberships'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              View Applications
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">🤝 Volunteer Management</h3>
            <p className="text-gray-700 mb-4">Manage volunteer applications and assignments</p>
            <button 
              onClick={() => window.location.href = '/admin?section=volunteers'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              Manage Volunteers
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">📧 Contact Messages</h3>
            <p className="text-gray-700 mb-4">Respond to contact form submissions</p>
            <button 
              onClick={() => window.location.href = '/admin?section=contacts'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              View Messages
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">💰 Donations</h3>
            <p className="text-gray-700 mb-4">Track and manage donations</p>
            <button 
              onClick={() => window.location.href = '/admin?section=donations'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              View Donations
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">⚙️ Settings</h3>
            <p className="text-gray-700 mb-4">Configure website settings</p>
            <button 
              onClick={() => window.location.href = '/admin?section=settings'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              Manage Settings
            </button>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6">
            <h3 className="content-subsection mb-4">👥 User Management</h3>
            <p className="text-gray-700 mb-4">Manage permissions, groups, and user access control</p>
            <button 
              onClick={() => window.location.href = '/admin?section=user-management'}
              className="bg-[#0A3D5C] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#05294b] transition-all duration-300 transform hover:scale-105"
            >
              Manage Users & Permissions
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboardData && (
          <div className="mt-12">
            <h3 className="content-section-header text-yellow-400 mb-6">Recent Activity</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-2xl p-6">
                <h4 className="content-subsection mb-4">Latest Membership Applications</h4>
                <div className="space-y-3">
                  {dashboardData.memberships.slice(0, 5).map((member: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{member.first_name} {member.last_name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                        {member.status}
                      </span>
                    </div>
                  ))}
                  {dashboardData.memberships.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No membership applications yet</p>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-2xl p-6">
                <h4 className="content-subsection mb-4">Latest Contact Messages</h4>
                <div className="space-y-3">
                  {dashboardData.contacts.slice(0, 5).map((contact: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-gray-900">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-gray-600">{contact.subject}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {contact.status}
                      </span>
                    </div>
                  ))}
                  {dashboardData.contacts.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No contact messages yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;