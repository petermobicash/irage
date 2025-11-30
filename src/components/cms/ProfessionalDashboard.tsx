import React, { useState, useEffect } from 'react';
import { 
  Users, FileText, Eye, Clock, 
  Activity, BarChart3, Zap, Target,
  ArrowUp, ArrowDown, Plus, CheckCircle
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import '../../styles/cms-dark-theme.css';

interface DashboardStats {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivity {
  id: string;
  type: 'content' | 'user' | 'comment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'error';
  user: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: 'content' | 'user' | 'system' | 'analytics';
}

const ProfessionalDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  // Mock data for dashboard stats
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const dashboardStats: DashboardStats[] = [
        {
          title: 'Total Content',
          value: 1247,
          change: 12.5,
          changeType: 'increase',
          icon: FileText,
          color: 'primary'
        },
        {
          title: 'Active Users',
          value: 3892,
          change: 8.2,
          changeType: 'increase',
          icon: Users,
          color: 'success'
        },
        {
          title: 'Page Views',
          value: '45.2K',
          change: 15.7,
          changeType: 'increase',
          icon: Eye,
          color: 'info'
        },
        {
          title: 'Pending Reviews',
          value: 23,
          change: -5.1,
          changeType: 'decrease',
          icon: Clock,
          color: 'warning'
        }
      ];

      const activityData: RecentActivity[] = [
        {
          id: '1',
          type: 'content',
          title: 'New blog post published',
          description: '"Introduction to Digital Marketing" was published',
          timestamp: '2 minutes ago',
          status: 'success',
          user: 'Sarah Johnson'
        },
        {
          id: '2',
          type: 'user',
          title: 'New user registered',
          description: 'Michael Chen joined the platform',
          timestamp: '15 minutes ago',
          status: 'success',
          user: 'System'
        },
        {
          id: '3',
          type: 'comment',
          title: 'Comment awaiting moderation',
          description: 'New comment on "Web Design Trends 2024"',
          timestamp: '1 hour ago',
          status: 'pending',
          user: 'AI Assistant'
        },
        {
          id: '4',
          type: 'system',
          title: 'Backup completed',
          description: 'Daily backup successfully completed',
          timestamp: '3 hours ago',
          status: 'success',
          user: 'System'
        },
        {
          id: '5',
          type: 'content',
          title: 'Content scheduled',
          description: 'Article scheduled for tomorrow at 9:00 AM',
          timestamp: '5 hours ago',
          status: 'success',
          user: 'Emily Davis'
        }
      ];

      setStats(dashboardStats);
      setRecentActivity(activityData);
      setLoading(false);
    };

    loadDashboardData();
  }, [selectedTimeframe]);

  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Create New Content',
      description: 'Start writing a new blog post or page',
      icon: Plus,
      action: () => console.log('Create content'),
      category: 'content'
    },
    {
      id: '2',
      title: 'Manage Users',
      description: 'Add or edit user permissions',
      icon: Users,
      action: () => console.log('Manage users'),
      category: 'user'
    },
    {
      id: '3',
      title: 'View Analytics',
      description: 'Check performance metrics',
      icon: BarChart3,
      action: () => console.log('View analytics'),
      category: 'analytics'
    },
    {
      id: '4',
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Zap,
      action: () => console.log('System settings'),
      category: 'system'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'content': return FileText;
      case 'user': return Users;
      case 'comment': return Activity;
      case 'system': return CheckCircle;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatColorClass = (color: string) => {
    switch (color) {
      case 'primary': return 'from-amber-500 to-orange-600';
      case 'success': return 'from-green-500 to-emerald-600';
      case 'warning': return 'from-yellow-500 to-orange-500';
      case 'error': return 'from-red-500 to-pink-600';
      case 'info': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const formatChange = (change: number, changeType: 'increase' | 'decrease' | 'neutral') => {
    const getIconAndColor = (type: 'increase' | 'decrease' | 'neutral') => {
      switch (type) {
        case 'increase':
          return { icon: <ArrowUp className="w-4 h-4" />, color: 'text-green-400' };
        case 'decrease':
          return { icon: <ArrowDown className="w-4 h-4" />, color: 'text-red-400' };
        case 'neutral':
          return { icon: <span className="w-4 h-4 flex items-center justify-center text-gray-400">−</span>, color: 'text-gray-400' };
      }
    };
    
    const { icon, color } = getIconAndColor(changeType);
    
    return (
      <div className={`flex items-center space-x-1 ${color}`}>
        {icon}
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="cms-dark-theme min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="cms-fade-in">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8 cms-skeleton"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="cms-card-dark p-6">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-4 cms-skeleton"></div>
                  <div className="h-8 bg-gray-700 rounded w-16 mb-2 cms-skeleton"></div>
                  <div className="h-4 bg-gray-700 rounded w-20 cms-skeleton"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cms-dark-theme min-h-screen cms-fade-in">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="cms-heading-xl mb-2">Welcome back!</h1>
            <p className="cms-text-secondary text-lg">Here's what's happening with your content today.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as '7d' | '30d' | '90d')}
              className="cms-select-dark"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            
            <Button className="cms-btn-primary-dark" icon={Plus}>
              Quick Action
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={stat.title} className={`cms-card-dark p-6 cms-fade-in cms-delay-${index}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getStatColorClass(stat.color)} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {formatChange(stat.change, stat.changeType)}
              </div>
              
              <div>
                <h3 className="cms-text-secondary text-sm font-medium mb-1">{stat.title}</h3>
                <p className="cms-heading-md text-white">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="cms-card-dark p-6 cms-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="cms-heading-lg text-white">Quick Actions</h2>
            <span className="cms-text-tertiary text-sm">Most commonly used tasks</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`cms-card-interactive p-4 text-left hover:shadow-amber transition-all duration-300 cms-fade-in cms-delay-${index}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="cms-text-primary font-medium mb-1">{action.title}</h3>
                    <p className="cms-text-tertiary text-sm">{action.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Activity */}
          <div className="lg:col-span-2 cms-card-dark p-6 cms-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="cms-heading-lg text-white">Recent Activity</h2>
              <Button variant="outline" size="sm" className="cms-btn-ghost-dark">
                View All
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div 
                    key={activity.id}
                    className={`flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-800 transition-colors cms-fade-in cms-delay-${index}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'content' ? 'bg-blue-500/20' :
                      activity.type === 'user' ? 'bg-green-500/20' :
                      activity.type === 'comment' ? 'bg-yellow-500/20' :
                      'bg-purple-500/20'
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        activity.type === 'content' ? 'text-blue-400' :
                        activity.type === 'user' ? 'text-green-400' :
                        activity.type === 'comment' ? 'text-yellow-400' :
                        'text-purple-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="cms-text-primary font-medium">{activity.title}</h3>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(activity.status)}`}></div>
                      </div>
                      <p className="cms-text-secondary text-sm mb-1">{activity.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="cms-text-tertiary text-xs">{activity.timestamp}</span>
                        <span className="cms-text-tertiary text-xs">by {activity.user}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Performance Overview */}
          <div className="cms-card-dark p-6 cms-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="cms-heading-lg text-white">Performance</h2>
              <Target className="w-5 h-5 text-amber-400" />
            </div>
            
            <div className="space-y-6">
              {/* Engagement Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="cms-text-secondary text-sm">Engagement Rate</span>
                  <span className="cms-text-accent font-medium">78.5%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full" style={{ width: '78.5%' }}></div>
                </div>
              </div>
              
              {/* Content Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="cms-text-secondary text-sm">Content Quality</span>
                  <span className="text-green-400 font-medium">92.3%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '92.3%' }}></div>
                </div>
              </div>
              
              {/* User Satisfaction */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="cms-text-secondary text-sm">User Satisfaction</span>
                  <span className="text-blue-400 font-medium">85.7%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 h-2 rounded-full" style={{ width: '85.7%' }}></div>
                </div>
              </div>
              
              {/* System Health */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="cms-text-secondary text-sm">System Health</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">99.9%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalDashboard;