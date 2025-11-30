import AdManager from '../components/admin/AdManager';

const AdminAds = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C] lg:pt-16">
      {/* Enhanced Header */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D5C] via-[#0D4A6B] to-[#0A3D5C]">
          <div className="absolute inset-0 bg-[url('/benirage.jpeg')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>
        
        {/* Floating Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-24 h-24 bg-blue-400/10 rounded-full blur-xl animate-bounce"></div>
          <div className="absolute bottom-40 left-32 w-40 h-40 bg-yellow-400/5 rounded-full blur-3xl animate-ping"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
              <span className="text-4xl">📢</span>
            </div>
            <h1 className="content-hero-title text-yellow-400 mb-6">
              Advertisement Management
            </h1>
            <p className="text-lg lg:text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto">
              Manage your advertising campaigns, advertisers, and ad placements
            </p>
          </div>
        </div>
      </section>

      {/* Ad Management Interface */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 rounded-2xl p-8">
              <AdManager />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 lg:py-20 bg-[#05294b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 lg:mb-16">
              <h2 className="content-section-header text-yellow-400 mb-6">
                Ad Performance Overview
              </h2>
              <p className="text-lg lg:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
                Monitor your advertising revenue and campaign effectiveness
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8">
              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-blue-400 hover:border-blue-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-5xl mb-4">👀</div>
                <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Total Impressions</div>
                <div className="text-sm text-gray-500 mt-1">This month</div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-green-400 hover:border-green-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-5xl mb-4">👆</div>
                <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">0</div>
                <div className="text-gray-700 font-medium">Total Clicks</div>
                <div className="text-sm text-gray-500 mt-1">This month</div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-5xl mb-4">💰</div>
                <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-2">$0</div>
                <div className="text-gray-700 font-medium">Revenue Generated</div>
                <div className="text-sm text-gray-500 mt-1">This month</div>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-purple-400 hover:border-purple-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="text-4xl lg:text-5xl mb-4">📊</div>
                <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">0%</div>
                <div className="text-gray-700 font-medium">Average CTR</div>
                <div className="text-sm text-gray-500 mt-1">Click-through rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Guide */}
      <section className="py-12 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 lg:mb-12">
              <h2 className="content-section-header text-gray-900 mb-6">
                Getting Started with Ads
              </h2>
              <p className="text-lg lg:text-xl text-gray-700">
                Follow these steps to start monetizing your website
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="content-subsection mb-4">Add Advertisers</h3>
                <p className="text-gray-700 leading-relaxed">
                  Register your advertising partners and set up their accounts with budget allocations.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="content-subsection mb-4">Create Ad Campaigns</h3>
                <p className="text-gray-700 leading-relaxed">
                  Design and configure advertisements with targeting options and creative content.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-gray-50 border-2 border-yellow-400 hover:border-yellow-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 rounded-2xl p-6 lg:p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="content-subsection mb-4">Monitor Performance</h3>
                <p className="text-gray-700 leading-relaxed">
                  Track impressions, clicks, and revenue with detailed analytics and reporting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminAds;