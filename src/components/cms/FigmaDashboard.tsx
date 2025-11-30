import React from 'react';
import { 
  BarChart3, FileText, Users, MessageSquare, Calendar, 
  TrendingUp, Activity, Eye, Heart, Star,
  ArrowUpRight, ArrowDownRight, Plus, ChevronRight, Zap,
  Clock
} from 'lucide-react';

interface FigmaDashboardProps {
  onNavigate: (page: string) => void;
}

interface StatCard {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentColor: string;
}

const FigmaDashboard: React.FC<FigmaDashboardProps> = ({ onNavigate }) => {
  const stats: StatCard[] = [
    {
      title: 'Total Content',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: FileText,
      color: 'from-blue-400 to-blue-500',
      accentColor: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: '1,293',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-emerald-400 to-emerald-500',
      accentColor: 'bg-emerald-500'
    },
    {
      title: 'Monthly Visitors',
      value: '45.2K',
      change: '+23.1%',
      trend: 'up',
      icon: Eye,
      color: 'from-violet-400 to-violet-500',
      accentColor: 'bg-violet-500'
    },
    {
      title: 'Engagement Rate',
      value: '68.4%',
      change: '-2.4%',
      trend: 'down',
      icon: Heart,
      color: 'from-rose-400 to-rose-500',
      accentColor: 'bg-rose-500'
    }
  ];

  const quickActions = [
    {
      title: 'Create Content',
      description: 'Start writing a new article',
      icon: Plus,
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => onNavigate('content-editor')
    },
    {
      title: 'Manage Users',
      description: 'Review applications',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => onNavigate('users')
    },
    {
      title: 'View Analytics',
      description: 'Check performance',
      icon: BarChart3,
      color: 'from-amber-500 to-amber-600',
      onClick: () => onNavigate('analytics')
    }
  ];

  const recentActivity = [
    {
      action: 'New article published',
      user: 'Admin User',
      time: '2 hours ago',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-400'
    },
    {
      action: 'User registration',
      user: 'John Doe',
      time: '4 hours ago',
      icon: Users,
      color: 'bg-emerald-500/10 text-emerald-400'
    },
    {
      action: 'Comment moderation',
      user: 'Editor',
      time: '6 hours ago',
      icon: MessageSquare,
      color: 'bg-violet-500/10 text-violet-400'
    },
    {
      action: 'Newsletter sent',
      user: 'System',
      time: '1 day ago',
      icon: Activity,
      color: 'bg-amber-500/10 text-amber-400'
    },
    {
      action: 'Content scheduled',
      user: 'Marketing Team',
      time: '1 day ago',
      icon: Clock,
      color: 'bg-pink-500/10 text-pink-400'
    }
  ];

  const topContent = [
    { title: 'Rwanda Cultural Heritage', views: '12.4K', engagement: '89%', rank: 1 },
    { title: 'Community Stories Series', views: '8.7K', engagement: '76%', rank: 2 },
    { title: 'Traditional Crafts Guide', views: '6.2K', engagement: '68%', rank: 3 },
    { title: 'Modern Agriculture Techniques', views: '4.8K', engagement: '72%', rank: 4 },
    { title: 'Digital Innovation Summit', views: '3.9K', engagement: '81%', rank: 5 }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image Overlay - Home Page Style */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(/benirage.jpeg)',
          backgroundPosition: 'center'
        }}
      ></div>
      
      {/* Gradient Overlay - Home Page Colors */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A3D5C]/90 via-[#0D4A6B]/90 to-[#0A3D5C]/90"></div>
      
      {/* Additional Gradient Overlay for Better Readability */}
      <div className="fixed inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-8">
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Dashboard Overview
              </h1>
              <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-semibold rounded-full shadow-lg">
                PRO
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Monitor your content performance and system health
            </p>
          </div>
          <button 
            onClick={() => onNavigate('calendar')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-xl hover:bg-white/10 hover:border-white/20 transition-all shadow-lg font-medium text-sm"
          >
            <Calendar className="w-4 h-4" />
            Content Calendar
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Stats Cards - Full Width Top */}
          <div className="col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  onClick={() => onNavigate('analytics')}
                >
                  <div className={`absolute inset-0 ${stat.accentColor} opacity-0 group-hover:opacity-5 transition-opacity blur-xl rounded-2xl`}></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        stat.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                        stat.trend === 'down' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : stat.trend === 'down' ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : null}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">
                        {stat.value}
                      </h3>
                      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions - Left Column */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Quick Actions
                </h2>
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <div 
                    key={index} 
                    className="bg-white/5 rounded-xl border border-white/10 p-4 cursor-pointer group hover:bg-white/10 hover:border-white/20 transition-all"
                    onClick={action.onClick}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg flex-shrink-0`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-white mb-0.5">
                          {action.title}
                        </h3>
                        <p className="text-xs text-slate-400">{action.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Content - Middle Column */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Top Performing Content</h2>
                <Star className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-3">
                {topContent.map((content, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10" 
                    onClick={() => onNavigate('content-list')}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${
                      content.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                      content.rank === 2 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                      content.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-white/10'
                    }`}>
                      {content.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {content.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {content.views} views
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30 flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">{content.engagement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity - Right Column */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">Activity</h2>
                <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                      <div className={`w-9 h-9 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {activity.user}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Status - Full Width Bottom */}
          <div className="col-span-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">System Health</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
                  <span className="text-sm font-medium text-slate-300">All systems operational</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-emerald-400 text-sm">Database</h3>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <p className="text-xs text-emerald-300/80">Optimal performance</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-emerald-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{width: '98%'}}></div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">98%</span>
                  </div>
                </div>
                <div className="p-5 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-400 text-sm">API</h3>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-blue-400" />
                    </div>
                  </div>
                  <p className="text-xs text-blue-300/80">99.9% uptime</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-blue-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{width: '99.9%'}}></div>
                    </div>
                    <span className="text-xs font-semibold text-blue-400">99.9%</span>
                  </div>
                </div>
                <div className="p-5 bg-violet-500/10 rounded-xl border border-violet-500/20 hover:bg-violet-500/15 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-violet-400 text-sm">Storage</h3>
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-violet-400" />
                    </div>
                  </div>
                  <p className="text-xs text-violet-300/80">2.1GB available</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-violet-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-violet-400 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <span className="text-xs font-semibold text-violet-400">65%</span>
                  </div>
                </div>
                <div className="p-5 bg-amber-500/10 rounded-xl border border-amber-500/20 hover:bg-amber-500/15 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-amber-400 text-sm">CDN</h3>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <p className="text-xs text-amber-300/80">Fast delivery</p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-amber-500/20 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <span className="text-xs font-semibold text-amber-400">92%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaDashboard;