/**
 * Content Integration Layout
 * Main layout component that combines all dynamic content displays
 * for Events, Blog Posts, Stories, and Team Members
 */

import React, { useState } from 'react';
import { Calendar, FileText, BookOpen, Users, Settings, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import DynamicEvents from './DynamicEvents';
import DynamicBlogPosts from './DynamicBlogPosts';
import DynamicStories from './DynamicStories';
import DynamicTeamMembers from './DynamicTeamMembers';

interface ContentIntegrationLayoutProps {
  className?: string;
  showEvents?: boolean;
  showBlogPosts?: boolean;
  showStories?: boolean;
  showTeamMembers?: boolean;
  eventLimit?: number;
  blogPostLimit?: number;
  storyLimit?: number;
  teamMemberLimit?: number;
  onRefresh?: () => void;
}

const ContentIntegrationLayout: React.FC<ContentIntegrationLayoutProps> = ({
  className = '',
  showEvents = true,
  showBlogPosts = true,
  showStories = true,
  showTeamMembers = true,
  eventLimit = 6,
  blogPostLimit = 6,
  storyLimit = 6,
  teamMemberLimit = 8,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'blog' | 'stories' | 'team'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'blog', label: 'Blog Posts', icon: FileText },
    { id: 'stories', label: 'Stories', icon: BookOpen },
    { id: 'team', label: 'Team', icon: Users }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Events</h3>
          <p className="text-2xl font-bold text-blue-600">Dynamic</p>
          <p className="text-sm text-gray-500">Automatically updated</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Posts</h3>
          <p className="text-2xl font-bold text-green-600">Dynamic</p>
          <p className="text-sm text-gray-500">Content from CMS</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stories</h3>
          <p className="text-2xl font-bold text-purple-600">Dynamic</p>
          <p className="text-sm text-gray-500">Multimedia content</p>
        </Card>

        <Card className="text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Members</h3>
          <p className="text-2xl font-bold text-orange-600">Dynamic</p>
          <p className="text-sm text-gray-500">Auto-synced profiles</p>
        </Card>
      </div>

      {/* Overview Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Featured Events */}
        {showEvents && (
          <div>
            <DynamicEvents 
              limit={3}
              showFilters={false}
              showViewAll={true}
              onViewAll={() => setActiveTab('events')}
            />
          </div>
        )}

        {/* Featured Blog Posts */}
        {showBlogPosts && (
          <div>
            <DynamicBlogPosts 
              limit={3}
              showFilters={false}
              showViewAll={true}
              onViewAll={() => setActiveTab('blog')}
            />
          </div>
        )}

        {/* Featured Stories */}
        {showStories && (
          <div>
            <DynamicStories 
              limit={3}
              showFilters={false}
              showViewAll={true}
              onViewAll={() => setActiveTab('stories')}
            />
          </div>
        )}

        {/* Featured Team Members */}
        {showTeamMembers && (
          <div>
            <DynamicTeamMembers 
              limit={4}
              showFilters={false}
              showViewAll={true}
              onViewAll={() => setActiveTab('team')}
            />
          </div>
        )}
      </div>

      {/* Real-time Features Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="text-center py-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-blue-900">Real-Time Content Integration</h3>
          </div>
          <p className="text-gray-600 mb-4">
            This layout automatically pulls content from your CMS tables and updates in real-time.
            No manual updates needed - just add content in your CMS!
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div>•</div>
            <span>Automatic Data Sync</span>
            <div>•</div>
            <span>Zero Manual Updates</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'events':
        return showEvents ? (
          <DynamicEvents 
            limit={eventLimit}
            showFilters={true}
            showViewAll={false}
          />
        ) : (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Events Display Disabled</h3>
            <p className="text-gray-500">Events component is not enabled in this layout.</p>
          </Card>
        );

      case 'blog':
        return showBlogPosts ? (
          <DynamicBlogPosts 
            limit={blogPostLimit}
            showFilters={true}
            showViewAll={false}
          />
        ) : (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Blog Posts Display Disabled</h3>
            <p className="text-gray-500">Blog posts component is not enabled in this layout.</p>
          </Card>
        );

      case 'stories':
        return showStories ? (
          <DynamicStories 
            limit={storyLimit}
            showFilters={true}
            showViewAll={false}
          />
        ) : (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Stories Display Disabled</h3>
            <p className="text-gray-500">Stories component is not enabled in this layout.</p>
          </Card>
        );

      case 'team':
        return showTeamMembers ? (
          <DynamicTeamMembers 
            limit={teamMemberLimit}
            showFilters={true}
            showViewAll={false}
          />
        ) : (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Team Members Display Disabled</h3>
            <p className="text-gray-500">Team members component is not enabled in this layout.</p>
          </Card>
        );

      default:
        return renderOverview();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Integration</h2>
          <p className="text-gray-600">Automatically pulled from your CMS</p>
        </div>
        {onRefresh && (
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            icon={RefreshCw}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh All'}
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <Card>
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isEnabled = (
              (tab.id === 'events' && showEvents) ||
              (tab.id === 'blog' && showBlogPosts) ||
              (tab.id === 'stories' && showStories) ||
              (tab.id === 'team' && showTeamMembers) ||
              tab.id === 'overview'
            );

            return (
              <button
                key={tab.id}
                onClick={() => isEnabled && setActiveTab(tab.id as any)}
                disabled={!isEnabled}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : isEnabled 
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50' 
                      : 'text-gray-300 cursor-not-allowed'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>

      {/* Integration Status */}
      <Card className="bg-gray-50 border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Content Integration Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Auto-sync enabled</span>
            <span>•</span>
            <span>Real-time updates</span>
            <span>•</span>
            <span>CMS powered</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ContentIntegrationLayout;