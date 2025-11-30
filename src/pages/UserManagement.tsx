import UserManagementDashboard from '../components/admin/UserManagementDashboard';

const UserManagement = () => {
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
                <h1 className="content-section-header text-yellow-400">User Management</h1>
                <p className="text-yellow-400/80 text-sm font-semibold">Permissions, Groups & Access Control</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/admin'}
                className="group bg-white/10 backdrop-blur-md text-yellow-400 border border-white/20 font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
              >
                <span>← Back to Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-2xl p-6">
          <UserManagementDashboard />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;