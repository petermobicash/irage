import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, FileText, Calendar, Users, Settings, Plus, Edit2, Trash2,
  Save, X, Menu, ChevronRight, Clock, MapPin, Mail,
  Globe, Facebook, Twitter, Instagram, Youtube, Search, Bell, LogOut,
  Activity, ArrowUpRight, ArrowDownRight,
  CheckCircle, User, Link
} from 'lucide-react';

// Types
interface BlogPost {
  id: string;
  title: string;
  category: string;
  content: string;
  image: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  email: string;
  phone: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
  };
  createdAt: string;
}

interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
}

interface RecentActivity {
  id: string;
  action: string;
  item: string;
  type: 'post' | 'event' | 'team' | 'settings';
  timestamp: string;
}

// Storage keys
const STORAGE_KEYS = {
  POSTS: 'benirage_cms_posts',
  EVENTS: 'benirage_cms_events',
  TEAM: 'benirage_cms_team',
  SETTINGS: 'benirage_cms_settings',
  ACTIVITY: 'benirage_cms_activity'
};

// Default data
const defaultSettings: SiteSettings = {
  siteName: 'BENIRAGE',
  tagline: 'Grounded • Home • Guided • Rooted',
  contactEmail: 'contact@benirage.org',
  contactPhone: '+250 788 123 456',
  address: 'Kigali, Rwanda',
  socialLinks: {
    facebook: 'https://facebook.com/benirage',
    twitter: 'https://twitter.com/benirage',
    instagram: 'https://instagram.com/benirage',
    youtube: 'https://youtube.com/benirage'
  }
};

const defaultPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Welcome to BENIRAGE Community',
    category: 'Announcements',
    content: 'We are excited to launch our new community platform...',
    image: '/images/welcome.jpg',
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Community Gathering',
    date: '2024-02-15',
    time: '14:00',
    location: 'Kigali Convention Center',
    description: 'Join us for our monthly community gathering...',
    status: 'upcoming',
    createdAt: new Date().toISOString()
  }
];

const defaultTeam: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    role: 'Community Director',
    bio: 'Leading our community initiatives with passion and dedication.',
    photo: '/images/team/john.jpg',
    email: 'john@benirage.org',
    phone: '+250 788 111 222',
    socialLinks: { linkedin: 'https://linkedin.com/in/johndoe' },
    createdAt: new Date().toISOString()
  }
];

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface ProfessionalCMSDashboardProps {
  onNavigate?: (page: string) => void;
}

