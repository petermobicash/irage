import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileAppShell from './components/layout/MobileAppShell';
import SplashScreen from './components/pwa/SplashScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';
import Toast from './components/ui/Toast';
import TopBanner from './components/announcements/TopBanner';
import LeftSidebar from './components/announcements/LeftSidebar';
import RightSidebar from './components/announcements/RightSidebar';
import { useAnnouncements } from './hooks/useAnnouncements';
import { useToast } from './hooks/useToast';
import { X } from 'lucide-react';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Spiritual = lazy(() => import('./pages/Spiritual'));
const Philosophy = lazy(() => import('./pages/Philosophy'));
const Culture = lazy(() => import('./pages/Culture'));
const Programs = lazy(() => import('./pages/Programs'));
const GetInvolved = lazy(() => import('./pages/GetInvolved'));
const Membership = lazy(() => import('./pages/Membership'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Donate = lazy(() => import('./pages/Donate'));
const Partnership = lazy(() => import('./pages/Partnership'));
const Resources = lazy(() => import('./pages/Resources'));
const News = lazy(() => import('./pages/News'));
const Contact = lazy(() => import('./pages/Contact'));
const Admin = lazy(() => import('./pages/Admin'));
const CMS = lazy(() => import('./pages/CMS'));
const SystemTest = lazy(() => import('./pages/SystemTest'));
const ContentGuide = lazy(() => import('./pages/ContentGuide'));
const DeploymentGuide = lazy(() => import('./pages/DeploymentGuide'));
const ChatDemo = lazy(() => import('./pages/ChatDemo'));
const WhatsAppChatDemo = lazy(() => import('./pages/WhatsAppChatDemo'));
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'));
const PublicChat = lazy(() => import('./pages/PublicChat'));
const Stories = lazy(() => import('./pages/Stories'));
const AdminAds = lazy(() => import('./pages/AdminAds'));
const AdDemo = lazy(() => import('./pages/AdDemo'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Privacy = lazy(() => import('./pages/Privacy'));

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Hide splash screen after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Memoize device type for announcements
  const deviceType = useMemo((): 'desktop' | 'mobile' | 'tablet' => {
    if (isMobile) return 'mobile';
    if (window.innerWidth >= 1024) return 'desktop';
    return 'tablet';
  }, [isMobile]);

  // Update current path when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Announcements hook
  const {
    topAnnouncements,
    leftAnnouncements,
    dismissAnnouncement
  } = useAnnouncements({
    currentPath,
    deviceType,
    userType: 'visitor'
  });

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderPublicRoutes = () => (
    <Routes>
      <Route index element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Home /></Suspense>} />
      <Route path="about" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><About /></Suspense>} />
      <Route path="spiritual" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Spiritual /></Suspense>} />
      <Route path="philosophy" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Philosophy /></Suspense>} />
      <Route path="culture" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Culture /></Suspense>} />
      <Route path="programs" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Programs /></Suspense>} />
      <Route path="get-involved" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><GetInvolved /></Suspense>} />
      <Route path="membership" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Membership /></Suspense>} />
      <Route path="volunteer" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Volunteer /></Suspense>} />
      <Route path="donate" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Donate /></Suspense>} />
      <Route path="partnership" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Partnership /></Suspense>} />
      <Route path="resources" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Resources /></Suspense>} />
      <Route path="news" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><News /></Suspense>} />
      <Route path="contact" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Contact /></Suspense>} />
      <Route path="admin" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Admin /></Suspense>} />
      <Route path="admin/login" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Admin /></Suspense>} />
      <Route path="system-test" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><SystemTest /></Suspense>} />
      <Route path="content-guide" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><ContentGuide /></Suspense>} />
      <Route path="deployment-guide" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><DeploymentGuide /></Suspense>} />
      <Route path="chat-demo" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><ChatDemo /></Suspense>} />
      <Route path="whatsapp-chat-demo" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><WhatsAppChatDemo /></Suspense>} />
      <Route path="chat" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><PublicChat /></Suspense>} />
      <Route path="advanced-features" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><AdvancedFeatures /></Suspense>} />
      <Route path="stories" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Stories /></Suspense>} />
      <Route path="admin-ads" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><AdminAds /></Suspense>} />
      <Route path="ad-demo" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><AdDemo /></Suspense>} />
      <Route path="user-management" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><UserManagement /></Suspense>} />
      <Route path="privacy" element={<Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}><Privacy /></Suspense>} />
    </Routes>
  );

  return (
    <ErrorBoundary>
      {showSplash && <SplashScreen />}
      {/* Toast notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
      <Router>
        <div className={`${isMobile ? 'mobile-app' : 'min-h-screen bg-gray-50'}`}>
          <Routes>
            {/* CMS routes without header and footer */}
            <Route path="/cms/*" element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="ml-2 text-gray-600">Loading...</span></div>}>
                <CMS />
              </Suspense>
            } />
            {/* Public routes - mobile vs desktop */}
            <Route path="/*" element={
              deviceType === 'mobile' ? (
                <MobileAppShell
                  topAnnouncements={topAnnouncements}
                  onDismissAnnouncement={dismissAnnouncement}
                >
                  {renderPublicRoutes()}
                </MobileAppShell>
              ) : deviceType === 'tablet' ? (
                <>
                  <Header />
                  {/* Top banner for tablet */}
                  <TopBanner
                    announcements={topAnnouncements}
                    onDismiss={dismissAnnouncement}
                    deviceType="tablet"
                  />
                  <div className="flex flex-col min-h-screen">
                    {/* Top Banner Ad - Responsive for tablet */}
                    <div className="w-full bg-gray-50 border-b border-gray-200">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-3 flex justify-center">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg text-center min-h-[50px] flex items-center">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xs">📢</span>
                              </div>
                              <div>
                                <div className="font-semibold text-xs">Premium Advertisement</div>
                                <div className="text-xs opacity-90">728×90 Leaderboard Banner</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1">
                      {/* Main Content Area - flex-1 for tablet */}
                      <main className="flex-1 bg-white relative min-h-screen">
                        <div className="h-full">
                          <div className="max-w-full lg:max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                            {/* Main Content - Responsive reading width */}
                            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                              {renderPublicRoutes()}
                            </div>
                          </div>
                        </div>
                      </main>

                      {/* Right Sidebar - Collapsible for tablet */}
                      <div className="w-[200px] bg-white border-l border-gray-200 shadow-sm flex-shrink-0 relative group">
                        <div className="h-full flex flex-col">
                          {/* Collapsible Quick Access Section */}
                          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'w-[60px]' : 'w-[200px]'}`}>
                            <RightSidebar />
                          </div>

                          {/* Essential Right Sidebar Ad - Industry standard placement */}
                          <div className={`p-3 border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${sidebarCollapsed ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="bg-white rounded-lg border border-gray-200 p-3 text-center min-h-[200px] flex items-center justify-center">
                              <div>
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-orange-600">🔥</span>
                                </div>
                                <div className="font-semibold text-gray-800 text-sm mb-1">Advertisement</div>
                                <div className="text-sm text-gray-600 mb-1">Premium Placement</div>
                                <div className="text-xs text-gray-500">300×250 Medium Rectangle</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expand/Collapse Button for tablet */}
                        <button
                          onClick={handleSidebarToggle}
                          className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-300 rounded-l-lg shadow-md flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                          aria-label="Toggle right sidebar"
                        >
                          {sidebarCollapsed ? '→' : '←'}
                        </button>
                      </div>
                    </div>
                  </div>
                  <Footer />
                </>
              ) : (
                <>
                  <Header />
                  {/* Top banner for desktop */}
                  <TopBanner
                    announcements={topAnnouncements}
                    onDismiss={dismissAnnouncement}
                    deviceType="desktop"
                  />
                  <div className="flex flex-col min-h-screen">
                    {/* Top Banner Ad - Essential placement */}
                    <div className="w-full bg-gray-50 border-b border-gray-200">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-3 flex justify-center">
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg shadow-lg text-center min-h-[60px] flex items-center">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-sm">📢</span>
                              </div>
                              <div>
                                <div className="font-semibold text-sm">Premium Advertisement</div>
                                <div className="text-xs opacity-90">728×90 Leaderboard Banner</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-1">
                      {/* Left Sidebar - Responsive width, announcements only */}
                      <div className="hidden xl:block w-[240px] bg-white border-r border-gray-200 shadow-sm flex-shrink-0">
                        <div className="h-full">
                          <LeftSidebar
                            announcements={leftAnnouncements}
                            onDismiss={dismissAnnouncement}
                            isCollapsed={sidebarCollapsed}
                            onToggleCollapse={handleSidebarToggle}
                          />
                        </div>
                      </div>

                      {/* Main Content Area - flex-1 to fill remaining space */}
                      <main className="flex-1 bg-white relative min-h-screen">
                        <div className="h-full">
                          <div className="max-w-full xl:max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                            {/* Main Content - Responsive reading width */}
                            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                              {renderPublicRoutes()}
                            </div>
                          </div>
                        </div>
                      </main>

                      {/* Right Sidebar - Collapsible/Overlay for medium screens, fixed for large */}
                      <div className="hidden lg:block xl:w-[240px] lg:w-[200px] bg-white border-l border-gray-200 shadow-sm flex-shrink-0 relative group">
                        <div className="h-full flex flex-col">
                          {/* Collapsible Quick Access Section */}
                          <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[200px]'}`}>
                            <RightSidebar />
                          </div>

                          {/* Essential Right Sidebar Ad - Industry standard placement */}
                          <div className={`p-4 border-t border-gray-100 bg-gray-50/50 transition-all duration-300 ${sidebarCollapsed ? 'lg:opacity-50 lg:pointer-events-none' : ''}`}>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center min-h-[250px] flex items-center justify-center">
                              <div>
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <span className="text-orange-600">🔥</span>
                                </div>
                                <div className="font-semibold text-gray-800 mb-1">Advertisement</div>
                                <div className="text-sm text-gray-600 mb-2">Premium Placement</div>
                                <div className="text-xs text-gray-500">300×250 Medium Rectangle</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expand/Collapse Button for medium screens */}
                        <button
                          onClick={handleSidebarToggle}
                          className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-12 bg-white border border-gray-300 rounded-l-lg shadow-md flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors lg:flex xl:hidden"
                          aria-label="Toggle right sidebar"
                        >
                          {sidebarCollapsed ? '→' : '←'}
                        </button>
                      </div>

                      {/* Right Sidebar - Mobile overlay version */}
                      <div className={`fixed inset-y-0 right-0 z-40 w-64 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${sidebarCollapsed ? 'translate-x-full' : 'translate-x-0'}`}>
                        <div className="h-full flex flex-col">
                          {/* Mobile Close Button */}
                          <div className="flex justify-end p-4 border-b border-gray-200">
                            <button
                              onClick={handleSidebarToggle}
                              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                              aria-label="Close sidebar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Mobile Sidebar Content */}
                          <div className="flex-1 overflow-y-auto">
                            <RightSidebar />
                          </div>

                          {/* Mobile Sidebar Ad */}
                          <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center min-h-[200px] flex items-center justify-center">
                              <div>
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <span className="text-orange-600 text-sm">🔥</span>
                                </div>
                                <div className="font-semibold text-gray-800 text-sm mb-1">Advertisement</div>
                                <div className="text-xs text-gray-600">Mobile Sidebar</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Overlay Backdrop */}
                      {!sidebarCollapsed && (
                        <div
                          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                          onClick={handleSidebarToggle}
                        ></div>
                      )}
                    </div>
                  </div>
                  <Footer />
                </>
              )
            } />

          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