const ProfessionalCMSDashboard: React.FC<ProfessionalCMSDashboardProps> = ({ onNavigate }) => {
  // State
  const [activeSection, setActiveSection] = useState<'dashboard' | 'posts' | 'events' | 'team' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showPostModal, setShowPostModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const loadData = () => {
      try {
        const storedPosts = localStorage.getItem(STORAGE_KEYS.POSTS);
        const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
        const storedTeam = localStorage.getItem(STORAGE_KEYS.TEAM);
        const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        const storedActivity = localStorage.getItem(STORAGE_KEYS.ACTIVITY);

        setPosts(storedPosts ? JSON.parse(storedPosts) : defaultPosts);
        setEvents(storedEvents ? JSON.parse(storedEvents) : defaultEvents);
        setTeam(storedTeam ? JSON.parse(storedTeam) : defaultTeam);
        setSettings(storedSettings ? JSON.parse(storedSettings) : defaultSettings);
        setActivities(storedActivity ? JSON.parse(storedActivity) : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setPosts(defaultPosts);
        setEvents(defaultEvents);
        setTeam(defaultTeam);
        setSettings(defaultSettings);
      }
    };
    loadData();
  }, []);

  // Save data to localStorage
  const saveData = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  // Add activity log
  const addActivity = useCallback((action: string, item: string, type: RecentActivity['type']) => {
    const newActivity: RecentActivity = {
      id: generateId(),
      action,
      item,
      type,
      timestamp: new Date().toISOString()
    };
    const updatedActivities = [newActivity, ...activities].slice(0, 20);
    setActivities(updatedActivities);
    saveData(STORAGE_KEYS.ACTIVITY, updatedActivities);
  }, [activities, saveData]);

  // Post CRUD operations
  const savePost = (post: Partial<BlogPost>) => {
    if (editingPost) {
      const updatedPosts = posts.map(p => 
        p.id === editingPost.id 
          ? { ...p, ...post, updatedAt: new Date().toISOString() }
          : p
      );
      setPosts(updatedPosts);
      saveData(STORAGE_KEYS.POSTS, updatedPosts);
      addActivity('Updated', post.title || editingPost.title, 'post');
    } else {
      const newPost: BlogPost = {
        id: generateId(),
        title: post.title || '',
        category: post.category || 'General',
        content: post.content || '',
        image: post.image || '',
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updatedPosts = [...posts, newPost];
      setPosts(updatedPosts);
      saveData(STORAGE_KEYS.POSTS, updatedPosts);
      addActivity('Created', newPost.title, 'post');
    }
    setShowPostModal(false);
    setEditingPost(null);
  };

  const deletePost = (id: string) => {
    const post = posts.find(p => p.id === id);
    const updatedPosts = posts.filter(p => p.id !== id);
    setPosts(updatedPosts);
    saveData(STORAGE_KEYS.POSTS, updatedPosts);
    if (post) addActivity('Deleted', post.title, 'post');
  };

  // Event CRUD operations
  const saveEvent = (event: Partial<Event>) => {
    if (editingEvent) {
      const updatedEvents = events.map(e => 
        e.id === editingEvent.id ? { ...e, ...event } : e
      );
      setEvents(updatedEvents);
      saveData(STORAGE_KEYS.EVENTS, updatedEvents);
      addActivity('Updated', event.title || editingEvent.title, 'event');
    } else {
      const newEvent: Event = {
        id: generateId(),
        title: event.title || '',
        date: event.date || '',
        time: event.time || '',
        location: event.location || '',
        description: event.description || '',
        status: 'upcoming',
        createdAt: new Date().toISOString()
      };
      const updatedEvents = [...events, newEvent];
      setEvents(updatedEvents);
      saveData(STORAGE_KEYS.EVENTS, updatedEvents);
      addActivity('Created', newEvent.title, 'event');
    }
    setShowEventModal(false);
    setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    const updatedEvents = events.filter(e => e.id !== id);
    setEvents(updatedEvents);
    saveData(STORAGE_KEYS.EVENTS, updatedEvents);
    if (event) addActivity('Deleted', event.title, 'event');
  };

  // Team CRUD operations
  const saveTeamMember = (member: Partial<TeamMember>) => {
    if (editingTeamMember) {
      const updatedTeam = team.map(t => 
        t.id === editingTeamMember.id ? { ...t, ...member } : t
      );
      setTeam(updatedTeam);
      saveData(STORAGE_KEYS.TEAM, updatedTeam);
      addActivity('Updated', member.name || editingTeamMember.name, 'team');
    } else {
      const newMember: TeamMember = {
        id: generateId(),
        name: member.name || '',
        role: member.role || '',
        bio: member.bio || '',
        photo: member.photo || '',
        email: member.email || '',
        phone: member.phone || '',
        socialLinks: member.socialLinks || {},
        createdAt: new Date().toISOString()
      };
      const updatedTeam = [...team, newMember];
      setTeam(updatedTeam);
      saveData(STORAGE_KEYS.TEAM, updatedTeam);
      addActivity('Created', newMember.name, 'team');
    }
    setShowTeamModal(false);
    setEditingTeamMember(null);
  };

  const deleteTeamMember = (id: string) => {
    const member = team.find(t => t.id === id);
    const updatedTeam = team.filter(t => t.id !== id);
    setTeam(updatedTeam);
    saveData(STORAGE_KEYS.TEAM, updatedTeam);
    if (member) addActivity('Deleted', member.name, 'team');
  };

  // Save settings
  const saveSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    saveData(STORAGE_KEYS.SETTINGS, newSettings);
    addActivity('Updated', 'Site Settings', 'settings');
  };

  // Stats for dashboard
  const stats = {
    totalPosts: posts.length,
    publishedPosts: posts.filter(p => p.status === 'published').length,
    totalEvents: events.length,
    upcomingEvents: events.filter(e => e.status === 'upcoming').length,
    teamMembers: team.length
  };

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'posts', label: 'Blog Posts', icon: FileText },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen relative text-white flex">
      {/* Background Image Overlay - Home Page Style */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(/benirage.jpeg)',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Gradient Overlay - Home Page Colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A3D5C]/95 via-[#0D4A6B]/95 to-[#0A3D5C]/95"></div>
      
      {/* Additional Gradient Overlay for Better Readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      {/* Content Container */}
      <div className="relative z-10 flex w-full">
      {/* Enhanced Professional Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} cms-professional-sidebar transition-all duration-300 flex flex-col`}>
        {/* Enhanced Logo Section */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xl">
              <span className="text-gray-900 font-bold text-xl">B</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-xl text-white tracking-tight">BENIRAGE</h1>
                <p className="text-sm text-amber-400 font-medium">Professional CMS</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-6">
          <div className="space-y-4">
            {/* Navigation Header for expanded state */}
            {sidebarOpen && (
              <div className="mb-6">
                <h2 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Main Navigation
                </h2>
              </div>
            )}
            
            <ul className="space-y-3">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id as typeof activeSection)}
                    className={`cms-professional-nav cms-nav-item w-full group relative overflow-hidden ${
                      activeSection === item.id
                        ? 'active shadow-xl'
                        : 'shadow-md hover:shadow-lg'
                    }`}
                    title={sidebarOpen ? undefined : item.label}
                  >
                    {/* Active state indicator */}
                    {activeSection === item.id && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full shadow-lg"></div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        activeSection === item.id 
                          ? 'bg-white/20 scale-110' 
                          : 'bg-gray-700/50 group-hover:bg-gray-600/70'
                      }`}>
                        <item.icon className={`w-5 h-5 transition-all duration-300 ${
                          activeSection === item.id 
                            ? 'text-white' 
                            : 'text-gray-300 group-hover:text-white'
                        }`} />
                      </div>
                      
                      {sidebarOpen && (
                        <>
                          <span className={`font-medium transition-colors duration-300 ${
                            activeSection === item.id 
                              ? 'text-white' 
                              : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {item.label}
                          </span>
                          
                          {activeSection === item.id && (
                            <ChevronRight className="w-4 h-4 ml-auto text-white opacity-90" />
                          )}
                        </>
                      )}
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Enhanced Sidebar Toggle */}
        <div className="p-6 border-t border-gray-700/50">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-300 group"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 ${
              sidebarOpen ? 'rotate-180' : 'rotate-0'
            }`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-white capitalize">{activeSection}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                />
              </div>
              <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>
              <button 
                onClick={() => onNavigate?.('logout')}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Posts"
                  value={stats.totalPosts}
                  change="+12%"
                  trend="up"
                  icon={FileText}
                  color="from-blue-500 to-blue-600"
                />
                <StatCard
                  title="Published"
                  value={stats.publishedPosts}
                  change="+8%"
                  trend="up"
                  icon={CheckCircle}
                  color="from-green-500 to-green-600"
                />
                <StatCard
                  title="Events"
                  value={stats.totalEvents}
                  change="+5%"
                  trend="up"
                  icon={Calendar}
                  color="from-amber-500 to-amber-600"
                />
                <StatCard
                  title="Team Members"
                  value={stats.teamMembers}
                  change="0%"
                  trend="neutral"
                  icon={Users}
                  color="from-purple-500 to-purple-600"
                />
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <QuickActionCard
                  title="New Post"
                  description="Create a new blog post"
                  icon={Plus}
                  color="from-blue-500 to-indigo-600"
                  onClick={() => { setEditingPost(null); setShowPostModal(true); }}
                />
                <QuickActionCard
                  title="New Event"
                  description="Schedule a community event"
                  icon={Calendar}
                  color="from-amber-500 to-orange-600"
                  onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                />
                <QuickActionCard
                  title="Add Team Member"
                  description="Add a new team member"
                  icon={Users}
                  color="from-purple-500 to-pink-600"
                  onClick={() => { setEditingTeamMember(null); setShowTeamModal(true); }}
                />
              </div>

              {/* Recent Activity & Upcoming Events */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {activities.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No recent activity</p>
                    ) : (
                      activities.slice(0, 5).map(activity => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activity.type === 'post' ? 'bg-blue-500/20 text-blue-400' :
                            activity.type === 'event' ? 'bg-amber-500/20 text-amber-400' :
                            activity.type === 'team' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {activity.type === 'post' && <FileText className="w-4 h-4" />}
                            {activity.type === 'event' && <Calendar className="w-4 h-4" />}
                            {activity.type === 'team' && <Users className="w-4 h-4" />}
                            {activity.type === 'settings' && <Settings className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{activity.action} <span className="text-amber-400">{activity.item}</span></p>
                            <p className="text-xs text-gray-400">{formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {events.filter(e => e.status === 'upcoming').length === 0 ? (
                      <p className="text-gray-400 text-center py-4">No upcoming events</p>
                    ) : (
                      events.filter(e => e.status === 'upcoming').slice(0, 4).map(event => (
                        <div key={event.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700/30">
                          <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex flex-col items-center justify-center">
                            <span className="text-xs text-amber-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-bold text-amber-400">{new Date(event.date).getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{event.title}</p>
                            <p className="text-xs text-gray-400 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {event.location}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Posts Section */}
          {activeSection === 'posts' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Blog Posts</h3>
                <button
                  onClick={() => { setEditingPost(null); setShowPostModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Post</span>
                </button>
              </div>

              <div className="grid gap-4">
                {posts.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No posts yet. Create your first post!</p>
                  </div>
                ) : (
                  posts.filter(p => 
                    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.category.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(post => (
                    <div key={post.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-amber-500/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-white">{post.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              post.status === 'published' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {post.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{post.category}</p>
                          <p className="text-sm text-gray-300 line-clamp-2">{post.content}</p>
                          <p className="text-xs text-gray-500 mt-2">Created: {formatDate(post.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => { setEditingPost(post); setShowPostModal(true); }}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Events Section */}
          {activeSection === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Events</h3>
                <button
                  onClick={() => { setEditingEvent(null); setShowEventModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Event</span>
                </button>
              </div>

              <div className="grid gap-4">
                {events.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                    <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No events yet. Schedule your first event!</p>
                  </div>
                ) : (
                  events.filter(e => 
                    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.location.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(event => (
                    <div key={event.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-amber-500/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-xl bg-amber-500/20 flex flex-col items-center justify-center">
                            <span className="text-xs text-amber-400">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-2xl font-bold text-amber-400">{new Date(event.date).getDate()}</span>
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                event.status === 'upcoming' ? 'bg-blue-500/20 text-blue-400' :
                                event.status === 'ongoing' ? 'bg-green-500/20 text-green-400' :
                                event.status === 'completed' ? 'bg-gray-500/20 text-gray-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {event.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 flex items-center mb-1">
                              <Clock className="w-4 h-4 mr-1" />
                              {event.time}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center mb-2">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </p>
                            <p className="text-sm text-gray-300 line-clamp-2">{event.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { setEditingEvent(event); setShowEventModal(true); }}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Team Section */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Team Members</h3>
                <button
                  onClick={() => { setEditingTeamMember(null); setShowTeamModal(true); }}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {team.length === 0 ? (
                  <div className="col-span-full bg-gray-800/50 rounded-xl border border-gray-700 p-12 text-center">
                    <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No team members yet. Add your first team member!</p>
                  </div>
                ) : (
                  team.filter(m => 
                    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    m.role.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(member => (
                    <div key={member.id} className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-amber-500/50 transition-colors">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
                          {member.photo ? (
                            <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <User className="w-10 h-10 text-gray-900" />
                          )}
                        </div>
                        <h4 className="text-lg font-semibold text-white mb-1">{member.name}</h4>
                        <p className="text-sm text-amber-400 mb-3">{member.role}</p>
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{member.bio}</p>
                        <div className="flex items-center space-x-2 text-gray-400 text-sm mb-4">
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => { setEditingTeamMember(member); setShowTeamModal(true); }}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTeamMember(member.id)}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <SettingsSection settings={settings} onSave={saveSettings} />
          )}
        </div>
      </main>

      {/* Modals */}
      {showPostModal && (
        <PostModal
          post={editingPost}
          onSave={savePost}
          onClose={() => { setShowPostModal(false); setEditingPost(null); }}
        />
      )}

      {showEventModal && (
        <EventModal
          event={editingEvent}
          onSave={saveEvent}
          onClose={() => { setShowEventModal(false); setEditingEvent(null); }}
        />
      )}

      {showTeamModal && (
        <TeamMemberModal
          member={editingTeamMember}
          onSave={saveTeamMember}
          onClose={() => { setShowTeamModal(false); setEditingTeamMember(null); }}
        />
      )}
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color }) => (
  <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-amber-500/30 transition-colors">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={`flex items-center space-x-1 text-sm ${
        trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-400'
      }`}>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4" />}
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
    <p className="text-sm text-gray-400">{title}</p>
  </div>
);

// Quick Action Card Component
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover:border-amber-500/50 transition-all text-left group"
  >
    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    <p className="text-sm text-gray-400">{description}</p>
  </button>
);

// Post Modal Component
interface PostModalProps {
  post: BlogPost | null;
  onSave: (post: Partial<BlogPost>) => void;
  onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    category: post?.category || 'General',
    content: post?.content || '',
    image: post?.image || '',
    status: post?.status || 'draft'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{post ? 'Edit Post' : 'New Post'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="Enter post title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="General">General</option>
              <option value="Announcements">Announcements</option>
              <option value="Community">Community</option>
              <option value="Events">Events</option>
              <option value="Culture">Culture</option>
              <option value="Spiritual">Spiritual</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 min-h-[150px]"
              placeholder="Write your post content..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Featured Image URL</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Post</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Event Modal Component
interface EventModalProps {
  event: Event | null;
  onSave: (event: Partial<Event>) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    description: event?.description || '',
    status: event?.status || 'upcoming'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{event ? 'Edit Event' : 'New Event'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Event Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="Enter event title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="Enter event location"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 min-h-[100px]"
              placeholder="Describe the event..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Event['status'] })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Event</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Team Member Modal Component
interface TeamMemberModalProps {
  member: TeamMember | null;
  onSave: (member: Partial<TeamMember>) => void;
  onClose: () => void;
}

const TeamMemberModal: React.FC<TeamMemberModalProps> = ({ member, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    bio: member?.bio || '',
    photo: member?.photo || '',
    email: member?.email || '',
    phone: member?.phone || '',
    socialLinks: member?.socialLinks || {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{member ? 'Edit Team Member' : 'Add Team Member'}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-700 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="Enter full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="Enter role/position"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500 min-h-[100px]"
              placeholder="Write a short bio..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photo URL</label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="email@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="+250 788 123 456"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.socialLinks.linkedin || ''}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Twitter URL</label>
              <input
                type="url"
                value={formData.socialLinks.twitter || ''}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-medium rounded-lg transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Settings Section Component
interface SettingsSectionProps {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Information */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-amber-400" />
            Site Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-amber-400" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Link className="w-5 h-5 mr-2 text-amber-400" />
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Facebook className="w-4 h-4 mr-2 text-blue-400" />
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, facebook: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Twitter className="w-4 h-4 mr-2 text-sky-400" />
                Twitter
              </label>
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Instagram className="w-4 h-4 mr-2 text-pink-400" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, instagram: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                <Youtube className="w-4 h-4 mr-2 text-red-400" />
                YouTube
              </label>
              <input
                type="url"
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, youtube: e.target.value } })}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 ${
              saved 
                ? 'bg-green-500 text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-gray-900'
            }`}
          >
            {saved ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalCMSDashboard;